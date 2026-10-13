import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { orderImages, type ListingImage } from "./listing-images";
import type { ListingsQuery } from "./listings-query";

export interface ListingsPage {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** PostgREST error returned when the requested offset is beyond the last row. */
const RANGE_NOT_SATISFIABLE = "PGRST103";

/** Escapes LIKE wildcards so user input is matched literally by `ilike`. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<T extends PostgrestFilterBuilder<any, any, any, any, any, any, any>>(query: T, q: ListingsQuery): T {
  let f = query.not("published_at", "is", null).lte("published_at", new Date().toISOString()) as T;
  if (q.operation) f = f.eq("operation", q.operation) as T;
  if (q.propertyType) f = f.eq("property_type", q.propertyType) as T;
  if (q.neighborhood) f = f.ilike("neighborhood", escapeLike(q.neighborhood)) as T;
  if (q.minPrice !== undefined) f = f.gte("price_cop", q.minPrice) as T;
  if (q.maxPrice !== undefined) f = f.lte("price_cop", q.maxPrice) as T;
  if (q.bedrooms !== undefined) f = f.gte("bedrooms", q.bedrooms) as T;
  if (q.bathrooms !== undefined) f = f.gte("bathrooms", q.bathrooms) as T;
  return f;
}

export async function fetchListings(supabase: SupabaseClient, q: ListingsQuery): Promise<ListingsPage> {
  let query = applyFilters(supabase.from("listings").select("*, images:listing_images(*)", { count: "exact" }), q);

  if (q.sort === "price_asc") query = query.order("price_cop", { ascending: true });
  else if (q.sort === "price_desc") query = query.order("price_cop", { ascending: false });
  else query = query.order("published_at", { ascending: false });
  // Stable tiebreaker so pages never overlap or skip rows.
  query = query.order("id", { ascending: true });

  const from = (q.page - 1) * q.limit;
  const { data, error, count } = await query.range(from, from + q.limit - 1);

  let total = count ?? 0;
  if (error) {
    if (error.code !== RANGE_NOT_SATISFIABLE) throw new Error(error.message);
    // Page past the end: still report the true total with an empty page.
    const head = await applyFilters(supabase.from("listings").select("id", { count: "exact", head: true }), q);
    if (head.error) throw new Error(head.error.message);
    total = head.count ?? 0;
  }

  return {
    data: (error ? [] : (data ?? [])).map((row) => ({
      ...row,
      images: orderImages((row.images ?? []) as ListingImage[]),
    })),
    total,
    page: q.page,
    limit: q.limit,
    total_pages: Math.ceil(total / q.limit),
  };
}
