import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import es from "../../../../messages/es.json";

const fetchListings = vi.fn();
vi.mock("@/lib/listings", () => ({ fetchListings: (...args: unknown[]) => fetchListings(...args) }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({}) }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async (ns: string) => (key: string) =>
    [ns, ...key.split(".")].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], es) as string,
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img {...props} />,
}));

import SearchPage from "./page";

async function renderPage(search: Record<string, string | string[]> = {}) {
  const ui = await SearchPage({ params: Promise.resolve({ locale: "es" }), searchParams: Promise.resolve(search) });
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const row = {
  id: "1",
  slug: "casa-1",
  title: "Casa 1",
  operation: "rent",
  property_type: "house",
  price_cop: 3_000_000,
  bedrooms: 2,
  bathrooms: 1,
  area_m2: 80,
  neighborhood: "Pance",
  images: [],
};

describe("SearchPage", () => {
  beforeEach(() => {
    fetchListings.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("parses URL params into the listings query and renders the results", async () => {
    fetchListings.mockResolvedValue({ data: [row], total: 1, page: 1, limit: 12, total_pages: 1 });
    await renderPage({ operation: "rent", bedrooms: "2", min_price: "1000000" });
    const query = fetchListings.mock.calls[0][1];
    expect(query).toMatchObject({ operation: "rent", bedrooms: 2, minPrice: 1_000_000, sort: "newest", page: 1 });
    expect(screen.getByText("Casa 1")).toBeTruthy();
    expect((document.querySelector("[name=operation]") as HTMLSelectElement).value).toBe("rent");
    expect(screen.getByText("1 propiedad encontrada")).toBeTruthy();
  });

  it("shows the empty fallback when nothing matches", async () => {
    fetchListings.mockResolvedValue({ data: [], total: 0, page: 1, limit: 12, total_pages: 0 });
    await renderPage();
    expect(screen.getByText("Ninguna propiedad coincide con tus filtros")).toBeTruthy();
    expect(screen.getByText("Limpiar filtros", { selector: "a.inline-block" }).getAttribute("href")).toBe("/search");
  });

  it("ignores invalid params, keeps valid ones and tells the visitor", async () => {
    fetchListings.mockResolvedValue({ data: [], total: 0, page: 1, limit: 12, total_pages: 0 });
    await renderPage({ bedrooms: "abc", operation: ["sale", "rent"] });
    expect(fetchListings.mock.calls[0][1]).toMatchObject({ operation: "sale", bedrooms: undefined });
    expect(screen.getByRole("status").textContent).toContain("no eran válidos");
  });

  it("renders an error state instead of throwing when the fetch fails", async () => {
    fetchListings.mockRejectedValue(new Error("boom"));
    await renderPage();
    expect(screen.getByRole("alert").textContent).toContain("No pudimos cargar");
    expect(screen.getByRole("search")).toBeTruthy();
  });
});
