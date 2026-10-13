import { describe, expect, it } from "vitest";
import { validateLead } from "./leads";

const valid = { name: "Ana", email: "ana@example.com", message: "Hola" };
const LISTING = "123e4567-e89b-12d3-a456-426614174000";

describe("validateLead", () => {
  it("accepts a minimal valid payload and nulls optional fields", () => {
    expect(validateLead(valid)).toEqual({
      ok: true,
      value: { ...valid, phone: null, listing_id: null },
    });
  });

  it("trims values and keeps phone and listing_id", () => {
    const r = validateLead({ name: " Ana ", email: " ana@example.com ", message: " Hi ", phone: " 300 ", listing_id: LISTING });
    expect(r).toEqual({
      ok: true,
      value: { name: "Ana", email: "ana@example.com", message: "Hi", phone: "300", listing_id: LISTING },
    });
  });

  it("accepts null phone and listing_id", () => {
    expect(validateLead({ ...valid, phone: null, listing_id: null }).ok).toBe(true);
  });

  it.each([null, "str", 5, [], undefined])("rejects non-object body %j", (body) => {
    expect(validateLead(body)).toEqual({ ok: false, errors: { body: expect.any(String) } });
  });

  it("reports every missing required field", () => {
    const r = validateLead({});
    expect(r).toEqual({
      ok: false,
      errors: { name: expect.any(String), email: expect.any(String), message: expect.any(String) },
    });
  });

  it("rejects blank and non-string required fields", () => {
    const r = validateLead({ name: "   ", email: "ana@example.com", message: 42 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["message", "name"]);
  });

  it.each(["nope", "a@b", "a b@c.com", "@c.com", "a@@c.com"])("rejects invalid email %s", (email) => {
    const r = validateLead({ ...valid, email });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toMatch(/valid/);
  });

  it("rejects a malformed listing_id", () => {
    const r = validateLead({ ...valid, listing_id: "not-a-uuid" });
    expect(r).toEqual({ ok: false, errors: { listing_id: expect.any(String) } });
  });

  it("rejects a non-string phone", () => {
    const r = validateLead({ ...valid, phone: 123 });
    expect(r).toEqual({ ok: false, errors: { phone: expect.any(String) } });
  });
});
