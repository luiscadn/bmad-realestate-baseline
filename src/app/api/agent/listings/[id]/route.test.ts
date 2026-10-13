import { beforeEach, describe, expect, it, vi } from "vitest";

const result = vi.fn();
const calls: [string, unknown[]][] = [];
function builder(): unknown {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "update", "delete", "eq", "maybeSingle"]) {
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

import { DELETE, GET, PATCH } from "./route";

const ID = "123e4567-e89b-12d3-a456-426614174000";
const ctx = (id = ID) => ({ params: Promise.resolve({ id }) });
const call = (m: string) => calls.filter(([n]) => n === m).map(([, a]) => a);
const url = `http://localhost/api/agent/listings/${ID}`;
const patch = (body: unknown, id = ID, raw = false) =>
  PATCH(new Request(url, { method: "PATCH", body: raw ? (body as string) : JSON.stringify(body) }), ctx(id));

beforeEach(() => {
  calls.length = 0;
  result.mockReset();
  from.mockClear();
  getAgent.mockReset().mockResolvedValue({ user: { id: "agent-1" }, supabase: { from } });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("auth and id validation", () => {
  it("returns 401 for every method without a session", async () => {
    getAgent.mockResolvedValue(null);
    const res = [await GET(new Request(url), ctx()), await patch({ title: "x" }), await DELETE(new Request(url), ctx())];
    expect(res.map((r) => r.status)).toEqual([401, 401, 401]);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed id on every method", async () => {
    const res = [
      await GET(new Request(url), ctx("nope")),
      await patch({ title: "x" }, "nope"),
      await DELETE(new Request(url), ctx("nope")),
    ];
    expect(res.map((r) => r.status)).toEqual([400, 400, 400]);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("GET", () => {
  it("returns the caller's listing scoped by id and agent_id", async () => {
    result.mockReturnValue({ data: { id: ID }, error: null });
    const res = await GET(new Request(url), ctx());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: ID } });
    expect(call("eq")).toEqual([["id", ID], ["agent_id", "agent-1"]]);
  });

  it("returns 404 for a missing or foreign listing", async () => {
    result.mockReturnValue({ data: null, error: null });
    expect((await GET(new Request(url), ctx())).status).toBe(404);
  });

  it("returns 500 on database error", async () => {
    result.mockReturnValue({ data: null, error: { code: "XX", message: "down" } });
    expect((await GET(new Request(url), ctx())).status).toBe(500);
  });
});

describe("PATCH", () => {
  it("updates validated fields scoped to the owner", async () => {
    result.mockReturnValue({ data: { id: ID, title: "Nuevo" }, error: null });
    const res = await patch({ title: " Nuevo ", agent_id: "evil" });
    expect(res.status).toBe(200);
    expect(call("update")).toEqual([[{ title: "Nuevo" }]]);
    expect(call("eq")).toEqual([["id", ID], ["agent_id", "agent-1"]]);
  });

  it("publishes by setting published_at to now", async () => {
    result.mockReturnValue({ data: { id: ID }, error: null });
    await patch({ published: true });
    const [update] = call("update")[0] as [Record<string, unknown>];
    expect(Date.parse(update.published_at as string)).not.toBeNaN();
    expect(update).not.toHaveProperty("published");
  });

  it("unpublishes by clearing published_at", async () => {
    result.mockReturnValue({ data: { id: ID }, error: null });
    await patch({ published: false, price_cop: 5 });
    expect(call("update")).toEqual([[{ price_cop: 5, published_at: null }]]);
  });

  it("returns 404 when no row matches (missing or not owned)", async () => {
    result.mockReturnValue({ data: null, error: null });
    expect((await patch({ title: "x" })).status).toBe(404);
  });

  it("returns 400 for invalid JSON, empty update and invalid fields", async () => {
    expect((await patch("{bad", ID, true)).status).toBe(400);
    expect((await patch({})).status).toBe(400);
    const res = await patch({ price_cop: 0, published: "yes" });
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).errors).sort()).toEqual(["price_cop", "published"]);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 409 on slug conflict and 500 on other errors", async () => {
    result.mockReturnValueOnce({ data: null, error: { code: "23505", message: "dup" } });
    expect((await patch({ slug: "taken" })).status).toBe(409);
    result.mockReturnValueOnce({ data: null, error: { code: "XX", message: "down" } });
    expect((await patch({ title: "x" })).status).toBe(500);
  });
});

describe("DELETE", () => {
  it("deletes the caller's listing", async () => {
    result.mockReturnValue({ data: { id: ID }, error: null });
    const res = await DELETE(new Request(url, { method: "DELETE" }), ctx());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: ID, deleted: true } });
    expect(call("eq")).toEqual([["id", ID], ["agent_id", "agent-1"]]);
  });

  it("returns 404 when nothing matched", async () => {
    result.mockReturnValue({ data: null, error: null });
    expect((await DELETE(new Request(url), ctx())).status).toBe(404);
  });

  it("returns 500 on database error", async () => {
    result.mockReturnValue({ data: null, error: { code: "XX", message: "down" } });
    expect((await DELETE(new Request(url), ctx())).status).toBe(500);
  });
});
