import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import NewsletterForm from "./NewsletterForm";
import ResourceCards from "./ResourceCards";
import Testimonials from "./Testimonials";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe("message catalogs", () => {
  it("keep es/en key parity for the S12 sections", () => {
    for (const section of ["testimonials", "resources", "newsletter"] as const) {
      expect(keyPaths(es.Home[section]).sort()).toEqual(keyPaths(en.Home[section]).sort());
    }
  });
});

describe("Testimonials", () => {
  it("renders three reviews in Spanish", () => {
    renderWithIntl(<Testimonials />);
    expect(screen.getByRole("heading", { name: "Lo que dicen nuestros clientes" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Camila R.")).toBeTruthy();
  });

  it("renders in English", () => {
    renderWithIntl(<Testimonials />, "en");
    expect(screen.getByRole("heading", { name: "What our clients say" })).toBeTruthy();
    expect(screen.getByText(/residence at Aston Martin Residences/)).toBeTruthy();
  });
});

describe("ResourceCards", () => {
  it("renders three guide cards in both languages", () => {
    const { unmount } = renderWithIntl(<ResourceCards />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Dónde vivir en Miami: guía de enclaves de ultra lujo" })).toBeTruthy();
    unmount();
    renderWithIntl(<ResourceCards />, "en");
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Where to live in Miami: an ultra-luxury enclave guide" })).toBeTruthy();
  });
});

describe("NewsletterForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  const fill = (name: string, email: string, consent = true) => {
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: name } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: email } });
    if (consent) fireEvent.click(screen.getByRole("checkbox"));
  };
  const submit = () => fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));

  it("shows validation errors and does not call the API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<NewsletterForm />, "en");
    submit();
    expect(screen.getByText("Enter your name.")).toBeTruthy();
    expect(screen.getByText("Enter your email.")).toBeTruthy();
    expect(screen.getByText("You must accept to subscribe.")).toBeTruthy();
    expect(screen.getByLabelText(/Email/).getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText(/Name/));
  });

  it("rejects an invalid email", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<NewsletterForm />, "en");
    fill("Ana", "not-an-email");
    submit();
    expect(screen.getByText("Enter a valid email.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts trimmed data and shows success, then resets the form", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<NewsletterForm />, "en");
    fill(" Ana ", " ana@example.com ");
    submit();
    expect(await screen.findByText("Thank you! You are now subscribed.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/newsletter",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Ana", email: "ana@example.com" }) }),
    );
    expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe("");
  });

  it("shows an error when the API responds with a failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    renderWithIntl(<NewsletterForm />, "en");
    fill("Ana", "ana@example.com");
    submit();
    expect(await screen.findByText("We could not complete your subscription. Please try again.")).toBeTruthy();
    expect(screen.getByText("We could not complete your subscription. Please try again.")).toBeTruthy();
    expect((screen.getByLabelText(/Email/) as HTMLInputElement).value).toBe("ana@example.com");
  });

  it("shows an error on network failure and can retry", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("offline")).mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    renderWithIntl(<NewsletterForm />, "en");
    fill("Ana", "ana@example.com");
    submit();
    expect(await screen.findByText(/could not complete your subscription/)).toBeTruthy();
    submit();
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("subscribed"));
    expect(screen.getByRole("alert").textContent).toBe("");
  });

  it("disables the button while submitting and renders Spanish copy", async () => {
    let resolve!: (v: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise((r) => (resolve = r))));
    renderWithIntl(<NewsletterForm />);
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText(/Correo/), { target: { value: "ana@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Suscribirme" }));
    const busy = (await screen.findByRole("button", { name: "Suscribiendo…" })) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    resolve({ ok: true, status: 201 });
    expect(await screen.findByText("¡Gracias! Ya estás suscrito.")).toBeTruthy();
  });
});
