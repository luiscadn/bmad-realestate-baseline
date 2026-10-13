import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface AgentContext {
  user: User;
  /** Client acting as the agent, so RLS applies to every query. */
  supabase: SupabaseClient;
}

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured");
  return { url, key };
}

/** Extracts the token from `Authorization: Bearer <token>`; null when absent or malformed. */
export function readBearerToken(request: Request): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization")?.trim() ?? "");
  return match ? match[1] : null;
}

/**
 * Authenticates the caller from a Bearer token or, failing that, the Supabase session cookie.
 * Returns null when there is no valid session. Tokens are verified with the auth server (`getUser`).
 */
export async function getAgent(request: Request): Promise<AgentContext | null> {
  const { url, key } = env();
  const token = readBearerToken(request);

  if (request.headers.get("authorization") && !token) return null;

  if (token) {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await supabase.auth.getUser(token);
    return error || !data.user ? null : { user: data.user, supabase };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // Route handlers here only read the session; token refresh is left to a later middleware story.
      setAll: () => {},
    },
  });
  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : { user: data.user, supabase };
}
