import { NextResponse } from "next/server";
import { validateLead } from "@/lib/leads";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", errors: { body: "Body must be valid JSON" } }, { status: 400 });
  }

  const result = validateLead(body);
  if (!result.ok) {
    return NextResponse.json({ error: "Invalid lead payload", errors: result.errors }, { status: 400 });
  }

  try {
    // RLS lets anon insert but not read, so no `.select()` on the insert.
    const { error } = await createPublicClient().from("leads").insert(result.value);
    if (error) throw error;
    return NextResponse.json({ data: { received: true } }, { status: 201 });
  } catch (err) {
    // Log only code/message: PostgREST `details` can echo the rejected row (PII).
    const { code, message } = (err ?? {}) as { code?: string; message?: string };
    console.error("POST /api/leads failed", { code, message });
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
