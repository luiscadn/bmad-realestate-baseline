import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({ from }) }));

import { POST } from "./route";

const post = (body: unknown, raw = false) =>
  POST(
    new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    insert.mockReset();
    from.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 201 and stores a normalized subscriber", async () => {
    insert.mockResolvedValue({ error: null });
    const res = await post({ email: "  Ana@Example.COM ", name: "  Ana   Maria\n" });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { subscribed: true } });
    expect(from).toHaveBeenCalledWith("newsletter_subscribers");
    expect(insert).toHaveBeenCalledWith({ email: "ana@example.com", name: "Ana Maria" });
  });

  it("accepts a missing or blank name", async () => {
    insert.mockResolvedValue({ error: null });
    expect((await post({ email: "a@b.co" })).status).toBe(201);
    expect(insert).toHaveBeenLastCalledWith({ email: "a@b.co", name: null });
    expect((await post({ email: "a@b.co", name: "   " })).status).toBe(201);
    expect(insert).toHaveBeenLastCalledWith({ email: "a@b.co", name: null });
  });

  it("is idempotent when the database reports a unique violation", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const res = await post({ email: "ana@example.com" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { subscribed: true } });
  });

  it.each(["ana", "ana@", "@example.com", "ana@example", "ana @example.com", "", "   ", 42, null])(
    "returns 400 for invalid email %j",
    async (email) => {
      const res = await post({ email });
      expect(res.status).toBe(400);
      expect((await res.json()).errors.email).toBeTruthy();
      expect(insert).not.toHaveBeenCalled();
    },
  );

  it("returns 400 when email is missing", async () => {
    expect((await post({ name: "Ana" })).status).toBe(400);
  });

  it("returns 400 for a non-string or overlong name", async () => {
    expect((await post({ email: "a@b.co", name: 5 })).status).toBe(400);
    const res = await post({ email: "a@b.co", name: "x".repeat(201) });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.name).toBeTruthy();
  });

  it("returns 400 for malformed JSON and non-object bodies", async () => {
    expect((await post("{nope", true)).status).toBe(400);
    expect((await post(["a@b.co"])).status).toBe(400);
    expect((await post(null)).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking details on other database errors", async () => {
    insert.mockResolvedValue({ error: { code: "XX000", message: "boom", details: "ana@example.com" } });
    const res = await post({ email: "ana@example.com" });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("ana@example.com");
  });

  it("returns 500 when the client throws", async () => {
    insert.mockRejectedValue(new Error("network"));
    expect((await post({ email: "ana@example.com" })).status).toBe(500);
  });
});
