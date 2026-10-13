import { NextResponse } from "next/server";
import { UUID_RE, validateListingInput } from "@/lib/agent-listings";
import { authenticate, dbError, readJson } from "@/lib/agent-route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Listing not found" }, { status: 404 });
const badId = () =>
  NextResponse.json({ error: "Invalid listing id", errors: { id: "id must be a valid UUID" } }, { status: 400 });

export async function GET(request: Request, { params }: Ctx) {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!UUID_RE.test(id)) return badId();

  const { data, error } = await auth.supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("id", id)
    .eq("agent_id", auth.user.id)
    .maybeSingle();
  if (error) return dbError("GET /api/agent/listings/[id]", error);
  return data ? NextResponse.json({ data }) : notFound();
}

/** Partial update; `published: true|false` publishes / unpublishes. */
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!UUID_RE.test(id)) return badId();

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const result = validateListingInput(parsed.body, true);
  if (!result.ok) return NextResponse.json({ error: "Invalid listing payload", errors: result.errors }, { status: 400 });

  const { fields, published } = result.value;
  const update: Record<string, unknown> = { ...fields };
  if (published !== undefined) update.published_at = published ? new Date().toISOString() : null;

  const { data, error } = await auth.supabase
    .from("listings")
    .update(update)
    .eq("id", id)
    .eq("agent_id", auth.user.id)
    .select("*")
    .maybeSingle();
  if (error) return dbError("PATCH /api/agent/listings/[id]", error, { "23505": [409, "A listing with this slug already exists"] });
  return data ? NextResponse.json({ data }) : notFound();
}

export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!UUID_RE.test(id)) return badId();

  const { data, error } = await auth.supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("agent_id", auth.user.id)
    .select("id")
    .maybeSingle();
  if (error) return dbError("DELETE /api/agent/listings/[id]", error);
  return data ? NextResponse.json({ data: { id: data.id, deleted: true } }) : notFound();
}
