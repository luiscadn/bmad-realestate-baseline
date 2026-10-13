export const PROPERTY_TYPES = ["apartment", "house", "penthouse", "townhouse", "land", "office", "commercial"] as const;
export const OPERATIONS = ["sale", "rent"] as const;
export const SORTS = ["price_asc", "price_desc", "newest"] as const;

export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;
export const MAX_PAGE = 100_000;

export type Operation = (typeof OPERATIONS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ListingSort = (typeof SORTS)[number];

export interface ListingsQuery {
  operation?: Operation;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType;
  sort: ListingSort;
  page: number;
  limit: number;
}

export type ParseResult = { ok: true; value: ListingsQuery } | { ok: false; errors: Record<string, string> };

/** Reads a param as a trimmed string; empty or missing means "not provided". */
function read(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key)?.trim();
  return v ? v : undefined;
}

export function parseListingsQuery(params: URLSearchParams): ParseResult {
  const errors: Record<string, string> = {};

  const int = (key: string, min: number, max = Number.MAX_SAFE_INTEGER): number | undefined => {
    const raw = read(params, key);
    if (raw === undefined) return undefined;
    const n = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < min || n > max) {
      errors[key] = max === Number.MAX_SAFE_INTEGER ? `must be an integer >= ${min}` : `must be an integer between ${min} and ${max}`;
      return undefined;
    }
    return n;
  };

  const oneOf = <T extends string>(key: string, allowed: readonly T[]): T | undefined => {
    const raw = read(params, key);
    if (raw === undefined) return undefined;
    if (!(allowed as readonly string[]).includes(raw)) {
      errors[key] = `must be one of: ${allowed.join(", ")}`;
      return undefined;
    }
    return raw as T;
  };

  const operation = oneOf("operation", OPERATIONS);
  const propertyType = oneOf("property_type", PROPERTY_TYPES);
  const sort = oneOf("sort", SORTS) ?? "newest";
  const minPrice = int("min_price", 0);
  const maxPrice = int("max_price", 0);
  const bedrooms = int("bedrooms", 0);
  const bathrooms = int("bathrooms", 0);
  const page = int("page", 1, MAX_PAGE) ?? 1;
  const limit = int("limit", 1, MAX_LIMIT) ?? DEFAULT_LIMIT;
  const neighborhood = read(params, "neighborhood");

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    errors.min_price = "must be less than or equal to max_price";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { operation, neighborhood, minPrice, maxPrice, bedrooms, bathrooms, propertyType, sort, page, limit } };
}
