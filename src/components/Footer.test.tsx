import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { footerNeighborhoods, siteConfig } from "@/lib/site";
import Footer from "./Footer";

describe("Footer", () => {
  it("shows contact details, Cali office and a WhatsApp link", () => {
    renderWithIntl(<Footer />);
    expect(screen.getByText(/Granada, Cali, Valle del Cauca/)).toBeTruthy();
    expect(screen.getByRole("link", { name: siteConfig.email }).getAttribute("href")).toBe(`mailto:${siteConfig.email}`);
    const wa = screen.getByRole("link", { name: "Escríbenos por WhatsApp" });
    expect(wa.getAttribute("href")).toContain(`https://wa.me/${siteConfig.whatsappNumber}?text=`);
    expect(wa.getAttribute("rel")).toContain("noopener");
  });

  it("links every neighborhood to a filtered search", () => {
    renderWithIntl(<Footer />);
    for (const name of footerNeighborhoods) {
      const href = screen.getByRole("link", { name }).getAttribute("href")!;
      expect(href).toBe(`/search?${new URLSearchParams({ neighborhood: name })}`);
    }
  });

  it("renders legal notices in each language", () => {
    const { unmount } = renderWithIntl(<Footer />, "es");
    expect(screen.getByText(/Ley 1581 de 2012/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Política de privacidad" })).toBeTruthy();
    unmount();
    renderWithIntl(<Footer />, "en");
    expect(screen.getByText(/Colombian Law 1581/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Terms of service" })).toBeTruthy();
  });
});
