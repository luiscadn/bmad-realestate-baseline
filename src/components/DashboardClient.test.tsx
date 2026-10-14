import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { routerPush } from "@/test/setup";
import DashboardClient from "./DashboardClient";

const signOut = vi.fn().mockResolvedValue({});
vi.mock("@/lib/supabase-browser", () => ({ createBrowserSupabase: () => ({ auth: { signOut } }) }));

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  routerPush.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const row = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  slug: `s-${id}`,
  title: `Casa ${id}`,
  description: "",
  operation: "sale",
  property_type: "house",
  price_cop: 100_000_000,
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
const res = (status: number, body: unknown = {}) => ({ ok: status < 300, status, json: async () => body });
const list = (rows: unknown[]) => res(200, { data: rows });

describe("DashboardClient", () => {
  it("loads and renders the listings table", async () => {
    fetchMock.mockResolvedValueOnce(list([row("a"), row("b", { published_at: null })]));
    renderWithIntl(<DashboardClient />);
    expect(await screen.findByText("Casa a")).toBeTruthy();
    expect(screen.getByText("Casa b")).toBeTruthy();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/agent/listings?limit=50");
  });

  it("shows an empty state", async () => {
    fetchMock.mockResolvedValueOnce(list([]));
    renderWithIntl(<DashboardClient />);
    expect(await screen.findByText("Aún no tienes propiedades.")).toBeTruthy();
  });

  it("shows a load error and retries", async () => {
    fetchMock.mockResolvedValueOnce(res(500)).mockResolvedValueOnce(list([row("a")]));
    renderWithIntl(<DashboardClient />);
    expect((await screen.findByRole("alert")).textContent).toContain("No pudimos cargar tus propiedades.");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Casa a")).toBeTruthy();
  });

  it("redirects to /login when the API says unauthenticated", async () => {
    fetchMock.mockResolvedValueOnce(res(401));
    renderWithIntl(<DashboardClient />);
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
  });

  it("unpublishes a listing via PATCH and flips the badge", async () => {
    fetchMock.mockResolvedValueOnce(list([row("a")])).mockResolvedValueOnce(res(200, { data: {} }));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(screen.getByRole("button", { name: "Despublicar" }));
    await screen.findByText("Borrador");
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("/api/agent/listings/a");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ published: false });
  });

  it("shows an error and keeps the badge when toggling fails", async () => {
    fetchMock.mockResolvedValueOnce(list([row("a")])).mockResolvedValueOnce(res(500));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(screen.getByRole("button", { name: "Despublicar" }));
    expect((await screen.findByRole("alert")).textContent).toBe("La acción falló. Inténtalo de nuevo.");
    expect(screen.getByText("Publicada")).toBeTruthy();
  });

  it("redirects to /login when a mutation gets 401", async () => {
    fetchMock.mockResolvedValueOnce(list([row("a")])).mockResolvedValueOnce(res(401));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(screen.getByRole("button", { name: "Despublicar" }));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the row and shows an error when delete fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(list([row("a")])).mockResolvedValueOnce(res(500));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect((await screen.findByRole("alert")).textContent).toBe("La acción falló. Inténtalo de nuevo.");
    expect(screen.getByText("Casa a")).toBeTruthy();
  });

  it("goes to /login even when sign out throws", async () => {
    fetchMock.mockResolvedValueOnce(list([]));
    signOut.mockRejectedValueOnce(new Error("network"));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Aún no tienes propiedades.");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
  });

  it("deletes a confirmed listing and removes the row", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(list([row("a"), row("b")])).mockResolvedValueOnce(res(200));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(within(screen.getAllByRole("row")[1]).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByText("Casa a")).toBeNull());
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
    expect(screen.getByText("Casa b")).toBeTruthy();
  });

  it("opens the create form, saves and reloads the table", async () => {
    fetchMock
      .mockResolvedValueOnce(list([]))
      .mockResolvedValueOnce(res(201, { data: {} }))
      .mockResolvedValueOnce(list([row("n")]));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Aún no tienes propiedades.");
    fireEvent.click(screen.getByRole("button", { name: "Nueva propiedad" }));
    fireEvent.change(screen.getByLabelText(/^Título/), { target: { value: "Casa n" } });
    fireEvent.change(screen.getByLabelText(/^Precio/), { target: { value: "100000000" } });
    fireEvent.change(screen.getByLabelText(/^Barrio/), { target: { value: "Granada" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar propiedad" }));
    expect(await screen.findByText("Casa n")).toBeTruthy();
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
  });

  it("opens the edit form prefilled", async () => {
    fetchMock.mockResolvedValueOnce(list([row("a")]));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Casa a");
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect((screen.getByLabelText(/^Título/) as HTMLInputElement).value).toBe("Casa a");
  });

  it("signs out and goes to /login", async () => {
    fetchMock.mockResolvedValueOnce(list([]));
    renderWithIntl(<DashboardClient />);
    await screen.findByText("Aún no tienes propiedades.");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
    expect(signOut).toHaveBeenCalled();
  });
});
