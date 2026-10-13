import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { setMockLocation } from "@/test/setup";
import LanguageSwitch from "./LanguageSwitch";

describe("LanguageSwitch", () => {
  it("marks the active locale and links to the other locale keeping path and query", () => {
    setMockLocation("/search", "operation=rent");
    renderWithIntl(<LanguageSwitch />, "es");
    expect(screen.getByRole("link", { name: "Español" }).getAttribute("aria-current")).toBe("true");
    const en = screen.getByRole("link", { name: "English" });
    expect(en.getAttribute("aria-current")).toBeNull();
    expect(en.getAttribute("href")).toBe("/en/search?operation=rent");
  });

  it("links back to the default locale without a prefix", () => {
    setMockLocation("/search");
    renderWithIntl(<LanguageSwitch />, "en");
    expect(screen.getByRole("link", { name: "Español" }).getAttribute("href")).toBe("/search");
    expect(screen.getByRole("link", { name: "English" }).getAttribute("aria-current")).toBe("true");
  });
});
