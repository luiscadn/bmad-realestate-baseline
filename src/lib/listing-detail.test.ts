import { describe, expect, it } from "vitest";
import { getCountdown, validateContactForm } from "./listing-detail";

const NOW = Date.parse("2026-10-13T12:00:00Z");
const valid = { name: "Ana", email: "ana@example.com", phone: "+57 300 123 4567", message: "Hola" };

describe("getCountdown", () => {
  it("splits the remaining time into d/h/m/s", () => {
    expect(getCountdown("2026-10-15T13:02:03Z", NOW)).toEqual({ days: 2, hours: 1, minutes: 2, seconds: 3 });
  });
  it.each([null, undefined, "", "not-a-date", "2026-10-13T12:00:00Z", "2026-10-13T11:59:00Z"])("is null for %s", (t) => {
    expect(getCountdown(t, NOW)).toBeNull();
  });
  it("is null when less than one second remains", () => {
    expect(getCountdown("2026-10-13T12:00:00.500Z", NOW)).toBeNull();
  });
});

describe("validateContactForm", () => {
  it("accepts valid input and an empty phone", () => {
    expect(validateContactForm(valid)).toEqual({});
    expect(validateContactForm({ ...valid, phone: "  " })).toEqual({});
  });
  it("flags required fields", () => {
    expect(validateContactForm({ name: " ", email: "", phone: "", message: "" })).toEqual({
      name: "required",
      email: "required",
      message: "required",
    });
  });
  it.each(["a@b", "a b@c.com", "a@.com"])("rejects email %s", (email) => {
    expect(validateContactForm({ ...valid, email }).email).toBe("invalid");
  });
  it.each(["abc", "123", "+57 abc 1234567"])("rejects phone %s", (phone) => {
    expect(validateContactForm({ ...valid, phone }).phone).toBe("invalid");
  });
  it("enforces maximum lengths", () => {
    expect(validateContactForm({ ...valid, name: "a".repeat(201) }).name).toBe("tooLong");
    expect(validateContactForm({ ...valid, message: "a".repeat(5001) }).message).toBe("tooLong");
    expect(validateContactForm({ ...valid, phone: "1".repeat(41) }).phone).toBe("tooLong");
  });
});
