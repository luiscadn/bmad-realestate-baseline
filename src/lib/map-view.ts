import type { FeaturedListing } from "./featured-listings";

export const VIEWS = ["grid", "map"] as const;
export type SearchView = (typeof VIEWS)[number];

/** Anything but an explicit `map` falls back to the grid. */
export function parseView(value: string | null | undefined): SearchView {
  return value === "map" ? "map" : "grid";
}

export interface MapPin {
  listing: FeaturedListing;
  /** Position inside the map canvas, in percent from the left / top edge. */
  x: number;
  y: number;
}

const PADDING = 10;
/** Smallest span (in projected degrees) the canvas covers, so a lone pin or a tight cluster is not blown up. */
const MIN_SPAN = 0.02;

const isCoordinate = (value: unknown, limit: number): value is number =>
  (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
  Number.isFinite(Number(value)) &&
  Math.abs(Number(value)) <= limit;

const mercatorY = (latitude: number) => {
  const rad = (Math.min(Math.max(latitude, -85), 85) * Math.PI) / 180;
  return (Math.log(Math.tan(Math.PI / 4 + rad / 2)) * 180) / Math.PI;
};

/** `span` is shared by both axes so the projection keeps its aspect ratio instead of stretching each axis to fit. */
function scale(value: number, min: number, max: number, span: number): number {
  const center = (min + max) / 2;
  return PADDING + ((value - (center - span / 2)) / span) * (100 - 2 * PADDING);
}

/** Places every listing that has valid coordinates on a Web Mercator canvas fitted to the whole set. */
export function projectPins(listings: FeaturedListing[]): { pins: MapPin[]; missing: number } {
  const located = listings.filter((l) => isCoordinate(l.latitude, 90) && isCoordinate(l.longitude, 180));
  if (located.length === 0) return { pins: [], missing: listings.length };

  const xs = located.map((l) => Number(l.longitude));
  const ys = located.map((l) => mercatorY(Number(l.latitude)));
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];

  const span = Math.max(maxX - minX, maxY - minY, MIN_SPAN);

  const pins = located.map((listing, i) => ({
    listing,
    x: scale(xs[i], minX, maxX, span),
    // Screen y grows downward while latitude grows upward.
    y: 100 - scale(ys[i], minY, maxY, span),
  }));
  return { pins, missing: listings.length - located.length };
}

/**
 * Formats a USD amount into a compact luxury pin label:
 * - $25,000,000 -> "$25M"
 * - $4,750,000 -> "$4.75M"
 * - $850,000 -> "$850K"
 * - $1,000 -> "$1K"
 * - under 1,000 -> "$X"
 */
export function formatPinPriceUsd(amount: number | null | undefined): string {
  if (amount == null) return "$0";
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return "$0";
  if (num >= 1_000_000) {
    const m = Number((num / 1_000_000).toFixed(2));
    return `$${m}M`;
  }
  if (num >= 1_000) {
    const k = Number((num / 1_000).toFixed(2));
    return `$${k}K`;
  }
  return `$${Math.round(num)}`;
}

/**
 * Resolves compact pin price: uses price_usd when present, otherwise estimates USD from price_cop.
 */
export function formatPinPrice(listing: Pick<FeaturedListing, "price_usd" | "price_cop">): string {
  if (listing.price_usd != null && Number.isFinite(Number(listing.price_usd))) {
    return formatPinPriceUsd(Number(listing.price_usd));
  }
  if (listing.price_cop != null && Number.isFinite(Number(listing.price_cop))) {
    return formatPinPriceUsd(Number(listing.price_cop) / 4000);
  }
  return "$0";
}

