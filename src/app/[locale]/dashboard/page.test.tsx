import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionAgent = vi.fn();
const redirect = vi.fn((arg: unknown) => {
  throw new Error(`REDIRECT:${JSON.stringify(arg)}`);
});
vi.mock("@/lib/agent-auth", () => ({ getSessionAgent: () => getSessionAgent() }));
vi.mock("@/i18n/navigation", () => ({ redirect: (a: unknown) => redirect(a) }));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {} }));
vi.mock("@/components/DashboardClient", () => ({ default: () => null }));

import DashboardPage from "./page";

beforeEach(() => {
  getSessionAgent.mockReset();
  redirect.mockClear();
});

describe("DashboardPage", () => {
  it("redirects unauthenticated visitors to /login", async () => {
    getSessionAgent.mockResolvedValue(null);
    await expect(DashboardPage({ params: Promise.resolve({ locale: "en" }) })).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith({ href: "/login", locale: "en" });
  });

  it("renders the dashboard for an authenticated agent", async () => {
    getSessionAgent.mockResolvedValue({ user: { id: "a" } });
    const ui = await DashboardPage({ params: Promise.resolve({ locale: "es" }) });
    expect(ui).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
