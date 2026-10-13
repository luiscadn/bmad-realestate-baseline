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
