import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserBearer = vi.fn();
const getUserCookie = vi.fn();
const createClient = vi.fn<(...a: unknown[]) => unknown>(() => ({ auth: { getUser: getUserBearer } }));
const createServerClient = vi.fn<(...a: unknown[]) => unknown>(() => ({ auth: { getUser: getUserCookie } }));
const cookies = vi.fn();

vi.mock("@supabase/supabase-js", () => ({ createClient: (...a: unknown[]) => createClient(...a) }));
vi.mock("@supabase/ssr", () => ({ createServerClient: (...a: unknown[]) => createServerClient(...a) }));
vi.mock("next/headers", () => ({ cookies: () => cookies() }));

import { getAgent, readBearerToken } from "./agent-auth";

const req = (headers: Record<string, string> = {}) => new Request("http://localhost/api/agent/listings", { headers });
const user = { id: "u1" };

describe("readBearerToken", () => {
  it.each([
    ["Bearer abc.def", "abc.def"],
    ["bearer   abc", "abc"],
    ["Basic abc", null],
    ["Bearer", null],
    ["Bearer a b", null],
    ["", null],
  ])("%j -> %j", (header, expected) => {
    expect(readBearerToken(req(header ? { authorization: header } : {}))).toBe(expected);
  });
});

describe("getAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://sb";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    cookies.mockResolvedValue({ getAll: () => [{ name: "sb", value: "v" }] });
  });

  it("verifies a Bearer token with the auth server and builds a token-scoped client", async () => {
    getUserBearer.mockResolvedValue({ data: { user }, error: null });
    const ctx = await getAgent(req({ authorization: "Bearer tok" }));
    expect(ctx?.user).toBe(user);
    expect(getUserBearer).toHaveBeenCalledWith("tok");
    expect(createClient.mock.calls[0][2]).toMatchObject({ global: { headers: { Authorization: "Bearer tok" } } });
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("returns null for an invalid Bearer token without falling back to cookies", async () => {
    getUserBearer.mockResolvedValue({ data: { user: null }, error: { message: "bad jwt" } });
    expect(await getAgent(req({ authorization: "Bearer tok" }))).toBeNull();
    expect(getUserCookie).not.toHaveBeenCalled();
  });

  it("returns null for a malformed Authorization header", async () => {
    expect(await getAgent(req({ authorization: "Basic xyz" }))).toBeNull();
    expect(getUserBearer).not.toHaveBeenCalled();
    expect(getUserCookie).not.toHaveBeenCalled();
  });

  it("uses the session cookie when no Authorization header is sent", async () => {
    getUserCookie.mockResolvedValue({ data: { user }, error: null });
    const ctx = await getAgent(req());
    expect(ctx?.user).toBe(user);
    const opts = createServerClient.mock.calls[0][2] as { cookies: { getAll: () => unknown[] } };
    expect(opts.cookies.getAll()).toEqual([{ name: "sb", value: "v" }]);
  });

  it("returns null when there is no cookie session", async () => {
    getUserCookie.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    expect(await getAgent(req())).toBeNull();
  });

  it("throws when Supabase env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(getAgent(req())).rejects.toThrow(/environment/);
  });
});
