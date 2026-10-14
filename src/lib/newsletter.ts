export type NewsletterValues = { name: string; email: string; consent: boolean };
export type NewsletterField = keyof NewsletterValues;
export type NewsletterErrorCode = "required" | "invalid" | "tooLong";
export type NewsletterErrors = Partial<Record<NewsletterField, NewsletterErrorCode>>;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX = { name: 200, email: 254 } as const;

/** Returns error codes, which the UI maps to messages. */
export function validateNewsletter(values: NewsletterValues): NewsletterErrors {
  const errors: NewsletterErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) errors.name = "required";
  else if (name.length > MAX.name) errors.name = "tooLong";
  if (!email) errors.email = "required";
  else if (email.length > MAX.email) errors.email = "tooLong";
  else if (!EMAIL_RE.test(email)) errors.email = "invalid";
  if (!values.consent) errors.consent = "required";
  return errors;
}

export type NewsletterInput = { email: string; name: string | null };

export type NewsletterParse =
  | { ok: true; value: NewsletterInput }
  | { ok: false; errors: Record<string, string> };

// Strips control characters and collapses whitespace.
const clean = (v: string) => v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();

/** Server-side parsing of the POST /api/newsletter body: sanitizes and lowercases the email, name is optional. */
export function parseNewsletterBody(body: unknown): NewsletterParse {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: { body: "Payload must be a JSON object" } };
  }
  const b = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  if (typeof b.email !== "string" || !b.email.trim()) errors.email = "email is required";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (email && (email.length > MAX.email || !EMAIL_RE.test(email))) {
    errors.email = "email must be a valid email address";
  }

  let name: string | null = null;
  if (b.name != null) {
    if (typeof b.name !== "string") errors.name = "name must be a string";
    else {
      name = clean(b.name) || null;
      if (name && name.length > MAX.name) errors.name = `name must be at most ${MAX.name} characters`;
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { email, name } };
}
