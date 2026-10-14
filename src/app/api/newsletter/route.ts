import { NextResponse } from "next/server";
import { parseNewsletterBody } from "@/lib/newsletter";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", errors: { body: "Body must be valid JSON" } }, { status: 400 });
  }

  const result = parseNewsletterBody(body);
  if (!result.ok) {
    return NextResponse.json({ error: "Invalid newsletter payload", errors: result.errors }, { status: 400 });
  }

  try {
    // RLS lets anon insert but not read, so no `.select()` and no upsert (ON CONFLICT needs a select policy).
    const { error } = await createPublicClient().from("newsletter_subscribers").insert(result.value);
    if (error) {
      // Idempotent: an already-subscribed email (or a race) is a success, never a 500.
      if (error.code === UNIQUE_VIOLATION) return NextResponse.json({ data: { subscribed: true } }, { status: 200 });
      throw error;
    }
    return NextResponse.json({ data: { subscribed: true } }, { status: 201 });
  } catch (err) {
    // Log only code/message: PostgREST `details` can echo the rejected row (PII).
    const { code, message } = (err ?? {}) as { code?: string; message?: string };
    console.error("POST /api/newsletter failed", { code, message });
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
