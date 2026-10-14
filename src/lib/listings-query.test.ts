import { describe, expect, it } from "vitest";
import { DEFAULT_LIMIT, MAX_LIMIT, MAX_PAGE, MAX_SMALLINT, parseListingsQuery } from "./listings-query";

const parse = (qs: string) => parseListingsQuery(new URLSearchParams(qs));

describe("parseListingsQuery", () => {
  it("applies defaults when no params are given", () => {
    expect(parse("")).toEqual({
      ok: true,
      value: expect.objectContaining({ sort: "newest", page: 1, limit: DEFAULT_LIMIT }),
    });
  });

  it("parses every filter", () => {
    const r = parse("operation=rent&neighborhood=%20Granada%20&min_price=1&max_price=5&bedrooms=2&bathrooms=1&property_type=house&sort=price_asc&page=3&limit=20");
    expect(r).toEqual({
      ok: true,
      value: {
        operation: "rent",
        neighborhood: "Granada",
        minPrice: 1,
        maxPrice: 5,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "house",
        sort: "price_asc",
        page: 3,
        limit: 20,
      },
    });
  });

  it("treats empty values as not provided", () => {
    const r = parse("operation=&min_price=&neighborhood=");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.operation).toBeUndefined();
  });

  it.each([
    ["operation=lease", "operation"],
    ["property_type=castle", "property_type"],
    ["sort=cheapest", "sort"],
    ["min_price=abc", "min_price"],
    ["min_price=-5", "min_price"],
    ["max_price=1.5", "max_price"],
    ["bedrooms=-1", "bedrooms"],
    ["bathrooms=x", "bathrooms"],
    [`bedrooms=${MAX_SMALLINT + 1}`, "bedrooms"],
    [`bathrooms=${MAX_SMALLINT + 1}`, "bathrooms"],
    ["page=0", "page"],
    ["page=1e3", "page"],
    [`page=${MAX_PAGE + 1}`, "page"],
    ["page=9007199254740991", "page"],
    ["limit=0", "limit"],
    [`limit=${MAX_LIMIT + 1}`, "limit"],
    ["min_price=10&max_price=5", "min_price"],
  ])("rejects %s", (qs, field) => {
    const r = parse(qs);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toContain(field);
  });

  it("reports all invalid fields at once", () => {
    const r = parse("operation=x&page=0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["operation", "page"]);
  });

  it("parses USD price filters and validates bounds", () => {
    const valid = parse("min_price_usd=1000000&max_price_usd=25000000");
    expect(valid).toEqual({
      ok: true,
      value: expect.objectContaining({ minPriceUsd: 1_000_000, maxPriceUsd: 25_000_000 }),
    });

    const invalid = parse("min_price_usd=5000000&max_price_usd=1000000");
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors.min_price_usd).toContain("must be less than or equal to max_price_usd");
  });
});
