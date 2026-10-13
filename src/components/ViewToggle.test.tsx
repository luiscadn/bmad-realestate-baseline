import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import ViewToggle from "./ViewToggle";

describe("ViewToggle", () => {
  it("marks grid active by default and links to map keeping filters", () => {
    renderWithIntl(<ViewToggle view="grid" query={{ operation: "rent" }} />);
    expect(screen.getByRole("link", { name: "Cuadrícula" }).getAttribute("aria-current")).toBe("page");
    const map = screen.getByRole("link", { name: "Mapa" });
    expect(map.getAttribute("aria-current")).toBeNull();
    expect(map.getAttribute("href")).toBe("/search?operation=rent&view=map");
  });

  it("links back to grid without a view param when in map view", () => {
    renderWithIntl(<ViewToggle view="map" query={{ operation: "rent" }} />, "en");
    expect(screen.getByRole("link", { name: "Map" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Grid" }).getAttribute("href")).toBe("/search?operation=rent");
  });
});
