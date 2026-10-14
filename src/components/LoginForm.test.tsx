import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import { routerPush } from "@/test/setup";
import LoginForm from "./LoginForm";

const signInWithPassword = vi.fn();
vi.mock("@/lib/supabase-browser", () => ({ createBrowserSupabase: () => ({ auth: { signInWithPassword } }) }));

beforeEach(() => {
  signInWithPassword.mockReset();
  routerPush.mockClear();
});

const fill = (email: string, password: string, labels = ["Correo electrónico", "Contraseña"]) => {
  fireEvent.change(screen.getByLabelText(labels[0]), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(labels[1]), { target: { value: password } });
};
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

describe("LoginForm", () => {
  it("requires email then password without calling Supabase", () => {
    renderWithIntl(<LoginForm />);
    submit();
    expect(screen.getByRole("alert").textContent).toBe("Ingresa tu correo.");
    fill("a@b.co", "");
    submit();
    expect(screen.getByRole("alert").textContent).toBe("Ingresa tu contraseña.");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in and goes to the dashboard", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    renderWithIntl(<LoginForm />);
    fill(" a@b.co ", "secret");
    submit();
    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/dashboard"));
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "a@b.co", password: "secret" });
  });

  it("shows a localized error for bad credentials, not the raw message", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials", status: 400 } });
    renderWithIntl(<LoginForm />);
    fill("a@b.co", "wrong");
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Correo o contraseña incorrectos.");
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("shows a generic error when the request throws", async () => {
    signInWithPassword.mockRejectedValue(new Error("network"));
    renderWithIntl(<LoginForm />, "en");
    fill("a@b.co", "x", ["Email", "Password"]);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByRole("alert")).textContent).toBe("We couldn't sign you in. Try again.");
  });

  it.each([
    ["a 5xx error", { message: "boom", status: 500 }],
    ["a rate limit", { message: "too many", status: 429 }],
    ["an error without status", { message: "fetch failed" }],
  ])("shows the generic error for %s, not bad credentials", async (_label, authError) => {
    signInWithPassword.mockResolvedValue({ error: authError });
    renderWithIntl(<LoginForm />, "en");
    fill("a@b.co", "x", ["Email", "Password"]);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByRole("alert")).textContent).toBe("We couldn't sign you in. Try again.");
    expect(routerPush).not.toHaveBeenCalled();
  });
});
