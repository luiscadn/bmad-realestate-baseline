import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchFeaturedListings } from "./featured-listings";

function client(result: { data: unknown; error: { message: string } | null }) {
  const calls: [string, unknown[]][] = [];
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "not", "lte", "order"]) {
    builder[m] = vi.fn((...args: unknown[]) => (calls.push([m, args]), builder));
  }
  builder.limit = vi.fn((...args: unknown[]) => (calls.push(["limit", args]), Promise.resolve(result)));
  return { supabase: { from: () => builder } as unknown as SupabaseClient, calls };
}

describe("fetchFeaturedListings", () => {
  it("orders featured first then newest, limits, and sorts images by position", async () => {
    const { supabase, calls } = client({
      data: [{ id: "1", images: [{ position: 2, url: "b" }, { position: 0, url: "a" }] }],
      error: null,
    });
    const rows = await fetchFeaturedListings(supabase, 3);
    expect(calls.filter(([m]) => m === "order").map(([, a]) => a[0])).toEqual(["featured", "published_at", "id"]);
    expect(calls.at(-1)).toEqual(["limit", [3]]);
    expect(rows[0].images.map((i) => i.url)).toEqual(["a", "b"]);
  });

  it("returns an empty list for null data and throws on error", async () => {
    expect(await fetchFeaturedListings(client({ data: null, error: null }).supabase)).toEqual([]);
    await expect(fetchFeaturedListings(client({ data: null, error: { message: "boom" } }).supabase)).rejects.toThrow("boom");
  });
});
