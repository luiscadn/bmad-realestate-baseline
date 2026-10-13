import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import type { FeaturedListing } from "@/lib/featured-listings";
import SearchResults from "./SearchResults";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img {...props} />,
}));

const make = (id: string): FeaturedListing => ({
  id,
  slug: `casa-${id}`,
  title: `Casa ${id}`,
  operation: "sale",
  property_type: "house",
  price_cop: 400_000_000,
  bedrooms: 3,
  bathrooms: 2,
  area_m2: 120,
  neighborhood: "Granada",
  images: [],
});

describe("SearchResults", () => {
  it("renders a card per listing with the result count", () => {
    renderWithIntl(<SearchResults listings={[make("1"), make("2")]} total={2} page={1} totalPages={1} query={{}} />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("2 propiedades encontradas")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("shows the fallback message and a clear-filters link when empty", () => {
    renderWithIntl(<SearchResults listings={[]} total={0} page={1} totalPages={0} query={{ operation: "rent" }} />, "en");
    expect(screen.getByText("No properties match your filters")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Clear filters" }).getAttribute("href")).toBe("/search");
  });

  it("shows an error alert with a reset link when loading failed", () => {
    renderWithIntl(<SearchResults listings={[]} total={0} page={1} totalPages={0} query={{}} failed />);
    expect(screen.getByRole("alert").textContent).toContain("No pudimos cargar");
    expect(screen.getByRole("link", { name: "Limpiar filtros" }).getAttribute("href")).toBe("/search");
  });

  it("links to adjacent pages keeping the filters, with page omitted for page 1", () => {
    renderWithIntl(<SearchResults listings={[make("1")]} total={30} page={2} totalPages={3} query={{ operation: "sale" }} />);
    expect(screen.getByRole("link", { name: /Anterior/ }).getAttribute("href")).toBe("/search?operation=sale");
    expect(screen.getByRole("link", { name: /Siguiente/ }).getAttribute("href")).toBe("/search?operation=sale&page=3");
    expect(screen.getByText("Página 2 de 3")).toBeTruthy();
  });
});

describe("SearchResults map view", () => {
  it("renders the split map view and keeps view=map in pagination links", () => {
    renderWithIntl(
      <SearchResults listings={[{ ...make("1"), latitude: 3.4, longitude: -76.5 }]} total={30} page={1} totalPages={3} query={{ operation: "sale" }} view="map" />,
    );
    expect(screen.getAllByTestId("map-pin")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Siguiente/ }).getAttribute("href")).toBe("/search?operation=sale&view=map&page=2");
  });
});
