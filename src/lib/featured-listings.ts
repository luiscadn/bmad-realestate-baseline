import type { SupabaseClient } from "@supabase/supabase-js";
import { orderImages, type ListingImage } from "./listing-images";

export const FEATURED_LIMIT = 6;

export interface FeaturedListing {
  id: string;
  slug: string;
  title: string;
  operation: "sale" | "rent";
  property_type: string;
  price_cop: number;
  bedrooms: number;
  bathrooms: number;
  area_m2: number | null;
  neighborhood: string;
  images: ListingImage[];
}

/** Published listings for the Home grid: flagged-featured first, then newest. */
export async function fetchFeaturedListings(supabase: SupabaseClient, limit = FEATURED_LIMIT): Promise<FeaturedListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, slug, title, operation, property_type, price_cop, bedrooms, bathrooms, area_m2, neighborhood, images:listing_images(*)")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    ...(row as unknown as FeaturedListing),
    images: orderImages(((row as { images?: ListingImage[] }).images ?? []) as ListingImage[]),
  }));
}
