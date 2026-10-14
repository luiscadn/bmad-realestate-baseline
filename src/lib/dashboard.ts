import { OPERATIONS, PROPERTY_TYPES } from "./listings-query";

export const FORM_FIELDS = [
  "title",
  "slug",
  "description",
  "property_type",
  "operation",
  "price_cop",
  "area_m2",
  "bedrooms",
  "bathrooms",
  "stratum",
  "admin_fee_cop",
  "neighborhood",
  "address",
] as const;

export type FormField = (typeof FORM_FIELDS)[number];

export interface FormValues extends Record<FormField, string> {
  published: boolean;
}

export type FormErrorCode = "required" | "positiveInt" | "positiveNumber" | "nonNegInt" | "stratum" | "slug";
export type FormErrors = Partial<Record<FormField, FormErrorCode>>;

/** Subset of the `listings` row the dashboard reads. */
export interface AgentListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  operation: string;
  property_type: string;
  price_cop: number;
  area_m2: number | string | null;
  bedrooms: number;
  bathrooms: number;
  stratum: number | null;
  admin_fee_cop: number | null;
  neighborhood: string;
  address: string | null;
  published_at: string | null;
}

export const EMPTY_FORM: FormValues = {
  title: "",
  slug: "",
  description: "",
  property_type: PROPERTY_TYPES[0],
  operation: OPERATIONS[0],
  price_cop: "",
  area_m2: "",
  bedrooms: "",
  bathrooms: "",
  stratum: "",
  admin_fee_cop: "",
  neighborhood: "",
  address: "",
  published: false,
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const INT_RE = /^\d+$/;

export function fromListing(l: AgentListing): FormValues {
  const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    title: l.title,
    slug: l.slug,
    description: l.description ?? "",
    property_type: l.property_type,
    operation: l.operation,
    price_cop: s(l.price_cop),
    area_m2: s(l.area_m2),
    bedrooms: s(l.bedrooms),
    bathrooms: s(l.bathrooms),
    stratum: s(l.stratum),
    admin_fee_cop: s(l.admin_fee_cop),
    neighborhood: l.neighborhood,
    address: s(l.address),
    published: l.published_at !== null,
  };
}

/** Client-side mirror of the server rules, so obvious mistakes never leave the browser. */
export function validateForm(v: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!v.title.trim()) errors.title = "required";
  if (!v.neighborhood.trim()) errors.neighborhood = "required";
  if (v.slug.trim() && !SLUG_RE.test(v.slug.trim())) errors.slug = "slug";

  const price = v.price_cop.trim();
  if (!price) errors.price_cop = "required";
  else if (!INT_RE.test(price) || Number(price) < 1 || !Number.isSafeInteger(Number(price))) errors.price_cop = "positiveInt";

  const area = v.area_m2.trim();
  if (area && !(Number.isFinite(Number(area)) && Number(area) > 0)) errors.area_m2 = "positiveNumber";

  for (const key of ["bedrooms", "bathrooms", "admin_fee_cop"] as const) {
    const raw = v[key].trim();
    if (raw && !(INT_RE.test(raw) && Number.isSafeInteger(Number(raw)))) errors[key] = "nonNegInt";
  }

  const stratum = v.stratum.trim();
  if (stratum && !(INT_RE.test(stratum) && Number(stratum) >= 1 && Number(stratum) <= 6)) errors.stratum = "stratum";
  return errors;
}

/** Builds the JSON body for POST/PATCH `/api/agent/listings`. A blank slug is omitted so the server keeps/generates it. */
export function toPayload(v: FormValues): Record<string, unknown> {
  const num = (raw: string) => (raw.trim() ? Number(raw.trim()) : null);
  const payload: Record<string, unknown> = {
    title: v.title.trim(),
    description: v.description.trim(),
    property_type: v.property_type,
    operation: v.operation,
    price_cop: Number(v.price_cop.trim()),
    area_m2: num(v.area_m2),
    bedrooms: num(v.bedrooms) ?? 0,
    bathrooms: num(v.bathrooms) ?? 0,
    stratum: num(v.stratum),
    admin_fee_cop: num(v.admin_fee_cop),
    neighborhood: v.neighborhood.trim(),
    address: v.address.trim() || null,
    published: v.published,
  };
  if (v.slug.trim()) payload.slug = v.slug.trim();
  return payload;
}

/** Maps the API's `{ errors: { field: message } }` onto form fields; true when something was unmapped. */
export function mapServerErrors(errors: unknown): { fields: FormErrors; unmapped: boolean } {
  const fields: FormErrors = {};
  let unmapped = false;
  const codes: Partial<Record<FormField, FormErrorCode>> = {
    title: "required",
    neighborhood: "required",
    slug: "slug",
    price_cop: "positiveInt",
    area_m2: "positiveNumber",
    bedrooms: "nonNegInt",
    bathrooms: "nonNegInt",
    admin_fee_cop: "nonNegInt",
    stratum: "stratum",
  };
  const entries = errors && typeof errors === "object" ? Object.keys(errors) : [];
  if (!entries.length) unmapped = true;
  for (const key of entries) {
    const code = codes[key as FormField];
    if (code) fields[key as FormField] = code;
    else unmapped = true;
  }
  return { fields, unmapped };
}
