import { describe, expect, it } from "vitest";
import {
  ListingImageError,
  buildImagePath,
  moveImage,
  nextPosition,
  orderImages,
  pathFromPublicUrl,
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
