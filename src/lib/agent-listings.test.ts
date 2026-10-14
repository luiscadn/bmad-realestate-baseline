import { describe, expect, it } from "vitest";
import { generateSlug, slugify, validateListingInput } from "./agent-listings";

const valid = {
  title: " Apartamento en Granada ",
  operation: "sale",
  property_type: "apartment",
  price_cop: 450_000_000,
  neighborhood: "Granada",
};

const errorsOf = (body: unknown, partial = false) => {
  const r = validateListingInput(body, partial);
  if (r.ok) throw new Error("expected validation failure");
  return r.errors;
};

describe("validateListingInput (create)", () => {
  it("accepts a minimal payload and trims text", () => {
    const r = validateListingInput(valid, false);
    expect(r).toEqual({
      ok: true,
      value: {
        fields: { title: "Apartamento en Granada", operation: "sale", property_type: "apartment", price_cop: 450_000_000, neighborhood: "Granada" },
        published: undefined,
      },
    });
  });

  it("accepts every optional field", () => {
    const r = validateListingInput(
      {
        ...valid,
        slug: "mi-slug-1",
        description: "  Lindo  ",
        bedrooms: 3,
        bathrooms: 2,
        parking_spots: 1,
        area_m2: 85.5,
        address: " Calle 1 ",
        city: "Cali",
        latitude: 3.45,
        longitude: -76.53,
        featured: true,
        open_house_at: "2026-11-01T15:00:00Z",
        published: true,
      },
      false,
    );
    expect(r.ok && r.value.published).toBe(true);
    expect(r.ok && r.value.fields).toMatchObject({
      slug: "mi-slug-1",
      description: "Lindo",
      address: "Calle 1",
      open_house_at: "2026-11-01T15:00:00.000Z",
      featured: true,
    });
  });

  it("rejects non-object bodies", () => {
    for (const b of [null, [], "x", 5, undefined]) expect(errorsOf(b)).toEqual({ body: "Payload must be a JSON object" });
  });

  it("reports all missing required fields", () => {
    expect(Object.keys(errorsOf({})).sort()).toEqual(["neighborhood", "operation", "price_cop", "property_type", "title"]);
  });

  it("ignores id, agent_id and published_at", () => {
    const r = validateListingInput({ ...valid, id: "x", agent_id: "y", published_at: "2020-01-01" }, false);
    expect(r.ok && Object.keys(r.value.fields)).not.toEqual(expect.arrayContaining(["id", "agent_id", "published_at"]));
  });

  it.each([
    ["title", " "],
    ["title", 5],
    ["title", "x".repeat(201)],
    ["neighborhood", ""],
    ["operation", "lease"],
    ["property_type", "castle"],
    ["price_cop", 0],
    ["price_cop", -5],
    ["price_cop", 1.5],
    ["price_cop", "100"],
    ["price_cop", Number.MAX_SAFE_INTEGER + 2],
    ["bedrooms", -1],
    ["bedrooms", 32768],
    ["bathrooms", 1.2],
    ["parking_spots", "1"],
    ["area_m2", 0],
    ["area_m2", -3],
    ["area_m2", 1e9],
    ["area_m2", "5"],
    ["latitude", 91],
    ["longitude", -181],
    ["latitude", NaN],
    ["featured", "yes"],
    ["description", 5],
    ["description", "x".repeat(10_001)],
    ["address", 5],
    ["address", "x".repeat(201)],
    ["city", ""],
    ["slug", "Bad Slug"],
    ["slug", "-bad"],
    ["slug", "a--b"],
    ["slug", ""],
    ["slug", "a".repeat(121)],
    ["open_house_at", "not a date"],
    ["open_house_at", 123],
    ["published", "true"],
  ])("rejects invalid %s = %j", (key, value) => {
    expect(errorsOf({ ...valid, [key]: value })).toHaveProperty(key);
  });

  it("accepts null for nullable fields", () => {
    const r = validateListingInput({ ...valid, area_m2: null, address: null, latitude: null, longitude: null, open_house_at: null }, false);
    expect(r.ok && r.value.fields).toMatchObject({ area_m2: null, address: null, latitude: null, longitude: null, open_house_at: null });
  });

  it("turns a blank address into null", () => {
    const r = validateListingInput({ ...valid, address: "  " }, false);
    expect(r.ok && r.value.fields.address).toBeNull();
  });
});

describe("validateListingInput (partial)", () => {
  it("does not require create-only fields", () => {
    const r = validateListingInput({ price_cop: 10 }, true);
    expect(r).toEqual({ ok: true, value: { fields: { price_cop: 10 }, published: undefined } });
  });

  it("accepts a publish-only payload", () => {
    expect(validateListingInput({ published: false }, true)).toEqual({ ok: true, value: { fields: {}, published: false } });
  });

  it("rejects an empty update", () => {
    expect(errorsOf({}, true)).toEqual({ body: "Provide at least one field to update" });
    expect(errorsOf({ unknown: 1 }, true)).toHaveProperty("body");
  });

  it("still validates supplied fields", () => {
    expect(errorsOf({ operation: "nope", title: "" }, true)).toHaveProperty("operation");
    expect(errorsOf({ title: "" }, true)).toHaveProperty("title");
  });
});

describe("slug helpers", () => {
  it("slugifies accents and punctuation", () => {
    expect(slugify("  Apartaménto ¡Único! en Granada  ")).toBe("apartamento-unico-en-granada");
  });

  it("generates a valid slug with a suffix, even for empty titles", () => {
    const re = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    expect(generateSlug("Casa Bonita")).toMatch(/^casa-bonita-[a-z0-9]{6}$/);
    expect(generateSlug("!!!")).toMatch(/^listing-[a-z0-9]{6}$/);
    expect(generateSlug("x".repeat(300))).toMatch(re);
  });
});

describe("validateListingInput stratum and admin_fee_cop", () => {
  it("accepts valid values and null", () => {
    const r = validateListingInput({ ...valid, stratum: 4, admin_fee_cop: 350_000 }, false);
    expect(r.ok && r.value.fields).toMatchObject({ stratum: 4, admin_fee_cop: 350_000 });
    const cleared = validateListingInput({ stratum: null, admin_fee_cop: null }, true);
    expect(cleared.ok && cleared.value.fields).toEqual({ stratum: null, admin_fee_cop: null });
  });

  it("rejects out-of-range or non-integer values", () => {
    expect(errorsOf({ ...valid, stratum: 0 })).toHaveProperty("stratum");
    expect(errorsOf({ ...valid, stratum: 7 })).toHaveProperty("stratum");
    expect(errorsOf({ ...valid, stratum: 2.5 })).toHaveProperty("stratum");
    expect(errorsOf({ ...valid, admin_fee_cop: -1 })).toHaveProperty("admin_fee_cop");
    expect(errorsOf({ ...valid, admin_fee_cop: "10" })).toHaveProperty("admin_fee_cop");
  });
});
