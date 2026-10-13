import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import type { FeaturedListing } from "@/lib/featured-listings";
import ListingCard from "./ListingCard";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img data-next-image="true" {...props} />,
}));

const listing: FeaturedListing = {
  id: "1",
  slug: "penthouse-el-penon",
  title: "Penthouse con terraza",
  operation: "sale",
  property_type: "penthouse",
  price_cop: 1_250_000_000,
  bedrooms: 3,
  bathrooms: 2,
  area_m2: 180,
  neighborhood: "El Peñón",
  images: [{ id: "i", listing_id: "1", url: "https://abc.supabase.co/storage/v1/object/public/listing-images/1/a.jpg", alt_text: "Terraza", position: 0 }],
};

describe("ListingCard", () => {
  it("renders image, COP price, facts, badges and the detail link", () => {
    const { container } = renderWithIntl(<ListingCard listing={listing} />, "es");
    const img = container.querySelector("img[data-next-image]")!;
    expect(img.getAttribute("src")).toBe(listing.images[0].url);
    expect(img.getAttribute("alt")).toBe("Terraza");
    expect(container.textContent).toMatch(/1\.250\.000\.000\s?COP/);
    expect(screen.getByText("3 habitaciones")).toBeTruthy();
    expect(screen.getByText("2 baños")).toBeTruthy();
    expect(screen.getByText("180 m²")).toBeTruthy();
    expect(screen.getByTestId("neighborhood-badge").textContent).toBe("El Peñón");
    expect(screen.getByTestId("operation-badge").textContent).toBe("En venta");
    expect(screen.queryByText("/mes")).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/listings/penthouse-el-penon");
  });

  it("falls back to the title as alt text and shows a placeholder without images", () => {
    const withoutAlt = { ...listing, images: [{ ...listing.images[0], alt_text: null }] };
    const { container, unmount } = renderWithIntl(<ListingCard listing={withoutAlt} />);
    expect(container.querySelector("img")!.getAttribute("alt")).toBe("Penthouse con terraza");
    unmount();
    const none = renderWithIntl(<ListingCard listing={{ ...listing, images: [] }} />);
    expect(none.container.querySelector("img")).toBeNull();
    expect(screen.getByText("Sin foto")).toBeTruthy();
  });

  it("marks rentals with the monthly suffix and the rent badge, in English", () => {
    renderWithIntl(<ListingCard listing={{ ...listing, operation: "rent", bedrooms: 1, area_m2: null }} />, "en");
    expect(screen.getByTestId("operation-badge").textContent).toBe("For rent");
    expect(screen.getByText("/month")).toBeTruthy();
    expect(screen.getByText("1 bedroom")).toBeTruthy();
    expect(screen.queryByText(/m²/)).toBeNull();
  });
});
