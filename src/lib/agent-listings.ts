import { MAX_SMALLINT, OPERATIONS, PROPERTY_TYPES } from "./listings-query";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 10_000;
const MAX_TEXT = 200;
const MAX_SLUG = 120;
/** price_cop is a bigint; stay within JS safe integers. */
const MAX_PRICE = Number.MAX_SAFE_INTEGER;
/** area_m2 is numeric(10,2). */
const MAX_AREA = 99_999_999.99;

export interface ListingFields {
  slug?: string;
  title?: string;
  description?: string;
  operation?: (typeof OPERATIONS)[number];
  property_type?: (typeof PROPERTY_TYPES)[number];
  price_cop?: number;
  price_usd?: number | null;
  hoa_fee_usd?: number | null;
  area_sqft?: number | null;
  building_name?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  parking_spots?: number;
  area_m2?: number | null;
  stratum?: number | null;
  admin_fee_cop?: number | null;
  neighborhood?: string;
  address?: string | null;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  featured?: boolean;
  open_house_at?: string | null;
}

export interface ListingInput {
  fields: ListingFields;
  /** Present only when the payload carried `published`. */
  published?: boolean;
}

export type ListingValidation =
  | { ok: true; value: ListingInput }
  | { ok: false; errors: Record<string, string> };

/** Lowercase, accent-free, hyphenated slug base derived from free text. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Slug for a new listing: title base plus a random suffix to avoid collisions. */
export function generateSlug(title: string): string {
  const suffix = Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  const base = slugify(title);
  return base ? `${base}-${suffix}` : `listing-${suffix}`;
}

/**
 * Validates a create (`partial: false`, required fields enforced) or update (`partial: true`) payload.
 * Unknown keys are ignored; `agent_id`, `id` and `published_at` can never be set by the client.
 */
export function validateListingInput(body: unknown, partial: boolean): ListingValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: { body: "Payload must be a JSON object" } };
  }
  const b = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const fields: ListingFields = {};
  const has = (k: string) => b[k] !== undefined;

  const text = (key: "title" | "neighborhood" | "city", max: number, required: boolean) => {
    if (!has(key)) {
      if (required) errors[key] = `${key} is required`;
      return;
    }
    const v = typeof b[key] === "string" ? (b[key] as string).trim() : "";
    if (!v) errors[key] = `${key} must be a non-empty string`;
    else if (v.length > max) errors[key] = `${key} must be at most ${max} characters`;
    else fields[key] = v;
  };

  const nullableText = (key: "address" | "building_name", max: number) => {
    if (!has(key)) return;
    if (b[key] === null) fields[key] = null;
    else if (typeof b[key] !== "string") errors[key] = `${key} must be a string or null`;
    else {
      const v = (b[key] as string).trim();
      if (v.length > max) errors[key] = `${key} must be at most ${max} characters`;
      else fields[key] = v || null;
    }
  };

  const int = (key: "price_cop" | "bedrooms" | "bathrooms" | "parking_spots", min: number, max: number, required: boolean) => {
    if (!has(key)) {
      if (required) errors[key] = `${key} is required`;
      return;
    }
    const v = b[key];
    if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min || v > max) {
      errors[key] = `${key} must be an integer between ${min} and ${max}`;
    } else fields[key] = v;
  };

  const nullableNumber = (
    key: "area_m2" | "latitude" | "longitude" | "price_usd" | "hoa_fee_usd" | "area_sqft",
    min: number,
    max: number,
    exclusiveMin = false,
  ) => {
    if (!has(key)) return;
    if (b[key] === null) {
      fields[key] = null;
      return;
    }
    const v = b[key];
    if (typeof v !== "number" || !Number.isFinite(v) || (exclusiveMin ? v <= min : v < min) || v > max) {
      errors[key] = `${key} must be a number ${exclusiveMin ? "greater than" : "between"} ${min}${exclusiveMin ? ` and at most ${max}` : ` and ${max}`} or null`;
    } else fields[key] = v;
  };

  const nullableInt = (key: "stratum" | "admin_fee_cop", min: number, max: number) => {
    if (!has(key)) return;
    if (b[key] === null) {
      fields[key] = null;
      return;
    }
    const v = b[key];
    if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min || v > max) {
      errors[key] = `${key} must be an integer between ${min} and ${max} or null`;
    } else fields[key] = v;
  };

  text("title", MAX_TITLE, !partial);
  text("neighborhood", MAX_TEXT, !partial);
  text("city", MAX_TEXT, false);
  nullableText("address", MAX_TEXT);

  if (has("description")) {
    if (typeof b.description !== "string") errors.description = "description must be a string";
    else if (b.description.length > MAX_DESCRIPTION) errors.description = `description must be at most ${MAX_DESCRIPTION} characters`;
    else fields.description = b.description.trim();
  }

  if (has("slug")) {
    const s = typeof b.slug === "string" ? b.slug.trim() : "";
    if (!s || s.length > MAX_SLUG || !SLUG_RE.test(s)) {
      errors.slug = "slug must be lowercase letters, digits and single hyphens (max 120 characters)";
    } else fields.slug = s;
  }

  if (has("operation") || !partial) {
    if (!(OPERATIONS as readonly unknown[]).includes(b.operation)) {
      errors.operation = has("operation") ? `operation must be one of: ${OPERATIONS.join(", ")}` : "operation is required";
    } else fields.operation = b.operation as ListingFields["operation"];
  }
  if (has("property_type") || !partial) {
    if (!(PROPERTY_TYPES as readonly unknown[]).includes(b.property_type)) {
      errors.property_type = has("property_type")
        ? `property_type must be one of: ${PROPERTY_TYPES.join(", ")}`
        : "property_type is required";
    } else fields.property_type = b.property_type as ListingFields["property_type"];
  }

  nullableText("building_name", MAX_TEXT);
  nullableNumber("price_usd", 0, MAX_PRICE, true);
  nullableNumber("hoa_fee_usd", 0, MAX_PRICE);
  nullableNumber("area_sqft", 0, MAX_AREA, true);

  int("price_cop", 1, MAX_PRICE, !partial && !has("price_usd"));
  int("bedrooms", 0, MAX_SMALLINT, false);
  int("bathrooms", 0, MAX_SMALLINT, false);
  int("parking_spots", 0, MAX_SMALLINT, false);
  nullableNumber("area_m2", 0, MAX_AREA, true);
  nullableInt("stratum", 1, 6);
  nullableInt("admin_fee_cop", 0, MAX_PRICE);
  nullableNumber("latitude", -90, 90);
  nullableNumber("longitude", -180, 180);

  // Auto-derive COP and m2 from USD/sqft if not provided on create
  if (fields.price_usd && !fields.price_cop && !partial) {
    fields.price_cop = Math.round(fields.price_usd * 4000);
  }
  if (fields.area_sqft && !fields.area_m2 && !partial) {
    fields.area_m2 = Math.round((fields.area_sqft / 10.7639) * 100) / 100;
  }

  if (has("featured")) {
    if (typeof b.featured !== "boolean") errors.featured = "featured must be a boolean";
    else fields.featured = b.featured;
  }

  if (has("open_house_at")) {
    if (b.open_house_at === null) fields.open_house_at = null;
    else if (typeof b.open_house_at !== "string" || Number.isNaN(Date.parse(b.open_house_at))) {
      errors.open_house_at = "open_house_at must be an ISO 8601 date string or null";
    } else fields.open_house_at = new Date(b.open_house_at).toISOString();
  }

  let published: boolean | undefined;
  if (has("published")) {
    if (typeof b.published !== "boolean") errors.published = "published must be a boolean";
    else published = b.published;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  if (partial && published === undefined && Object.keys(fields).length === 0) {
    return { ok: false, errors: { body: "Provide at least one field to update" } };
  }
  return { ok: true, value: { fields, published } };
}
