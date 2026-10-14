import { describe, expect, it } from "vitest";
import type { FeaturedListing } from "./featured-listings";
import { formatPinPrice, formatPinPriceUsd, parseView, projectPins } from "./map-view";

const make = (
  id: string,
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  extra: Partial<FeaturedListing> = {}
): FeaturedListing => ({
  id,
  slug: id,
  title: id,
  operation: "sale",
  property_type: "house",
  price_cop: 1,
  bedrooms: 1,
  bathrooms: 1,
  area_m2: null,
  neighborhood: "Downtown Miami",
  latitude,
  longitude,
  images: [],
  ...extra,
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

  it("accurately projects Miami luxury towers across Biscayne Bay corridor", () => {
    // Una Residences (Brickell - south): 25.7535, -80.1985
    // Aston Martin Residences (Downtown - central): 25.7708, -80.1878
    // Porsche Design Tower (Sunny Isles Beach - north/east): 25.9482, -80.1200
    const listings = [
      make("una", 25.7535, -80.1985, { building_name: "Una Residences", price_usd: 3_850_000 }),
      make("aston", 25.7708, -80.1878, { building_name: "Aston Martin Residences", price_usd: 25_000_000 }),
      make("porsche", 25.9482, -80.1200, { building_name: "Porsche Design Tower", price_usd: 8_900_000 }),
    ];
    const { pins, missing } = projectPins(listings);
    expect(missing).toBe(0);
    expect(pins).toHaveLength(3);

    const unaPin = pins.find((p) => p.listing.id === "una")!;
    const astonPin = pins.find((p) => p.listing.id === "aston")!;
    const porschePin = pins.find((p) => p.listing.id === "porsche")!;

    // Porsche Design Tower is in Sunny Isles (furthest north, so smallest y)
    expect(porschePin.y).toBeLessThan(astonPin.y);
    expect(astonPin.y).toBeLessThan(unaPin.y);

    // Porsche Design Tower is on the barrier island east of mainland (largest x)
    expect(porschePin.x).toBeGreaterThan(astonPin.x);
    expect(astonPin.x).toBeGreaterThan(unaPin.x);

    // All pins remain within 0-100% canvas bounds
    for (const pin of pins) {
      expect(pin.x).toBeGreaterThanOrEqual(0);
      expect(pin.x).toBeLessThanOrEqual(100);
      expect(pin.y).toBeGreaterThanOrEqual(0);
      expect(pin.y).toBeLessThanOrEqual(100);
    }
  });
});

describe("formatPinPriceUsd", () => {
  it("formats millions with compact luxury labels", () => {
    expect(formatPinPriceUsd(25_000_000)).toBe("$25M");
    expect(formatPinPriceUsd(4_750_000)).toBe("$4.75M");
    expect(formatPinPriceUsd(11_500_000)).toBe("$11.5M");
    expect(formatPinPriceUsd(1_000_000)).toBe("$1M");
    expect(formatPinPriceUsd(8_900_000)).toBe("$8.9M");
    expect(formatPinPriceUsd(3_850_000)).toBe("$3.85M");
  });

  it("formats thousands with K suffix", () => {
    expect(formatPinPriceUsd(850_000)).toBe("$850K");
    expect(formatPinPriceUsd(28_000)).toBe("$28K");
    expect(formatPinPriceUsd(12_500)).toBe("$12.5K");
    expect(formatPinPriceUsd(1_000)).toBe("$1K");
  });

  it("formats amounts under 1,000 without suffix", () => {
    expect(formatPinPriceUsd(750)).toBe("$750");
    expect(formatPinPriceUsd(100)).toBe("$100");
  });

  it("handles zero, negative, null, and non-numeric values safely", () => {
    expect(formatPinPriceUsd(0)).toBe("$0");
    expect(formatPinPriceUsd(-500)).toBe("$0");
    expect(formatPinPriceUsd(null)).toBe("$0");
    expect(formatPinPriceUsd(undefined)).toBe("$0");
    expect(formatPinPriceUsd(Number.NaN)).toBe("$0");
  });
});

describe("formatPinPrice", () => {
  it("prefers price_usd when available", () => {
    expect(formatPinPrice({ price_usd: 4_750_000, price_cop: 19_000_000_000 })).toBe("$4.75M");
    expect(formatPinPrice({ price_usd: 25_000_000, price_cop: 100_000_000_000 })).toBe("$25M");
  });

  it("falls back to converting price_cop at 4000 COP/USD when price_usd is null", () => {
    expect(formatPinPrice({ price_usd: null, price_cop: 400_000_000 })).toBe("$100K");
    expect(formatPinPrice({ price_usd: undefined, price_cop: 10_000_000_000 })).toBe("$2.5M");
  });
});

