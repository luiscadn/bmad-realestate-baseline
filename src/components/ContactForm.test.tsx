import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import ContactForm from "./ContactForm";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function fill(over: Partial<Record<"Nombre" | "Correo electrónico" | "Teléfono" | "Mensaje", string>> = {}) {
  const vals = { Nombre: "Ana", "Correo electrónico": "ana@example.com", Teléfono: "300 123 4567", Mensaje: "Hola", ...over };
  for (const [label, value] of Object.entries(vals)) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } });
  }
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));

describe("ContactForm", () => {
  it("shows field errors and does not call the API when invalid", () => {
    renderWithIntl(<ContactForm listingId="l1" />);
    submit();
    expect(screen.getByText("Ingresa tu nombre.")).toBeTruthy();
    expect(screen.getByText("Ingresa tu correo.")).toBeTruthy();
    expect(screen.getByText("Escribe un mensaje.")).toBeTruthy();
    expect(screen.getByLabelText(/^Nombre/).getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed email and phone", () => {
    renderWithIntl(<ContactForm listingId="l1" />);
    fill({ "Correo electrónico": "nope", Teléfono: "abc" });
    submit();
    expect(screen.getByText("Ingresa un correo válido.")).toBeTruthy();
    expect(screen.getByText("Ingresa un teléfono válido.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the lead, disables the button while pending, then shows success and clears", async () => {
    let resolve!: (r: { ok: boolean }) => void;
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithIntl(<ContactForm listingId="l1" />);
    fill();
    submit();
    const button = await screen.findByRole("button", { name: "Enviando…" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(button.closest("form")!);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/leads");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      name: "Ana",
      email: "ana@example.com",
      phone: "300 123 4567",
      message: "Hola",
      listing_id: "l1",
    });

    resolve({ ok: true });
    expect(await screen.findByRole("status")).toBeTruthy();
    expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).value).toBe("");
  });

  it("sends a null phone when left empty", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    renderWithIntl(<ContactForm listingId="l1" />);
    fill({ Teléfono: "" });
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).phone).toBeNull();
  });

  it.each([
    ["server error", () => fetchMock.mockResolvedValue({ ok: false, status: 500 })],
    ["network failure", () => fetchMock.mockRejectedValue(new Error("offline"))],
  ])("shows a localized error and keeps values on %s", async (_name, arrange) => {
    arrange();
    renderWithIntl(<ContactForm listingId="l1" />);
    fill();
    submit();
    expect((await screen.findByRole("alert")).textContent).toContain("No pudimos enviar");
    expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).value).toBe("Ana");
    expect((screen.getByRole("button", { name: "Enviar consulta" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("renders English copy", () => {
    renderWithIntl(<ContactForm listingId="l1" />, "en");
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    expect(screen.getByText("Enter your name.")).toBeTruthy();
  });
});
