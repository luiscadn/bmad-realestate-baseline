import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchListings = vi.fn();
vi.mock("@/lib/listings", () => ({ fetchListings: (...a: unknown[]) => fetchListings(...a) }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({}) }));

import { GET } from "./route";

const get = (qs = "") => GET(new Request(`http://localhost/api/listings${qs}`));

describe("GET /api/listings", () => {
  beforeEach(() => {
    fetchListings.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 200 with the page payload", async () => {
    const payload = { data: [], total: 0, page: 1, limit: 12, total_pages: 0 };
    fetchListings.mockResolvedValue(payload);
    const res = await get("?operation=sale");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
    expect(fetchListings).toHaveBeenCalledWith({}, expect.objectContaining({ operation: "sale", page: 1, limit: 12 }));
  });

  it("returns 400 with field details and does not query on invalid params", async () => {
    const res = await get("?operation=lease&page=0");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.details).sort()).toEqual(["operation", "page"]);
    expect(fetchListings).not.toHaveBeenCalled();
  });

  it("returns 500 when the query fails", async () => {
    fetchListings.mockImplementation(async () => {
      throw new Error("db down");
    });
    const res = await get();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to load listings" });
  });
});
