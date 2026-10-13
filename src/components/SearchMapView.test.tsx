import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import type { FeaturedListing } from "@/lib/featured-listings";
import SearchMapView from "./SearchMapView";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img {...props} />,
}));

const make = (id: string, extra: Partial<FeaturedListing> = {}): FeaturedListing => ({
  id,
  slug: `casa-${id}`,
  title: `Casa ${id}`,
  operation: "sale",
  property_type: "house",
  price_cop: 400_000_000,
  bedrooms: 3,
  bathrooms: 2,
  area_m2: 120,
  neighborhood: `Barrio ${id}`,
  latitude: 3.4 + Number(id) / 100,
  longitude: -76.5 + Number(id) / 100,
  images: [{ id: `i${id}`, url: `https://img.test/${id}.jpg`, alt_text: null, position: 0 } as FeaturedListing["images"][number]],
  ...extra,
});

describe("SearchMapView", () => {
  it("renders one card and one pin per located listing", () => {
    renderWithIntl(<SearchMapView listings={[make("1"), make("2"), make("3", { latitude: null, longitude: null })]} />);
    expect(within(screen.getByTestId("map-list")).getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByTestId("map-pin")).toHaveLength(2);
    expect(screen.getByText("1 propiedad no tiene ubicación y solo aparece en la lista")).toBeTruthy();
    expect(screen.queryByTestId("map-preview")).toBeNull();
  });

  it("shows the preview card with thumbnail, COP price, title, neighborhood and link on pin click", () => {
    renderWithIntl(<SearchMapView listings={[make("1"), make("2")]} />);
    fireEvent.click(screen.getAllByTestId("map-pin")[1]);
    const preview = screen.getByTestId("map-preview");
    expect(within(preview).getByRole("img").getAttribute("src")).toBe("https://img.test/2.jpg");
    expect(within(preview).getByText(/400\.000\.000/)).toBeTruthy();
    expect(within(preview).getByText("Casa 2")).toBeTruthy();
    expect(within(preview).getByTestId("preview-neighborhood").textContent).toBe("Barrio 2");
    expect(within(preview).getByRole("link", { name: /Ver propiedad/ }).getAttribute("href")).toBe("/listings/casa-2");
  });

  it("closes the preview with the close button, Escape, or re-clicking the pin", () => {
    renderWithIntl(<SearchMapView listings={[make("1")]} />);
    const pin = () => screen.getByTestId("map-pin");
    fireEvent.click(pin());
    fireEvent.click(screen.getByRole("button", { name: "Cerrar vista previa" }));
    expect(screen.queryByTestId("map-preview")).toBeNull();
    fireEvent.click(pin());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("map-preview")).toBeNull();
    fireEvent.click(pin());
    fireEvent.click(pin());
    expect(screen.queryByTestId("map-preview")).toBeNull();
  });

  it("shows a per-month suffix for rentals and a placeholder without photo", () => {
    renderWithIntl(<SearchMapView listings={[make("1", { operation: "rent", images: [] })]} />, "en");
    fireEvent.click(screen.getByTestId("map-pin"));
    const preview = screen.getByTestId("map-preview");
    expect(within(preview).getByText("/month")).toBeTruthy();
    expect(within(preview).getByText("No photo")).toBeTruthy();
  });

  it("explains when no listing has coordinates", () => {
    renderWithIntl(<SearchMapView listings={[make("1", { latitude: null, longitude: null })]} />, "en");
    expect(screen.queryByTestId("map-pin")).toBeNull();
    expect(screen.getByText("None of these properties has a location on the map yet.")).toBeTruthy();
  });

  it("switches the mobile pane between list and map", () => {
    renderWithIntl(<SearchMapView listings={[make("1")]} />, "en");
    expect(screen.getByTestId("map-pane").className).toContain("block");
    expect(screen.getByTestId("map-list").className).toContain("hidden");
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByTestId("map-list").className).not.toContain("hidden lg:grid");
    expect(screen.getByTestId("map-pane").className).toContain("hidden");
    expect(screen.getByRole("button", { name: "List" }).getAttribute("aria-pressed")).toBe("true");
  });
});
