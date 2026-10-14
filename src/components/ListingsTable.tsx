"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AgentListing } from "@/lib/dashboard";

interface Props {
  listings: AgentListing[];
  /** Id of the row with a request in flight; its actions are disabled. */
  busyId?: string | null;
  onEdit: (listing: AgentListing) => void;
  onTogglePublish: (listing: AgentListing) => void;
  onDelete: (listing: AgentListing) => void;
}

const actionClass =
  "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50";

export default function ListingsTable({ listings, busyId, onEdit, onTogglePublish, onDelete }: Props) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const cop = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const formatPrice = (l: AgentListing) => {
    if (l.price_usd != null && Number.isFinite(Number(l.price_usd))) {
      return usd.format(Number(l.price_usd));
    }
    return cop.format(Number(l.price_cop));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{t("table.caption")}</caption>
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">{t("table.title")}</th>
            <th scope="col" className="px-4 py-3">{t("table.neighborhood")}</th>
            <th scope="col" className="px-4 py-3">{t("table.price")}</th>
            <th scope="col" className="px-4 py-3">{t("table.status")}</th>
            <th scope="col" className="px-4 py-3">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {listings.map((l) => {
            const published = l.published_at !== null;
            const busy = busyId === l.id;
            return (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div>{l.title}</div>
                  {l.building_name ? <div className="text-xs font-normal text-slate-500">{l.building_name}</div> : null}
                </td>
                <td className="px-4 py-3 text-slate-600">{l.neighborhood}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatPrice(l)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {published ? t("status.published") : t("status.draft")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={actionClass} disabled={busy} onClick={() => onEdit(l)}>
                      {t("actions.edit")}
                    </button>
                    <button type="button" className={actionClass} disabled={busy} onClick={() => onTogglePublish(l)}>
                      {published ? t("actions.unpublish") : t("actions.publish")}
                    </button>
                    <button
                      type="button"
                      className={`${actionClass} text-red-700`}
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(t("actions.confirmDelete", { title: l.title }))) onDelete(l);
                      }}
                    >
                      {t("actions.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
