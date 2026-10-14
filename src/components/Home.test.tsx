import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { routerPush } from "@/test/setup";
import { renderWithIntl } from "@/test/render";
import type { FeaturedListing } from "@/lib/featured-listings";
import FeaturedListings from "./FeaturedListings";
import HeroSearch from "./HeroSearch";
import { ProcessSteps, ServiceCards } from "./HomeSections";

const listing: FeaturedListing = {
  id: "1",
  slug: "penthouse-el-penon",
  title: "Penthouse con terraza",
  operation: "sale",
  property_type: "penthouse",
  price_cop: 1_250_000_000,
  bedrooms: 3,
  bathrooms: 1,
  area_m2: 180,
  neighborhood: "El Peñón",
  images: [],
};

describe("HeroSearch", () => {
  beforeEach(() => routerPush.mockClear());

  it("is a GET form to the locale's /search with the listing query param names", () => {
    const { container, unmount } = renderWithIntl(<HeroSearch />, "es");
    const form = container.querySelector("form")!;
    expect(form.getAttribute("action")).toBe("/search");
    expect(form.getAttribute("method")).toBe("get");
    const names = [...form.querySelectorAll("select")].map((s) => s.getAttribute("name"));
    expect(names).toEqual(["operation", "neighborhood", "property_type"]);
    unmount();
    const en = renderWithIntl(<HeroSearch />, "en");
    expect(en.container.querySelector("form")!.getAttribute("action")).toBe("/en/search");
  });

  it("leaves unselected fields empty so they are ignored by the query parser", () => {
    const { container } = renderWithIntl(<HeroSearch />);
    const data = new URLSearchParams(new FormData(container.querySelector("form")!) as unknown as Record<string, string>);
    expect([...data.values()].every((v) => v === "")).toBe(true);
    expect(screen.getByRole("button", { name: "Buscar" })).toBeTruthy();
  });

  it("pushes /search with no params when nothing is selected", () => {
    const { container } = renderWithIntl(<HeroSearch />);
    fireEvent.submit(container.querySelector("form")!);
    expect(routerPush).toHaveBeenCalledWith("/search");
  });

  it("pushes only the chosen params", () => {
    const { container } = renderWithIntl(<HeroSearch />);
    const form = container.querySelector("form")!;
    fireEvent.change(form.querySelector("select[name=operation]")!, { target: { value: "sale" } });
    fireEvent.change(form.querySelector("select[name=neighborhood]")!, { target: { value: "Brickell" } });
    fireEvent.submit(form);
    expect(routerPush).toHaveBeenCalledWith("/search?operation=sale&neighborhood=Brickell");
  });
});

describe("FeaturedListings", () => {
  it("renders a card with title, neighborhood, COP price and link", () => {
    renderWithIntl(<FeaturedListings listings={[listing]} />);
    const link = screen.getByRole("link", { name: /Penthouse con terraza/ });
    expect(link.getAttribute("href")).toBe("/listings/penthouse-el-penon");
    expect(within(link).getByText("El Peñón")).toBeTruthy();
    expect(within(link).getByText(/1\.250\.000\.000/)).toBeTruthy();
    expect(within(link).getByText("En venta")).toBeTruthy();
  });

  it("renders Miami luxury residence with USD price, building badge, and square footage", () => {
    const miamiListing: FeaturedListing = {
      id: "aston-1",
      slug: "aston-martin-residences-triplex-penthouse",
      title: "Signature Triplex Penthouse",
      building_name: "Aston Martin Residences",
      operation: "sale",
      property_type: "penthouse",
      price_cop: 100_000_000_000,
      price_usd: 25_000_000,
      bedrooms: 5,
      bathrooms: 6,
      area_sqft: 8900,
      area_m2: 826.8,
      neighborhood: "Downtown Miami",
      images: [],
    };
    renderWithIntl(<FeaturedListings listings={[miamiListing]} />, "en");
    const link = screen.getByRole("link", { name: /Signature Triplex Penthouse/ });
    expect(link.getAttribute("href")).toBe("/listings/aston-martin-residences-triplex-penthouse");
    expect(within(link).getByTestId("building-badge").textContent).toBe("Aston Martin Residences");
    expect(within(link).getByTestId("neighborhood-badge").textContent).toBe("Downtown Miami");
    expect(within(link).getByText(/25,000,000/)).toBeTruthy();
    expect(within(link).getByTestId("sqft-badge").textContent).toBe("8,900 sq ft");
  });

  it("shows a fallback when there are no listings", () => {
    renderWithIntl(<FeaturedListings listings={[]} />, "en");
    expect(screen.getByText(/New Miami ultra-luxury residences coming soon/)).toBeTruthy();
  });
});

describe("ProcessSteps and ServiceCards", () => {
  it("render 3 steps and 3 services in Spanish", () => {
    renderWithIntl(
      <>
        <ProcessSteps />
        <ServiceCards />
      </>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("Habla con tu asesora")).toBeTruthy();
    for (const name of ["Comprar", "Vender", "Arrendar"]) expect(screen.getByRole("heading", { name })).toBeTruthy();
  });

  it("render in English and link services to search", () => {
    renderWithIntl(<ServiceCards />, "en");
    expect(screen.getByRole("heading", { name: "Sell" })).toBeTruthy();
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/search?operation=sale", "/contact", "/search?operation=rent"]);
  });
});
