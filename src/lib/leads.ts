export type LeadInput = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  listing_id: string | null;
};

export type LeadValidation =
  | { ok: true; value: LeadInput }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const asTrimmed = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateLead(body: unknown): LeadValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: { body: "Payload must be a JSON object" } };
  }
  const b = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = asTrimmed(b.name);
  const email = asTrimmed(b.email);
  const message = asTrimmed(b.message);
  const phone = asTrimmed(b.phone);
  const listingId = asTrimmed(b.listing_id);

  if (!name) errors.name = "name is required";
  if (!email) errors.email = "email is required";
  else if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = "email must be a valid email address";
  if (!message) errors.message = "message is required";
  if (b.phone != null && typeof b.phone !== "string") errors.phone = "phone must be a string";
  if (b.listing_id != null && (typeof b.listing_id !== "string" || (listingId && !UUID_RE.test(listingId)))) {
    errors.listing_id = "listing_id must be a valid UUID";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, email, message, phone: phone || null, listing_id: listingId || null } };
}
