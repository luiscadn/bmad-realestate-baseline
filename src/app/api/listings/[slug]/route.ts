import { NextResponse } from "next/server";
import { fetchListingBySlug } from "@/lib/listings";
import { createPublicClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const listing = await fetchListingBySlug(createPublicClient(), slug);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    return NextResponse.json({ data: listing });
  } catch (err) {
    console.error("GET /api/listings/[slug] failed", err);
    return NextResponse.json({ error: "Failed to load listing" }, { status: 500 });
  }
}
