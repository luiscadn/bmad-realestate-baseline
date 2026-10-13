"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { validateContactForm, type ContactErrors, type ContactField, type ContactValues } from "@/lib/listing-detail";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactValues = { name: "", email: "", phone: "", message: "" };
const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 aria-[invalid=true]:border-red-600";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function ContactForm({ listingId }: { listingId: string }) {
  const t = useTranslations("Listing.contact");
  const uid = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (field: ContactField) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validateContactForm(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || null,
          message: values.message.trim(),
          listing_id: listingId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setValues(EMPTY);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function field(name: ContactField, label: string, props: { type?: string; autoComplete?: string; required?: boolean }) {
    const id = `${uid}-${name}`;
    const code = errors[name];
    const common = {
      id,
      name,
      value: values[name],
      onChange: set(name),
      "aria-invalid": code ? true : undefined,
      "aria-describedby": code ? `${id}-error` : undefined,
      className: fieldClass,
    };
    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
          {props.required ? <span aria-hidden="true"> *</span> : null}
        </label>
        {name === "message" ? (
          <textarea rows={5} {...common} />
        ) : (
          <input type={props.type ?? "text"} autoComplete={props.autoComplete} {...common} />
        )}
        {code ? (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
            {t(`errors.${name}.${code}`)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={t("title")} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-emerald-950">{t("title")}</h2>
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
      {field("name", t("name"), { autoComplete: "name", required: true })}
      {field("email", t("email"), { type: "email", autoComplete: "email", required: true })}
      {field("phone", t("phone"), { type: "tel", autoComplete: "tel" })}
      {field("message", t("message"), { required: true })}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
