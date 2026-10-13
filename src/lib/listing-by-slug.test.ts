import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchListingBySlug } from "./listings";

type Call = [string, ...unknown[]];

function fakeClient(result: { data?: unknown; error?: { message: string } | null }) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "eq", "not", "lte", "maybeSingle"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return m === "maybeSingle" ? Promise.resolve({ data: null, error: null, ...result }) : builder;
    };
  }
  const client = { from: (t: string) => (calls.push(["from", t]), builder) } as unknown as SupabaseClient;
  return { client, calls };
}

describe("fetchListingBySlug", () => {
  afterEach(() => vi.useRealTimers());

  it("queries by slug, published only, with images and agent embedded", async () => {
    const { client, calls } = fakeClient({ data: { id: "1", images: [] } });
    await fetchListingBySlug(client, "casa-1");
    expect(calls).toContainEqual(["from", "listings"]);
    expect(calls).toContainEqual(["select", "*, images:listing_images(*), agent:agents(*)"]);
    expect(calls).toContainEqual(["eq", "slug", "casa-1"]);
    expect(calls).toContainEqual(["not", "published_at", "is", null]);
  });

  it("cuts off unpublished rows at the current time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00.000Z"));
    const { client, calls } = fakeClient({ data: { id: "1", images: [] } });
    await fetchListingBySlug(client, "casa-1");
    expect(calls).toContainEqual(["lte", "published_at", "2026-10-13T12:00:00.000Z"]);
  });

  it.each(["", "Casa-1", "casa_1", "casa--1", "-casa", "casa\u0000", "a/b"])(
    "returns null without querying for malformed slug %j",
    async (slug) => {
      const { client, calls } = fakeClient({ data: { id: "1", images: [] } });
      expect(await fetchListingBySlug(client, slug)).toBeNull();
      expect(calls).toEqual([]);
    },
  );

  it("orders images by position and keeps the agent", async () => {
    const { client } = fakeClient({
      data: {
        id: "1",
        agent: { id: "a", full_name: "Victoria" },
        images: [
          { id: "b", position: 2 },
          { id: "a", position: 0 },
          { id: "c", position: 1 },
        ],
      },
    });
    const listing = await fetchListingBySlug(client, "casa-1");
    expect((listing!.images as { id: string }[]).map((i) => i.id)).toEqual(["a", "c", "b"]);
    expect(listing!.agent).toEqual({ id: "a", full_name: "Victoria" });
  });

  it("defaults images to an empty array when null", async () => {
    const { client } = fakeClient({ data: { id: "1", images: null } });
    expect((await fetchListingBySlug(client, "x"))!.images).toEqual([]);
  });

  it("returns null when no row matches", async () => {
    const { client } = fakeClient({ data: null });
    expect(await fetchListingBySlug(client, "missing")).toBeNull();
  });

  it("throws on a query error", async () => {
    const { client } = fakeClient({ error: { message: "boom" } });
    await expect(fetchListingBySlug(client, "x")).rejects.toThrow("boom");
  });
});
