import { describe, expect, it } from "vitest";
import { DEFAULT_LIMIT, MAX_LIMIT, MAX_PAGE, parseListingsQuery } from "./listings-query";

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
});
