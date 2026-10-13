"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { validateNewsletter, type NewsletterErrors, type NewsletterField, type NewsletterValues } from "@/lib/newsletter";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: NewsletterValues = { name: "", email: "", consent: false };
const fieldClass =
  "mt-1 w-full rounded-lg border border-emerald-800 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 aria-[invalid=true]:border-red-500";

export default function NewsletterForm() {
  const t = useTranslations("Home.newsletter");
  const uid = useId();
  const [values, setValues] = useState<NewsletterValues>(EMPTY);
  const [errors, setErrors] = useState<NewsletterErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validateNewsletter(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setValues(EMPTY);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function describe(name: NewsletterField) {
    const id = `${uid}-${name}`;
    const code = errors[name];
    return {
      id,
      code,
      props: { "aria-invalid": code ? true : undefined, "aria-describedby": code ? `${id}-error` : undefined },
    };
  }

  function textField(name: "name" | "email", type: string, autoComplete: string) {
    const { id, code, props } = describe(name);
    return (
      <div>
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-emerald-100">
          {t(name)}
          <span aria-hidden="true"> *</span>
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={values[name]}
          onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
          className={fieldClass}
          {...props}
        />
        {code ? (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-200">
            {t(`errors.${name}.${code}`)}
          </p>
        ) : null}
      </div>
    );
  }

  const consent = describe("consent");

  return (
    <section aria-labelledby="newsletter-title" className="bg-emerald-950 py-16 text-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 id="newsletter-title" className="text-2xl font-semibold">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-emerald-100/80">{t("description")}</p>
        <form onSubmit={onSubmit} noValidate aria-labelledby="newsletter-title" className="mt-6 space-y-4">
          {status === "success" ? (
            <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {t("success")}
            </p>
          ) : null}
          {status === "error" ? (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              {t("error")}
            </p>
          ) : null}
          {textField("name", "text", "name")}
          {textField("email", "email", "email")}
          <div>
            <label className="flex items-start gap-2 text-sm text-emerald-100">
              <input
                id={consent.id}
                name="consent"
                type="checkbox"
                checked={values.consent}
                onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
                className="mt-0.5 h-4 w-4"
                {...consent.props}
              />
              <span>{t("consent")}</span>
            </label>
            {consent.code ? (
              <p id={`${consent.id}-error`} className="mt-1 text-sm text-red-200">
                {t(`errors.consent.${consent.code}`)}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-lg bg-amber-300 px-4 py-3 text-sm font-semibold text-emerald-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? t("sending") : t("submit")}
          </button>
        </form>
      </div>
    </section>
  );
}
