import type { SupabaseClient } from "@supabase/supabase-js";

export const LISTING_IMAGES_BUCKET = "listing-images";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  alt_text: string | null;
  position: number;
  created_at?: string;
}

export class ListingImageError extends Error {}

export function validateImageFile(file: { type: string; size: number }): void {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new ListingImageError(`Unsupported image type: ${file.type || "unknown"}`);
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new ListingImageError("Image must be between 1 byte and 10 MB");
  }
}

/** Storage object path: `{listingId}/{uuid}.{ext}` — the first folder is what storage RLS checks. */
export function buildImagePath(listingId: string, mimeType: string, uuid: string = crypto.randomUUID()): string {
  const ext = EXTENSIONS[mimeType];
  if (!ext) throw new ListingImageError(`Unsupported image type: ${mimeType}`);
  return `${listingId}/${uuid}.${ext}`;
}

/** Sorts by position, then created_at, then id so ties are deterministic. Does not mutate. */
export function orderImages<T extends Pick<ListingImage, "id" | "position" | "created_at">>(images: T[]): T[] {
  return [...images].sort(
    (a, b) =>
      a.position - b.position ||
      (a.created_at ?? "").localeCompare(b.created_at ?? "") ||
      a.id.localeCompare(b.id),
  );
}

export function nextPosition(images: Pick<ListingImage, "position">[]): number {
  return images.length === 0 ? 0 : Math.max(...images.map((i) => i.position)) + 1;
}

/** Returns the ids in their new order after moving `id` to `toIndex` (clamped). */
export function moveImage(orderedIds: string[], id: string, toIndex: number): string[] {
  const from = orderedIds.indexOf(id);
  if (from === -1) throw new ListingImageError(`Image ${id} is not in this listing`);
  const next = [...orderedIds];
  next.splice(from, 1);
  next.splice(Math.min(Math.max(toIndex, 0), next.length), 0, id);
  return next;
}

/** Extracts the object path from a public bucket URL, or null if it is not one of ours. */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${LISTING_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const raw = url.slice(i + marker.length).split(/[?#]/)[0];
  try {
    return raw ? decodeURIComponent(raw) : null;
  } catch {
    return null;
  }
}

export async function listListingImages(supabase: SupabaseClient, listingId: string): Promise<ListingImage[]> {
  const { data, error } = await supabase
    .from("listing_images")
    .select("*")
    .eq("listing_id", listingId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new ListingImageError(error.message);
  return (data ?? []) as ListingImage[];
}

export async function uploadListingImage(
  supabase: SupabaseClient,
  listingId: string,
  file: Blob,
  altText?: string,
): Promise<ListingImage> {
  validateImageFile(file);
  const existing = await listListingImages(supabase, listingId);
  const path = buildImagePath(listingId, file.type);

  const { error: uploadError } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new ListingImageError(uploadError.message);

  const { data: pub } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from("listing_images")
    .insert({ listing_id: listingId, url: pub.publicUrl, alt_text: altText ?? null, position: nextPosition(existing) })
    .select()
    .single();
  if (error) {
    await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]);
    throw new ListingImageError(error.message);
  }
  return data as ListingImage;
}

/** Persists a new order: `orderedIds` must be exactly the listing's image ids. Writes dense positions 0..n-1. */
export async function reorderListingImages(
  supabase: SupabaseClient,
  listingId: string,
  orderedIds: string[],
): Promise<void> {
  const current = await listListingImages(supabase, listingId);
  const byId = new Map(current.map((i) => [i.id, i]));
  if (
    orderedIds.length !== byId.size ||
    new Set(orderedIds).size !== orderedIds.length ||
    !orderedIds.every((id) => byId.has(id))
  ) {
    throw new ListingImageError("orderedIds must contain each image of the listing exactly once");
  }
  for (const [position, id] of orderedIds.entries()) {
    if (byId.get(id)!.position === position) continue;
    const { data, error } = await supabase
      .from("listing_images")
      .update({ position })
      .eq("id", id)
      .eq("listing_id", listingId)
      .select("id");
    if (error) throw new ListingImageError(error.message);
    // RLS filters rows silently: zero rows updated means not found or not permitted.
    if (!data?.length) throw new ListingImageError(`Image ${id} could not be updated`);
  }
}

export async function deleteListingImage(supabase: SupabaseClient, image: ListingImage): Promise<void> {
  const { data, error } = await supabase.from("listing_images").delete().eq("id", image.id).select("id");
  if (error) throw new ListingImageError(error.message);
  if (!data?.length) throw new ListingImageError(`Image ${image.id} could not be deleted`);
  const path = pathFromPublicUrl(image.url);
  const removal = path ? await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]) : null;
  // Close the gap so positions stay dense.
  const remaining = await listListingImages(supabase, image.listing_id);
  await reorderListingImages(supabase, image.listing_id, remaining.map((i) => i.id));
  if (removal?.error) throw new ListingImageError(`Image row deleted but storage object remains: ${removal.error.message}`);
}
