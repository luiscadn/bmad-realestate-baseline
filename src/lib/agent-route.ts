import { NextResponse } from "next/server";
import { getAgent, type AgentContext } from "./agent-auth";

/** Shared helpers for the `/api/agent/*` route handlers. */

export const unauthorized = () =>
  NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });

export async function authenticate(request: Request): Promise<AgentContext | Response> {
  try {
    return (await getAgent(request)) ?? unauthorized();
  } catch (err) {
    console.error("agent auth failed", { message: (err as Error | undefined)?.message });
    return NextResponse.json({ error: "Authentication unavailable" }, { status: 500 });
  }
}

export async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body", errors: { body: "Body must be valid JSON" } }, { status: 400 }),
    };
  }
}

/** Maps a PostgREST error to a response; logs only code/message (details can echo row data). */
export function dbError(route: string, err: unknown, map: Record<string, [number, string]> = {}): Response {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  const mapped = code ? map[code] : undefined;
  if (mapped) return NextResponse.json({ error: mapped[1] }, { status: mapped[0] });
  console.error(`${route} failed`, { code, message });
  return NextResponse.json({ error: "Database error" }, { status: 500 });
}
