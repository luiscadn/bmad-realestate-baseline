import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

const keys = (node: unknown, prefix = ""): string[] =>
  typeof node === "object" && node !== null
    ? Object.entries(node).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
    : [prefix.slice(0, -1)];

describe("Search view/map catalogs", () => {
  it("have identical keys in es and en", () => {
    expect(keys(es.Search.map).sort()).toEqual(keys(en.Search.map).sort());
    expect(keys(es.Search.view).sort()).toEqual(keys(en.Search.view).sort());
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });
});
