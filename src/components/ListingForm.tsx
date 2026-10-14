"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  EMPTY_FORM,
  fromListing,
  mapServerErrors,
  toPayload,
  validateForm,
  type AgentListing,
  type FormErrors,
  type FormField,
  type FormValues,
} from "@/lib/dashboard";
import { OPERATIONS, PROPERTY_TYPES } from "@/lib/listings-query";

interface Props {
  /** Listing being edited; omit to create. */
  listing?: AgentListing;
  onSaved: () => void;
  onCancel: () => void;
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 aria-[invalid=true]:border-red-500";

export default function ListingForm({ listing, onSaved, onCancel }: Props) {
  const t = useTranslations("Dashboard.form");
  const router = useRouter();
  const uid = useId();
  const [values, setValues] = useState<FormValues>(() => (listing ? fromListing(listing) : EMPTY_FORM));
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTaken, setSlugTaken] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormValues, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const found = validateForm(values);
    setErrors(found);
    setSlugTaken(false);
    setFailed(false);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(listing ? `/api/agent/listings/${listing.id}` : "/api/agent/listings", {
        method: listing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        onSaved();
        return;
      }
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 409) {
        setSlugTaken(true);
        document.getElementById(`${uid}-slug`)?.focus();
      } else if (res.status === 400) {
        const body = await res.json().catch(() => null);
        const mapped = mapServerErrors(body?.errors);
        setErrors(mapped.fields);
        setFailed(mapped.unmapped);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
    setSaving(false);
  }

  function describe(name: FormField) {
    const id = `${uid}-${name}`;
    const message = name === "slug" && slugTaken ? t("slugTaken") : errors[name] ? t(`errors.${errors[name]}`) : null;
    return {
      id,
      message,
      props: {
        id,
        "aria-invalid": message ? true : undefined,
        "aria-describedby": message ? `${id}-error` : undefined,
        className: fieldClass,
      },
    };
  }

  function field(name: FormField, label: string, opts: { type?: string; inputMode?: "numeric" | "decimal"; hint?: string; required?: boolean } = {}) {
    const { id, message, props } = describe(name);
    return (
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          {...props}
          type={opts.type ?? "text"}
          inputMode={opts.inputMode}
          required={opts.required}
          value={values[name]}
          onChange={(e) => set(name, e.target.value)}
        />
        {opts.hint && !message && <p className="mt-1 text-xs text-slate-500">{opts.hint}</p>}
        {message && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  function select(name: "property_type" | "operation", label: string, options: readonly string[], catalog: "propertyTypes" | "operations") {
    const { id, props } = describe(name);
    return (
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <select {...props} value={values[name]} onChange={(e) => set(name, e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>
              {t(`${catalog}.${o}`)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const description = describe("description");

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-heading`} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <h2 id={`${uid}-heading`} className="text-xl font-semibold text-slate-900">
        {listing ? t("editTitle") : t("createTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("title", t("title"), { required: true })}
        {field("slug", t("slug"), { hint: t("slugHint") })}
        {select("property_type", t("propertyType"), PROPERTY_TYPES, "propertyTypes")}
        {select("operation", t("operation"), OPERATIONS, "operations")}
        {field("price_cop", t("priceCop"), { inputMode: "numeric", required: true })}
        {field("area_m2", t("areaM2"), { inputMode: "decimal" })}
        {field("bedrooms", t("bedrooms"), { inputMode: "numeric" })}
        {field("bathrooms", t("bathrooms"), { inputMode: "numeric" })}
        {field("stratum", t("stratum"), { inputMode: "numeric" })}
        {field("admin_fee_cop", t("adminFeeCop"), { inputMode: "numeric" })}
        {field("neighborhood", t("neighborhood"), { required: true })}
        {field("address", t("address"))}
      </div>
      <div>
        <label htmlFor={description.id} className="text-sm font-medium text-slate-700">
          {t("description")}
        </label>
        <textarea {...description.props} rows={5} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} />
        {t("published")}
      </label>
      {failed && (
        <p role="alert" className="text-sm text-red-600">
          {t("saveError")}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? t("saving") : t("save")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
