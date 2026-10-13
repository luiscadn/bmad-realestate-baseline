import { NextResponse } from "next/server";
import { generateSlug, validateListingInput } from "@/lib/agent-listings";
import { authenticate, dbError, readJson } from "@/lib/agent-route";
import { DEFAULT_LIMIT, MAX_LIMIT, MAX_PAGE } from "@/lib/listings-query";

export const dynamic = "force-dynamic";

/** Lists the caller's own listings (drafts included), newest first. */
export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;

  const params = new URL(request.url).searchParams;
  const errors: Record<string, string> = {};
  const num = (key: string, fallback: number, max: number) => {
    const raw = params.get(key)?.trim();
    if (!raw) return fallback;
    const n = Number(raw);
    if (!/^\d+$/.test(raw) || n < 1 || n > max) {
      errors[key] = `must be an integer between 1 and ${max}`;
      return fallback;
    }
    return n;
  };
  const page = num("page", 1, MAX_PAGE);
  const limit = num("limit", DEFAULT_LIMIT, MAX_LIMIT);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Invalid query parameters", errors }, { status: 400 });

  const from = (page - 1) * limit;
  const { data, error, count } = await auth.supabase
    .from("listings")
    .select("*, images:listing_images(*)", { count: "exact" })
    .eq("agent_id", auth.user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + limit - 1);

  // Page past the end: report an empty page rather than failing.
  if (error && error.code !== "PGRST103") return dbError("GET /api/agent/listings", error);
  const total = count ?? 0;
  return NextResponse.json({
    data: error ? [] : (data ?? []),
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  });
}

/** Creates a listing owned by the caller; `published: true` publishes it immediately. */
export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const result = validateListingInput(parsed.body, false);
  if (!result.ok) return NextResponse.json({ error: "Invalid listing payload", errors: result.errors }, { status: 400 });

  const { fields, published } = result.value;
  const row = {
    ...fields,
    slug: fields.slug ?? generateSlug(fields.title as string),
    agent_id: auth.user.id,
    published_at: published ? new Date().toISOString() : null,
  };

  const { data, error } = await auth.supabase.from("listings").insert(row).select("*").single();
  if (error) {
    return dbError("POST /api/agent/listings", error, {
      "23505": [409, "A listing with this slug already exists"],
      "23503": [403, "An agent profile is required to create listings"],
    });
  }
  return NextResponse.json({ data }, { status: 201 });
}
