import { beforeEach, describe, expect, it, vi } from "vitest";

const result = vi.fn();
const calls: [string, unknown[]][] = [];
function builder(): unknown {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "insert", "eq", "order", "range", "single"]) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, args]);
      return b;
    };
  }
  b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(result()).then(res, rej);
  return b;
}
const from = vi.fn(() => builder());
const getAgent = vi.fn();
vi.mock("@/lib/agent-auth", () => ({ getAgent: (...a: unknown[]) => getAgent(...a) }));

import { GET, POST } from "./route";

const USER = { id: "agent-1" };
const valid = { title: "Casa Bonita", operation: "rent", property_type: "house", price_cop: 3_000_000, neighborhood: "Ciudad Jardín" };
const call = (m: string) => calls.filter(([n]) => n === m).map(([, a]) => a);

const get = (qs = "") => GET(new Request(`http://localhost/api/agent/listings${qs}`));
const post = (body: unknown, raw = false) =>
  POST(new Request("http://localhost/api/agent/listings", { method: "POST", body: raw ? (body as string) : JSON.stringify(body) }));

beforeEach(() => {
  calls.length = 0;
  result.mockReset();
  from.mockClear();
  getAgent.mockReset().mockResolvedValue({ user: USER, supabase: { from } });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("auth", () => {
  it("returns 401 for GET and POST without a session", async () => {
    getAgent.mockResolvedValue(null);
    for (const res of [await get(), await post(valid)]) {
      expect(res.status).toBe(401);
      expect(res.headers.get("www-authenticate")).toBe("Bearer");
    }
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 500 when the auth layer throws", async () => {
    getAgent.mockRejectedValue(new Error("boom"));
    expect((await get()).status).toBe(500);
  });
});

describe("GET /api/agent/listings", () => {
  it("lists only the caller's listings with pagination metadata", async () => {
    result.mockReturnValue({ data: [{ id: "a" }], error: null, count: 25 });
    const res = await get("?page=2&limit=10");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: "a" }], total: 25, page: 2, limit: 10, total_pages: 3 });
    expect(call("eq")).toContainEqual(["agent_id", "agent-1"]);
    expect(call("range")).toEqual([[10, 19]]);
  });

  it("uses defaults", async () => {
    result.mockReturnValue({ data: [], error: null, count: 0 });
    const body = await (await get()).json();
    expect(body).toMatchObject({ page: 1, limit: 12, total: 0, total_pages: 0 });
  });

  it.each(["?page=0", "?page=abc", "?limit=51", "?limit=-1", "?page=1.5"])("returns 400 for %s", async (qs) => {
    expect((await get(qs)).status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns an empty page past the end", async () => {
    result.mockReturnValue({ data: null, error: { code: "PGRST103", message: "range" }, count: null });
    const res = await get("?page=99");
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });

  it("returns 500 on database errors", async () => {
    result.mockReturnValue({ data: null, error: { code: "XX", message: "down" }, count: null });
    expect((await get()).status).toBe(500);
  });
});

describe("POST /api/agent/listings", () => {
  it("creates a draft owned by the caller with a generated slug", async () => {
    result.mockReturnValue({ data: { id: "n1" }, error: null });
    const res = await post(valid);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { id: "n1" } });
    const [row] = call("insert")[0] as [Record<string, unknown>];
    expect(row).toMatchObject({ agent_id: "agent-1", published_at: null, title: "Casa Bonita" });
    expect(row.slug).toMatch(/^casa-bonita-[a-z0-9]{6}$/);
  });

  it("publishes immediately when published is true and honors a given slug", async () => {
    result.mockReturnValue({ data: { id: "n1" }, error: null });
    await post({ ...valid, slug: "mi-casa", published: true });
    const [row] = call("insert")[0] as [Record<string, unknown>];
    expect(row.slug).toBe("mi-casa");
    expect(typeof row.published_at).toBe("string");
    expect(row).not.toHaveProperty("published");
  });

  it("cannot be tricked into setting agent_id or published_at", async () => {
    result.mockReturnValue({ data: {}, error: null });
    await post({ ...valid, agent_id: "other", published_at: "2020-01-01T00:00:00Z" });
    const [row] = call("insert")[0] as [Record<string, unknown>];
    expect(row.agent_id).toBe("agent-1");
    expect(row.published_at).toBeNull();
  });

  it("returns 400 for invalid JSON", async () => {
    expect((await post("{nope", true)).status).toBe(400);
  });

  it("returns 400 with field errors for an invalid payload", async () => {
    const res = await post({ ...valid, price_cop: -1, operation: "x" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors).toHaveProperty("price_cop");
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-object body", async () => {
    expect((await post([])).status).toBe(400);
  });

  it("returns 409 on duplicate slug, 403 without agent profile, 500 otherwise", async () => {
    result.mockReturnValueOnce({ data: null, error: { code: "23505", message: "dup" } });
    expect((await post({ ...valid, slug: "x" })).status).toBe(409);
    result.mockReturnValueOnce({ data: null, error: { code: "23503", message: "fk" } });
    expect((await post(valid)).status).toBe(403);
    result.mockReturnValueOnce({ data: null, error: { code: "XX", message: "down", details: "row with PII" } });
    expect((await post(valid)).status).toBe(500);
    expect(console.error).toHaveBeenCalledWith("POST /api/agent/listings failed", { code: "XX", message: "down" });
  });
});
