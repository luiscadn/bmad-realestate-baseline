import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { routing } from "./routing";

function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object"
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe("i18n", () => {
  it("defaults to es and supports en", () => {
    expect(routing.defaultLocale).toBe("es");
    expect([...routing.locales]).toEqual(["es", "en"]);
  });

  it("has identical catalog keys and no empty values", () => {
    expect(keys(es).sort()).toEqual(keys(en).sort());
    for (const catalog of [es, en]) {
      const flat = JSON.stringify(catalog);
      expect(flat).not.toContain('""');
    }
  });
});
