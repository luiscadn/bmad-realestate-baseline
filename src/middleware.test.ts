import { describe, expect, it } from "vitest";
import { config } from "./middleware";

describe("middleware matcher", () => {
  const re = new RegExp(`^${config.matcher[0]}$`);

  it("skips api, _next and files", () => {
    for (const p of ["/api/listings", "/api", "/_next/static/x.js", "/favicon.ico"]) {
      expect(re.test(p), p).toBe(false);
    }
  });

  it("handles page routes, including ones that merely start with api", () => {
    for (const p of ["/", "/en", "/search", "/api-docs", "/apartments"]) {
      expect(re.test(p), p).toBe(true);
    }
  });
});
