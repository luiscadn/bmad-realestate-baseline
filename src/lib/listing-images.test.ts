import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  ListingImageError,
  buildImagePath,
  moveImage,
  nextPosition,
  orderImages,
  deleteListingImage,
  pathFromPublicUrl,
  reorderListingImages,
  validateImageFile,
} from "./listing-images";

describe("validateImageFile", () => {
  it("accepts a small jpeg", () => {
    expect(() => validateImageFile({ type: "image/jpeg", size: 1000 })).not.toThrow();
  });
  it("rejects unsupported types and bad sizes", () => {
    expect(() => validateImageFile({ type: "application/pdf", size: 10 })).toThrow(ListingImageError);
    expect(() => validateImageFile({ type: "image/png", size: 0 })).toThrow(ListingImageError);
    expect(() => validateImageFile({ type: "image/png", size: 11 * 1024 * 1024 })).toThrow(ListingImageError);
  });
});

describe("buildImagePath / pathFromPublicUrl", () => {
  it("puts the listing id in the first folder and round-trips from a public URL", () => {
    const path = buildImagePath("abc", "image/webp", "u1");
    expect(path).toBe("abc/u1.webp");
    expect(pathFromPublicUrl(`http://x/storage/v1/object/public/listing-images/${path}`)).toBe(path);
    expect(pathFromPublicUrl("http://x/other.png")).toBeNull();
  });
  it("ignores query strings and survives malformed encoding", () => {
    const base = "http://x/storage/v1/object/public/listing-images/";
    expect(pathFromPublicUrl(`${base}abc/u1.webp?t=1`)).toBe("abc/u1.webp");
    expect(pathFromPublicUrl(`${base}abc/%E0%A4%A.webp`)).toBeNull();
    expect(pathFromPublicUrl(base)).toBeNull();
  });
});

/** Minimal chainable fake: every query resolves to `result`. */
function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "update", "delete"]) chain[m] = () => chain;
  chain.then = (resolve: (v: unknown) => void) => resolve(result);
  return { from: () => chain, storage: { from: () => ({ remove: async () => ({ error: null }) }) } } as unknown as SupabaseClient;
}

describe("persisting guards", () => {
  it("rejects an orderedIds list that does not match the listing's images", async () => {
    const client = fakeClient({ data: [{ id: "a", position: 0 }], error: null });
    await expect(reorderListingImages(client, "l1", ["a", "b"])).rejects.toThrow(ListingImageError);
    await expect(reorderListingImages(client, "l1", [])).rejects.toThrow(ListingImageError);
  });
  it("fails loudly when RLS filters the delete to zero rows", async () => {
    const client = fakeClient({ data: [], error: null });
    const image = { id: "a", listing_id: "l1", url: "http://x/other.png", alt_text: null, position: 0 };
    await expect(deleteListingImage(client, image)).rejects.toThrow(ListingImageError);
  });
});

describe("ordering", () => {
  it("orders by position then created_at without mutating", () => {
    const input = [
      { id: "c", position: 1, created_at: "2" },
      { id: "a", position: 0, created_at: "3" },
      { id: "b", position: 1, created_at: "1" },
    ];
    expect(orderImages(input).map((i) => i.id)).toEqual(["a", "b", "c"]);
    expect(input[0].id).toBe("c");
  });
  it("computes the next position", () => {
    expect(nextPosition([])).toBe(0);
    expect(nextPosition([{ position: 0 }, { position: 4 }])).toBe(5);
  });
  it("moves an image and clamps the index", () => {
    expect(moveImage(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
    expect(moveImage(["a", "b", "c"], "a", 99)).toEqual(["b", "c", "a"]);
    expect(() => moveImage(["a"], "z", 0)).toThrow(ListingImageError);
  });
});
