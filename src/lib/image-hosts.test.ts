import { describe, expect, it } from "vitest";
import { supabaseImagePatterns } from "./image-hosts";

describe("supabaseImagePatterns", () => {
  it("allows only the listing-images public path of a hosted project", () => {
    expect(supabaseImagePatterns("https://abc.supabase.co")).toEqual([
      { protocol: "https", hostname: "abc.supabase.co", pathname: "/storage/v1/object/public/listing-images/**" },
    ]);
  });

  it("keeps protocol and port for the local stack", () => {
    expect(supabaseImagePatterns("http://127.0.0.1:54321")).toEqual([
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/listing-images/**" },
    ]);
  });

  it("returns no patterns when the URL is missing or invalid", () => {
    expect(supabaseImagePatterns(undefined)).toEqual([]);
    expect(supabaseImagePatterns("not a url")).toEqual([]);
  });
});
