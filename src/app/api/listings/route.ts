import { NextResponse } from "next/server";
import { fetchListings } from "@/lib/listings";
import { parseListingsQuery } from "@/lib/listings-query";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = parseListingsQuery(new URL(request.url).searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.errors }, { status: 400 });
  }

  try {
    return NextResponse.json(await fetchListings(createPublicClient(), parsed.value));
  } catch (err) {
    console.error("GET /api/listings failed", err);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}
