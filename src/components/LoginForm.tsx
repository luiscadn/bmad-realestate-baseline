"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 aria-[invalid=true]:border-red-500";

type ErrorKey = "emailRequired" | "passwordRequired" | "invalid" | "generic";

export default function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim()) return setError("emailRequired");
    if (!password) return setError("passwordRequired");
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await createBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        // 4xx = bad credentials; anything else (network, 5xx) is a generic failure.
        const status = (authError as { status?: number }).status;
        setError(status && status >= 400 && status < 500 ? "invalid" : "generic");
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("generic");
      setSubmitting(false);
    }
  }

  const emailInvalid = error === "emailRequired";
  const passwordInvalid = error === "passwordRequired";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`${uid}-email`} className="text-sm font-medium text-slate-700">
          {t("email")}
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailInvalid || undefined}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-password`} className="text-sm font-medium text-slate-700">
          {t("password")}
        </label>
        <input
          id={`${uid}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={passwordInvalid || undefined}
          className={fieldClass}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {t(`errors.${error}`)}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
