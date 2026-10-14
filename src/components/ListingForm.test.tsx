import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentListing } from "@/lib/dashboard";
import { renderWithIntl } from "@/test/render";
import { routerPush } from "@/test/setup";
import ListingForm from "./ListingForm";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (status: number, body: unknown = {}) => ({ ok: status < 300, status, json: async () => body });
const setField = (label: string, value: string) => fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } });
const save = () => fireEvent.click(screen.getByRole("button", { name: "Guardar propiedad" }));

function fillRequired() {
  setField("Título", "Casa Granada");
  setField("Precio", "450000000");
  setField("Barrio", "Granada");
}

const existing: AgentListing = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "casa-granada",
  title: "Casa Granada",
  description: "Bonita",
  operation: "rent",
  property_type: "house",
  price_cop: 3_000_000,
  area_m2: "85.50",
  bedrooms: 3,
  bathrooms: 2,
  stratum: 4,
  admin_fee_cop: 250_000,
  neighborhood: "Granada",
  address: "Calle 1",
  published_at: null,
};

describe("ListingForm", () => {
  it("blocks submission and shows localized errors for missing required fields", () => {
    renderWithIntl(<ListingForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    save();
    expect(screen.getAllByText("Este campo es obligatorio.")).toHaveLength(3);
    expect(screen.getByLabelText(/^Título/).getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a stratum outside 1–6", () => {
    renderWithIntl(<ListingForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fillRequired();
    setField("Estrato", "9");
    save();
    expect(screen.getByText("Ingresa un estrato de 1 a 6.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates with POST, omitting a blank slug", async () => {
    fetchMock.mockResolvedValue(json(201, { data: {} }));
    const onSaved = vi.fn();
    renderWithIntl(<ListingForm onSaved={onSaved} onCancel={vi.fn()} />);
    fillRequired();
    setField("Estrato", "5");
    setField("Administración", "300000");
    fireEvent.click(screen.getByLabelText(/Publicada/));
    save();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/agent/listings");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ title: "Casa Granada", price_cop: 450_000_000, stratum: 5, admin_fee_cop: 300_000, published: true, operation: "sale" });
    expect(body).not.toHaveProperty("slug");
  });

  it("prefills and updates with PATCH when editing", async () => {
    fetchMock.mockResolvedValue(json(200, { data: {} }));
    const onSaved = vi.fn();
    renderWithIntl(<ListingForm listing={existing} onSaved={onSaved} onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Editar propiedad" })).toBeTruthy();
    expect((screen.getByLabelText(/^Slug/) as HTMLInputElement).value).toBe("casa-granada");
    expect((screen.getByLabelText(/^Estrato/) as HTMLInputElement).value).toBe("4");
    setField("Título", "Casa Nueva");
    fireEvent.click(screen.getByLabelText(/Publicada/));
    save();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/agent/listings/${existing.id}`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toMatchObject({ title: "Casa Nueva", slug: "casa-granada", published: true });
  });

  it("shows a slug-taken message on 409", async () => {
    fetchMock.mockResolvedValue(json(409, { error: "A listing with this slug already exists" }));
    const onSaved = vi.fn();
    renderWithIntl(<ListingForm onSaved={onSaved} onCancel={vi.fn()} />);
    fillRequired();
    setField("Slug", "taken");
    save();
    expect(await screen.findByText("Ese slug ya está en uso.")).toBeTruthy();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("redirects to /login when the session has expired (401)", async () => {
    fetchMock.mockResolvedValue(json(401));
    const onSaved = vi.fn();
    renderWithIntl(<ListingForm onSaved={onSaved} onCancel={vi.fn()} />);
    fillRequired();
    save();
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("maps 400 field errors inline", async () => {
    fetchMock.mockResolvedValue(json(400, { errors: { price_cop: "bad" } }));
    renderWithIntl(<ListingForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fillRequired();
    save();
    expect(await screen.findByText("Ingresa un número entero mayor que 0.")).toBeTruthy();
  });

  it("shows a generic error on server failure and cancel works", async () => {
    fetchMock.mockResolvedValue(json(500));
    const onCancel = vi.fn();
    renderWithIntl(<ListingForm onSaved={vi.fn()} onCancel={onCancel} />);
    fillRequired();
    save();
    expect((await screen.findByRole("alert")).textContent).toBe("No pudimos guardar la propiedad. Inténtalo de nuevo.");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
