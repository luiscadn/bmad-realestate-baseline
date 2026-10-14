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
    const tokens = (id: string) => screen.getByTestId(id).className.split(/\s+/);
    expect(tokens("map-pane")).toContain("block");
    expect(tokens("map-list")).toContain("hidden");
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(tokens("map-list")).toContain("grid");
    expect(tokens("map-list")).not.toContain("hidden");
    expect(tokens("map-pane")).toContain("hidden");
    expect(tokens("map-pane")).not.toContain("block");
    expect(screen.getByRole("button", { name: "List" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("renders compact USD luxury pin badges and previews building name and HOA for Miami residences", () => {
    const miamiListings = [
      make("aston", {
        slug: "aston-martin-residences-bayfront",
        title: "Panoramic Bayfront Residence",
        building_name: "Aston Martin Residences",
        neighborhood: "Downtown Miami",
        price_usd: 4_750_000,
        hoa_fee_usd: 2_850,
        latitude: 25.7709,
        longitude: -80.1877,
      }),
      make("porsche", {
        slug: "porsche-design-tower-sky-villa",
        title: "Sky Villa with Dezervator",
        building_name: "Porsche Design Tower",
        neighborhood: "Sunny Isles Beach",
        price_usd: 8_900_000,
        hoa_fee_usd: 4_200,
        latitude: 25.9482,
        longitude: -80.1200,
      }),
    ];

    renderWithIntl(<SearchMapView listings={miamiListings} />, "en");

    const pins = screen.getAllByTestId("map-pin");
    expect(pins).toHaveLength(2);
    // Aston Martin ($4.75M) and Porsche Design Tower ($8.9M)
    expect(pins[0].textContent).toBe("$4.75M");
    expect(pins[1].textContent).toBe("$8.9M");

    // Click on Aston Martin pin
    fireEvent.click(pins[0]);
    const preview = screen.getByTestId("map-preview");
    expect(within(preview).getByText(/4,750,000/)).toBeTruthy();
    expect(within(preview).getByTestId("preview-building").textContent).toBe("Aston Martin Residences");
    expect(within(preview).getByTestId("preview-neighborhood").textContent).toBe("Downtown Miami");
    expect(within(preview).getByText(/HOA:\s*\$2,850\/mo/)).toBeTruthy();
    expect(within(preview).getByRole("link", { name: /View property/ }).getAttribute("href")).toBe("/listings/aston-martin-residences-bayfront");
  });
});

