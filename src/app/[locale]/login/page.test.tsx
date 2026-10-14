import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import es from "../../../../messages/es.json";

const getSessionAgent = vi.fn();
const redirect = vi.fn((arg: unknown) => {
  throw new Error(`REDIRECT:${JSON.stringify(arg)}`);
});
vi.mock("@/lib/agent-auth", () => ({ getSessionAgent: () => getSessionAgent() }));
vi.mock("@/lib/supabase-browser", () => ({ createBrowserSupabase: () => ({}) }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async (ns: string) => (key: string) =>
    [ns, ...key.split(".")].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], es) as string,
}));
vi.mock("@/i18n/navigation", () => ({
  redirect: (a: unknown) => redirect(a),
  useRouter: () => ({ push: vi.fn() }),
}));

import LoginPage from "./page";

beforeEach(() => {
  getSessionAgent.mockReset();
  redirect.mockClear();
});

describe("LoginPage", () => {
  it("renders the sign-in form when signed out", async () => {
    getSessionAgent.mockResolvedValue(null);
    const ui = await LoginPage({ params: Promise.resolve({ locale: "es" }) });
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        {ui}
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { name: "Acceso para agentes" })).toBeTruthy();
    expect(screen.getByLabelText("Correo electrónico")).toBeTruthy();
    expect(screen.getByLabelText("Contraseña")).toBeTruthy();
  });

  it("redirects an already signed-in agent to /dashboard", async () => {
    getSessionAgent.mockResolvedValue({ user: { id: "a" } });
    await expect(LoginPage({ params: Promise.resolve({ locale: "es" }) })).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith({ href: "/dashboard", locale: "es" });
  });
});
