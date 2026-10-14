import { describe, expect, it } from "vitest";
import { EMPTY_FORM, fromListing, mapServerErrors, toPayload, validateForm, type AgentListing } from "./dashboard";

const base = { ...EMPTY_FORM, title: "Casa", neighborhood: "Granada", price_cop: "450000000" };

const listing: AgentListing = {
  id: "1",
  slug: "casa-1",
  title: "Casa",
  description: "d",
  operation: "rent",
  property_type: "house",
  price_cop: 3_000_000,
  area_m2: "85.50",
  bedrooms: 3,
  bathrooms: 2,
  stratum: 4,
  admin_fee_cop: null,
  neighborhood: "Granada",
  address: null,
  published_at: "2026-01-01T00:00:00Z",
};

describe("validateForm", () => {
  it("passes a minimal valid form", () => {
    expect(validateForm(base)).toEqual({});
  });

  it("requires title, neighborhood and price", () => {
    expect(validateForm(EMPTY_FORM)).toEqual({ title: "required", neighborhood: "required", price_cop: "required" });
  });

  it("rejects bad numbers, slug and stratum", () => {
    const errors = validateForm({
      ...base,
      price_cop: "0",
      area_m2: "-3",
      bedrooms: "1.5",
      bathrooms: "x",
      admin_fee_cop: "-1",
      stratum: "7",
      slug: "Bad Slug",
    });
    expect(errors).toEqual({
      price_cop: "positiveInt",
      area_m2: "positiveNumber",
      bedrooms: "nonNegInt",
      bathrooms: "nonNegInt",
      admin_fee_cop: "nonNegInt",
      stratum: "stratum",
      slug: "slug",
    });
  });

  it("rejects stratum 0 and accepts 1 and 6", () => {
    expect(validateForm({ ...base, stratum: "0" }).stratum).toBe("stratum");
    expect(validateForm({ ...base, stratum: "1" }).stratum).toBeUndefined();
    expect(validateForm({ ...base, stratum: "6" }).stratum).toBeUndefined();
  });
});

describe("toPayload", () => {
  it("omits a blank slug and nulls blank optionals", () => {
    const p = toPayload({ ...base, title: "  Casa ", address: "  " });
    expect(p).toMatchObject({
      title: "Casa",
      price_cop: 450_000_000,
      area_m2: null,
      stratum: null,
      admin_fee_cop: null,
      address: null,
      bedrooms: 0,
      bathrooms: 0,
      published: false,
    });
    expect(p).not.toHaveProperty("slug");
  });

  it("includes slug and numeric values when given", () => {
    const p = toPayload({ ...base, slug: "mi-casa", area_m2: "80.5", stratum: "5", admin_fee_cop: "200000", published: true });
    expect(p).toMatchObject({ slug: "mi-casa", area_m2: 80.5, stratum: 5, admin_fee_cop: 200_000, published: true });
  });
});

describe("fromListing", () => {
  it("prefills strings and derives published from published_at", () => {
    const v = fromListing(listing);
    expect(v).toMatchObject({ price_cop: "3000000", area_m2: "85.50", stratum: "4", admin_fee_cop: "", address: "", published: true });
    expect(fromListing({ ...listing, published_at: null }).published).toBe(false);
  });
});

describe("mapServerErrors", () => {
  it("maps known fields", () => {
    expect(mapServerErrors({ price_cop: "x", stratum: "y" })).toEqual({
      fields: { price_cop: "positiveInt", stratum: "stratum" },
      unmapped: false,
    });
  });
  it("flags unknown or missing errors", () => {
    expect(mapServerErrors({ body: "x" }).unmapped).toBe(true);
    expect(mapServerErrors(undefined).unmapped).toBe(true);
  });
});
