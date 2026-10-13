import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { setMockLocation } from "@/test/setup";
import Header from "./Header";

describe("Header", () => {
  it("renders branding, nav, language switch and agent sign-in in Spanish", () => {
    setMockLocation("/");
    renderWithIntl(<Header />);
    expect(screen.getByText("Bienes Raíces • Cali")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Propiedades" }).getAttribute("href")).toBe("/search");
    expect(screen.getByRole("link", { name: "Ingreso Agente" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("group", { name: "Idioma" })).toBeTruthy();
  });

  it("marks the current section link with aria-current", () => {
    setMockLocation("/search/results");
    renderWithIntl(<Header />);
    expect(screen.getByRole("link", { name: "Propiedades" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Contacto" }).getAttribute("aria-current")).toBeNull();
  });

  it("renders English strings", () => {
    setMockLocation("/");
    renderWithIntl(<Header />, "en");
    expect(screen.getByRole("link", { name: "Agent Sign In" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "About Victoria" })).toBeTruthy();
  });

  it("opens and closes the mobile drawer via the toggle", () => {
    setMockLocation("/");
    renderWithIntl(<Header />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: "Navegación móvil" })).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole("navigation", { name: "Navegación móvil" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.queryByRole("navigation", { name: "Navegación móvil" })).toBeNull();
  });

  it("closes the drawer on Escape and when a link is clicked", () => {
    setMockLocation("/");
    renderWithIntl(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Navegación móvil" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));
    const mobile = screen.getByRole("navigation", { name: "Navegación móvil" });
    mobile.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(mobile.querySelector("a")!);
    expect(screen.queryByRole("navigation", { name: "Navegación móvil" })).toBeNull();
  });
});
