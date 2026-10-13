import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** Next/Image allow-list for the public listing-images bucket of the configured Supabase project. */
export function supabaseImagePatterns(supabaseUrl: string | undefined): RemotePattern[] {
  if (!supabaseUrl) return [];
  let url: URL;
  try {
    url = new URL(supabaseUrl);
  } catch {
    return [];
  }
  return [
    {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/v1/object/public/listing-images/**",
    },
  ];
}
