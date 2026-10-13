import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({ from }) }));

import { POST } from "./route";

const LISTING = "123e4567-e89b-12d3-a456-426614174000";
const valid = { name: "Ana", email: "ana@example.com", phone: "300 123", message: "Hola", listing_id: LISTING };

const post = (body: unknown, raw = false) =>
  POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe("POST /api/leads", () => {
  beforeEach(() => {
    insert.mockReset();
    from.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 201 and inserts the normalized lead", async () => {
    insert.mockResolvedValue({ error: null });
    const res = await post({ ...valid, name: " Ana " });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { received: true } });
    expect(from).toHaveBeenCalledWith("leads");
    expect(insert).toHaveBeenCalledWith(valid);
  });

  it("accepts a lead without phone or listing_id", async () => {
    insert.mockResolvedValue({ error: null });
    const res = await post({ name: "Ana", email: "ana@example.com", message: "Hola" });
    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      message: "Hola",
      phone: null,
      listing_id: null,
    });
  });

  it("returns 400 with field errors when required fields are missing", async () => {
    const res = await post({ phone: "1" });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid lead payload");
    expect(Object.keys(json.errors).sort()).toEqual(["email", "message", "name"]);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const res = await post({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toMatch(/valid/);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await post("{not json", true);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid JSON body");
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 400 for a JSON body that is not an object", async () => {
    const res = await post([valid]);
    expect(res.status).toBe(400);
    expect((await res.json()).errors.body).toBeDefined();
    expect(insert).not.toHaveBeenCalled();
  });

  it("does not log the rejected row details", async () => {
    insert.mockResolvedValue({ error: { message: "boom", code: "23514", details: "Failing row contains (ana@example.com)" } });
    await post(valid);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("ana@example.com");
  });

  it("returns 500 when the database returns an error", async () => {
    insert.mockResolvedValue({ error: { message: "boom", code: "23503" } });
    const res = await post(valid);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to save lead" });
  });

  it("returns 500 when the insert throws", async () => {
    insert.mockRejectedValue(new Error("network"));
    const res = await post(valid);
    expect(res.status).toBe(500);
  });
});
