import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgentListing } from "@/lib/dashboard";
import { renderWithIntl } from "@/test/render";
import ListingsTable from "./ListingsTable";

const make = (over: Partial<AgentListing>): AgentListing => ({
  id: "1",
  slug: "a",
  title: "Casa Granada",
  description: "",
  operation: "sale",
  property_type: "house",
  price_cop: 450_000_000,
  area_m2: null,
  bedrooms: 0,
  bathrooms: 0,
  stratum: null,
  admin_fee_cop: null,
  neighborhood: "Granada",
  address: null,
  published_at: "2026-01-01T00:00:00Z",
  ...over,
});

afterEach(() => vi.restoreAllMocks());

function setup(listings: AgentListing[]) {
  const handlers = { onEdit: vi.fn(), onTogglePublish: vi.fn(), onDelete: vi.fn() };
  renderWithIntl(<ListingsTable listings={listings} {...handlers} />);
  return handlers;
}

describe("ListingsTable", () => {
  it("shows title, neighborhood, COP price and status badges", () => {
    setup([make({}), make({ id: "2", title: "Lote Pance", neighborhood: "Pance", price_cop: 90_000_000, published_at: null })]);
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Casa Granada")).toBeTruthy();
    expect(within(rows[1]).getByText("Granada")).toBeTruthy();
    expect(rows[1].textContent).toMatch(/450\.000\.000/);
    expect(within(rows[1]).getByText("Publicada")).toBeTruthy();
    expect(within(rows[2]).getByText("Borrador")).toBeTruthy();
  });

  it("offers Unpublish for published rows and Publish for drafts", () => {
    setup([make({}), make({ id: "2", published_at: null })]);
    expect(screen.getAllByRole("button", { name: "Despublicar" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Publicar" })).toHaveLength(1);
  });

  it("calls edit and toggle handlers with the listing", () => {
    const l = make({});
    const h = setup([l]);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Despublicar" }));
    expect(h.onEdit).toHaveBeenCalledWith(l);
    expect(h.onTogglePublish).toHaveBeenCalledWith(l);
  });

  it("deletes only after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const h = setup([make({})]);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(h.onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(h.onDelete).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0][0]).toContain("Casa Granada");
  });

  it("renders USD price and building name for Miami luxury residences", () => {
    setup([
      make({
        id: "aston-triplex",
        title: "Signature Triplex Penthouse",
        building_name: "Aston Martin Residences",
        neighborhood: "Downtown Miami",
        price_usd: 25_000_000,
        price_cop: 100_000_000_000,
      }),
    ]);
    const row = screen.getAllByRole("row")[1];
    expect(within(row).getByText("Signature Triplex Penthouse")).toBeTruthy();
    expect(within(row).getByText("Aston Martin Residences")).toBeTruthy();
    expect(within(row).getByText("Downtown Miami")).toBeTruthy();
    expect(within(row).getByText("$25,000,000")).toBeTruthy();
  });
});
