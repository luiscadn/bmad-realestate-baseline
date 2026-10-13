import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SearchView } from "@/lib/map-view";

/** Server-rendered toggle: plain links, so it works without JS and the view is shareable in the URL. */
export default function ViewToggle({ view, query }: { view: SearchView; query: Record<string, string> }) {
  const t = useTranslations("Search.view");
  const options = [
    { value: "grid", label: t("grid") },
    { value: "map", label: t("map") },
  ] as const;

  return (
    <nav aria-label={t("label")} className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium">
      {options.map(({ value, label }) => {
        const active = view === value;
        return (
          <Link
            key={value}
            href={{ pathname: "/search", query: value === "map" ? { ...query, view: "map" } : query }}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-4 py-1.5 ${active ? "bg-emerald-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
