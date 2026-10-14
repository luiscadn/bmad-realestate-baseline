import { describe, expect, it } from "vitest";
import { parseNewsletterBody, validateNewsletter } from "./newsletter";

const ok = { name: "Ana", email: "ana@example.com", consent: true };

describe("validateNewsletter", () => {
  it("accepts valid input", () => {
    expect(validateNewsletter(ok)).toEqual({});
    expect(validateNewsletter({ ...ok, name: "  Ana  ", email: " ana@example.co.uk " })).toEqual({});
  });

  it("requires name, email and consent", () => {
    expect(validateNewsletter({ name: " ", email: "", consent: false })).toEqual({
      name: "required",
      email: "required",
      consent: "required",
    });
  });

  it.each(["ana", "ana@", "@example.com", "ana@example", "ana @example.com", "ana@exa..com"])(
    "rejects invalid email %s",
    (email) => {
      expect(validateNewsletter({ ...ok, email })).toEqual({ email: "invalid" });
    },
  );

  it("rejects overly long values", () => {
    expect(validateNewsletter({ ...ok, name: "a".repeat(201) })).toEqual({ name: "tooLong" });
    expect(validateNewsletter({ ...ok, email: `${"a".repeat(250)}@x.co` })).toEqual({ email: "tooLong" });
  });
});

describe("parseNewsletterBody", () => {
  it("lowercases the email and sanitizes the name", () => {
    expect(parseNewsletterBody({ email: " Ana@Example.com ", name: "A\u0000na\t Maria" })).toEqual({
      ok: true,
      value: { email: "ana@example.com", name: "A na Maria" },
    });
  });

  it("treats a missing name as null and rejects bad input", () => {
    expect(parseNewsletterBody({ email: "a@b.co" })).toEqual({ ok: true, value: { email: "a@b.co", name: null } });
    expect(parseNewsletterBody({ email: "nope" }).ok).toBe(false);
    expect(parseNewsletterBody("x").ok).toBe(false);
  });
});
