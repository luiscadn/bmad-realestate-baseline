import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { fetchListings } from "./listings";
import type { ListingsQuery } from "./listings-query";

type Call = [string, ...unknown[]];

/** Chainable, thenable stand-in for a PostgREST builder that records every call. */
function fakeClient(results: Array<{ data?: unknown; error?: { code?: string; message: string } | null; count?: number | null }>) {
  const calls: Call[] = [];
  let i = 0;
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "not", "lte", "eq", "ilike", "gte", "order", "range"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (v: unknown) => void) => resolve({ data: null, error: null, count: null, ...results[i++] });
  const client = { from: () => builder } as unknown as SupabaseClient;
  return { client, calls };
}

const base: ListingsQuery = { sort: "newest", page: 1, limit: 10 };

describe("fetchListings", () => {
  it("always restricts to published listings and orders newest first with an id tiebreaker", async () => {
    const { client, calls } = fakeClient([{ data: [], count: 0 }]);
    await fetchListings(client, base);
    expect(calls).toContainEqual(["not", "published_at", "is", null]);
    expect(calls.some((c) => c[0] === "lte" && c[1] === "published_at")).toBe(true);
    expect(calls).toContainEqual(["order", "published_at", { ascending: false }]);
    expect(calls).toContainEqual(["order", "id", { ascending: true }]);
  });

  it("applies each filter and the price sort", async () => {
    const { client, calls } = fakeClient([{ data: [], count: 0 }]);
    await fetchListings(client, {
      ...base,
      sort: "price_desc",
      operation: "sale",
      propertyType: "apartment",
      neighborhood: "100%_Granada",
      minPrice: 10,
      maxPrice: 20,
      bedrooms: 2,
      bathrooms: 1,
    });
    expect(calls).toContainEqual(["eq", "operation", "sale"]);
    expect(calls).toContainEqual(["eq", "property_type", "apartment"]);
    expect(calls).toContainEqual(["ilike", "neighborhood", "100\\%\\_Granada"]);
    expect(calls).toContainEqual(["gte", "price_cop", 10]);
    expect(calls).toContainEqual(["lte", "price_cop", 20]);
    expect(calls).toContainEqual(["gte", "bedrooms", 2]);
    expect(calls).toContainEqual(["gte", "bathrooms", 1]);
    expect(calls).toContainEqual(["order", "price_cop", { ascending: false }]);
  });

  it("applies USD price filters when provided", async () => {
    const { client, calls } = fakeClient([{ data: [], count: 0 }]);
    await fetchListings(client, {
      ...base,
      minPriceUsd: 1_000_000,
      maxPriceUsd: 15_000_000,
    });
    expect(calls).toContainEqual(["gte", "price_usd", 1_000_000]);
    expect(calls).toContainEqual(["lte", "price_usd", 15_000_000]);
  });

  it("computes the range and pagination metadata", async () => {
    const { client, calls } = fakeClient([{ data: [{ id: "a", images: [] }], count: 25 }]);
    const page = await fetchListings(client, { ...base, page: 3, limit: 10 });
    expect(calls).toContainEqual(["range", 20, 29]);
    expect(page).toMatchObject({ total: 25, page: 3, limit: 10, total_pages: 3 });
  });

  it("orders images by position within each listing", async () => {
    const images = [
      { id: "b", position: 1, created_at: "2026-01-01" },
      { id: "a", position: 0, created_at: "2026-01-02" },
    ];
    const { client } = fakeClient([{ data: [{ id: "l1", images }], count: 1 }]);
    const page = await fetchListings(client, base);
    expect((page.data[0].images as { id: string }[]).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("returns an empty page with the real total when the page is past the end", async () => {
    const { client } = fakeClient([
      { error: { code: "PGRST103", message: "Requested range not satisfiable" } },
      { count: 4 },
    ]);
    const page = await fetchListings(client, { ...base, page: 9 });
    expect(page).toEqual({ data: [], total: 4, page: 9, limit: 10, total_pages: 1 });
  });

  it("throws on other database errors", async () => {
    const { client } = fakeClient([{ error: { code: "XX", message: "boom" } }]);
    await expect(fetchListings(client, base)).rejects.toThrow("boom");
  });
});
