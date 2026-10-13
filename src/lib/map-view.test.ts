import { describe, expect, it } from "vitest";
import type { FeaturedListing } from "./featured-listings";
import { parseView, projectPins } from "./map-view";

const make = (id: string, latitude: number | null | undefined, longitude: number | null | undefined): FeaturedListing => ({
  id,
  slug: id,
  title: id,
  operation: "sale",
  property_type: "house",
  price_cop: 1,
  bedrooms: 1,
  bathrooms: 1,
  area_m2: null,
  neighborhood: "Granada",
  latitude,
  longitude,
  images: [],
});

describe("parseView", () => {
  it("accepts map and falls back to grid for anything else", () => {
    expect(parseView("map")).toBe("map");
    expect(parseView("grid")).toBe("grid");
    expect(parseView("foo")).toBe("grid");
    expect(parseView(null)).toBe("grid");
    expect(parseView(undefined)).toBe("grid");
  });
});

describe("projectPins", () => {
  it("places north-east listings top-right of south-west ones", () => {
    const { pins, missing } = projectPins([make("sw", 3.4, -76.55), make("ne", 3.5, -76.45)]);
    const [sw, ne] = pins;
    expect(missing).toBe(0);
    expect(ne.x).toBeGreaterThan(sw.x);
    expect(ne.y).toBeLessThan(sw.y);
    for (const pin of pins) {
      expect(pin.x).toBeGreaterThanOrEqual(0);
      expect(pin.x).toBeLessThanOrEqual(100);
      expect(pin.y).toBeGreaterThanOrEqual(0);
      expect(pin.y).toBeLessThanOrEqual(100);
    }
  });

  it("centres a single pin", () => {
    const { pins } = projectPins([make("a", 3.4, -76.5)]);
    expect(pins[0].x).toBeCloseTo(50);
    expect(pins[0].y).toBeCloseTo(50);
  });

  it("skips listings with missing or invalid coordinates and counts them", () => {
    const { pins, missing } = projectPins([make("ok", 3.4, -76.5), make("n", null, null), make("u", undefined, -76), make("bad", 95, 0), make("nan", Number.NaN, 0)]);
    expect(pins.map((p) => p.listing.id)).toEqual(["ok"]);
    expect(missing).toBe(4);
  });

  it("accepts numeric strings as PostgREST may return them", () => {
    const { pins } = projectPins([make("s", "3.4" as unknown as number, "-76.5" as unknown as number)]);
    expect(pins).toHaveLength(1);
  });

  it("rejects blank and boolean coordinates instead of pinning them at 0,0", () => {
    const { pins, missing } = projectPins([make("b", " " as unknown as number, 0), make("t", true as unknown as number, 0)]);
    expect(pins).toHaveLength(0);
    expect(missing).toBe(2);
  });

  it("keeps the aspect ratio: equal longitude and latitude spans give equal pixel spans", () => {
    const { pins } = projectPins([make("a", 3.4, -76.5), make("b", 3.4, -76.4), make("c", 3.5, -76.5)]);
    const [a, b, c] = pins;
    expect(b.x - a.x).toBeGreaterThan(0);
    expect(a.y - c.y).toBeGreaterThan(0);
    expect(Math.abs(b.x - a.x - (a.y - c.y))).toBeLessThan(2);
  });

  it("returns no pins for an empty list", () => {
    expect(projectPins([])).toEqual({ pins: [], missing: 0 });
  });
});
