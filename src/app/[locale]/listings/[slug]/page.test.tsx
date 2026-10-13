import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import es from "../../../../../messages/es.json";
import en from "../../../../../messages/en.json";

const fetchListingBySlug = vi.fn();
vi.mock("@/lib/listings", () => ({ fetchListingBySlug: (...a: unknown[]) => fetchListingBySlug(...a) }));
vi.mock("@/lib/supabase-public", () => ({ createPublicClient: () => ({}) }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("next-intl/server", async () => {
  const { createTranslator, createFormatter } = await import("use-intl/core");
  const catalogs = { es, en } as const;
  let locale: "es" | "en" = "es";
  return {
    setRequestLocale: (l: "es" | "en") => {
      locale = l;
    },
    getTranslations: async (namespace: string) => createTranslator({ locale, messages: catalogs[locale], namespace } as never),
    getFormatter: async () => createFormatter({ locale }),
  };
});
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, @typescript-eslint/no-unused-vars
  default: ({ fill, priority, ...props }: Record<string, unknown>) => <img {...props} />,
}));

import ListingPage, { generateMetadata } from "./page";

const listing = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "casa-pance",
  title: "Casa en Pance",
  description: "Hermosa casa\ncon jardín",
  operation: "sale",
  property_type: "house",
  price_cop: 850_000_000,
  bedrooms: 3,
  bathrooms: 2,
  parking_spots: 2,
  area_m2: "120.50",
  stratum: 5,
  admin_fee_cop: 450_000,
  neighborhood: "Pance",
  address: "Calle 1 # 2-3",
  city: "Cali",
  open_house_at: null,
  images: [{ id: "i1", listing_id: "l", url: "https://x.test/1.jpg", alt_text: "Fachada", position: 0 }],
  agent: { id: "a", full_name: "Victoria Ordóñez", email: "v@example.com", phone: "+57 300 000 0000", bio: "Asesora", avatar_url: null },
};

async function renderPage(locale: "es" | "en" = "es", slug = "casa-pance") {
  const ui = await ListingPage({ params: Promise.resolve({ locale, slug }) });
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("ListingPage", () => {
  beforeEach(() => {
    fetchListingBySlug.mockReset();
  });

  it("renders all property information", async () => {
    fetchListingBySlug.mockResolvedValue(listing);
    await renderPage();
    expect(fetchListingBySlug).toHaveBeenCalledWith({}, "casa-pance");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Casa en Pance");
    expect(screen.getByText(/850\.000\.000/)).toBeTruthy();
    expect(screen.getByTestId("operation-badge").textContent).toBe("En venta");
    expect(screen.getByTestId("type-badge").textContent).toBe("Casa");
    expect(screen.getByText(/Pance · Calle 1 # 2-3, Cali/)).toBeTruthy();
    expect(screen.getByText(/Hermosa casa/)).toBeTruthy();
    expect(screen.getByText("120,5 m²")).toBeTruthy();
    expect(screen.getByText("Estrato").nextSibling?.textContent).toBe("5");
    expect(screen.getByText("Administración").nextSibling?.textContent).toMatch(/450\.000/);
    expect(screen.getByText("Parqueaderos").nextSibling?.textContent).toBe("2");
    expect(screen.getByText("Victoria Ordóñez")).toBeTruthy();
    expect(screen.getByRole("link", { name: "v@example.com" }).getAttribute("href")).toBe("mailto:v@example.com");
    expect(screen.getByRole("link", { name: "+57 300 000 0000" }).getAttribute("href")).toBe("tel:+573000000000");
    expect(screen.getByAltText("Fachada").getAttribute("src")).toBe("https://x.test/1.jpg");
    expect(screen.getByRole("form", { name: "Contactar a la asesora" })).toBeTruthy();
    expect(screen.queryByLabelText("Casa abierta")).toBeNull();
  });

  it("omits optional fields and shows rent pricing in English", async () => {
    fetchListingBySlug.mockResolvedValue({ ...listing, operation: "rent", area_m2: null, stratum: null, admin_fee_cop: null, address: null, agent: null, images: [] });
    await renderPage("en");
    expect(screen.getByTestId("operation-badge").textContent).toBe("For rent");
    expect(screen.getByText("/month")).toBeTruthy();
    expect(screen.queryByText("Stratum (estrato)")).toBeNull();
    expect(screen.queryByText("HOA fee")).toBeNull();
    expect(screen.queryByText("Area")).toBeNull();
    expect(screen.queryByText("Agent")).toBeNull();
    expect(screen.getByText("No photos")).toBeTruthy();
  });

  it("shows the open-house banner only for a future date", async () => {
    fetchListingBySlug.mockResolvedValue({ ...listing, open_house_at: new Date(Date.now() + 86_400_000).toISOString() });
    await renderPage();
    expect(await screen.findByTestId("countdown")).toBeTruthy();
  });

  it("hides the banner for a past open house", async () => {
    fetchListingBySlug.mockResolvedValue({ ...listing, open_house_at: new Date(Date.now() - 86_400_000).toISOString() });
    await renderPage();
    expect(screen.queryByTestId("countdown")).toBeNull();
  });

  it("calls notFound for a missing or unpublished listing", async () => {
    fetchListingBySlug.mockResolvedValue(null);
    await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("lets fetch errors propagate instead of 404ing", async () => {
    fetchListingBySlug.mockRejectedValue(new Error("db down"));
    await expect(renderPage()).rejects.toThrow("db down");
  });

  it("generates metadata from the listing, empty when absent", async () => {
    fetchListingBySlug.mockResolvedValue(listing);
    expect(await generateMetadata({ params: Promise.resolve({ locale: "es", slug: "casa-pance" }) })).toMatchObject({ title: "Casa en Pance" });
    fetchListingBySlug.mockResolvedValue(null);
    expect(await generateMetadata({ params: Promise.resolve({ locale: "es", slug: "x" }) })).toEqual({});
  });
});
