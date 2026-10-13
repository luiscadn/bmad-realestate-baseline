import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchListingBySlug = vi.fn();
vi.mock("@/lib/listings", () => ({ fetchListingBySlug: (...a: unknown[]) => fetchListingBySlug(...a) }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({}) }));

import { GET } from "./route";

const get = (slug: string) =>
  GET(new Request(`http://localhost/api/listings/${slug}`), { params: Promise.resolve({ slug }) });

describe("GET /api/listings/[slug]", () => {
  beforeEach(() => {
    fetchListingBySlug.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 200 with { data: listing }", async () => {
    const listing = { id: "1", slug: "casa-en-granada", images: [], agent: { id: "a" } };
    fetchListingBySlug.mockResolvedValue(listing);
    const res = await get("casa-en-granada");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: listing });
    expect(fetchListingBySlug).toHaveBeenCalledWith({}, "casa-en-granada");
  });

  it("returns 404 when the listing is missing or unpublished", async () => {
    fetchListingBySlug.mockResolvedValue(null);
    const res = await get("nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Listing not found" });
  });

  it("returns 500 when the query fails", async () => {
    fetchListingBySlug.mockRejectedValue(new Error("db down"));
    const res = await get("x");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to load listing" });
  });
});
