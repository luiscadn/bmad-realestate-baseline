"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FeaturedListing } from "@/lib/featured-listings";
import { projectPins } from "@/lib/map-view";

export interface SearchMapProps {
  listings: FeaturedListing[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function SearchMap({ listings, selectedId, onSelect }: SearchMapProps) {
  const t = useTranslations("Search.map");
  const tCard = useTranslations("Search.card");
  const format = useFormatter();
  const { pins, missing } = projectPins(listings);
  const selected = pins.find((pin) => pin.listing.id === selectedId)?.listing ?? null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onSelect(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, onSelect]);

  const priceOf = (listing: FeaturedListing) =>
    format.number(Number(listing.price_cop), { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const image = selected?.images[0];

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        role="group"
        aria-label={t("label")}
        className="relative min-h-[24rem] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-emerald-50 [background-image:linear-gradient(to_right,#d1fae5_1px,transparent_1px),linear-gradient(to_bottom,#d1fae5_1px,transparent_1px)] [background-size:2.5rem_2.5rem]"
      >
        {pins.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-600">{t("noLocations")}</p>
        ) : (
          pins.map(({ listing, x, y }) => {
            const active = listing.id === selectedId;
            return (
              <button
                key={listing.id}
                type="button"
                data-testid="map-pin"
                aria-pressed={active}
                aria-label={t("pinLabel", { title: listing.title, price: priceOf(listing) })}
                onClick={() => onSelect(active ? null : listing.id)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold shadow focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                  active ? "z-20 border-emerald-950 bg-emerald-950 text-white" : "z-10 border-emerald-900 bg-white text-emerald-950 hover:bg-emerald-100"
                }`}
              >
                {priceOf(listing)}
              </button>
            );
          })
        )}
        {selected ? (
          <article
            data-testid="map-preview"
            aria-label={t("previewLabel")}
            className="absolute inset-x-3 bottom-3 z-30 flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:left-auto sm:w-80"
          >
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {image ? (
                <Image src={image.url} alt={image.alt_text ?? selected.title} fill sizes="112px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-slate-400">{tCard("noImage")}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-950">
                {priceOf(selected)}
                {selected.operation === "rent" ? <span className="text-xs font-normal text-slate-500"> {tCard("perMonth")}</span> : null}
              </p>
              <h3 className="truncate text-sm font-medium text-slate-800">{selected.title}</h3>
              <p className="mt-1">
                <span data-testid="preview-neighborhood" className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900">
                  {selected.neighborhood}
                </span>
              </p>
              <Link href={`/listings/${selected.slug}`} className="mt-1 inline-block text-sm font-medium text-emerald-800 hover:underline">
                {t("viewListing")} →
              </Link>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              aria-label={t("close")}
              className="absolute right-2 top-1 text-lg leading-none text-slate-500 hover:text-slate-800"
            >
              ×
            </button>
          </article>
        ) : null}
      </div>
      {missing > 0 && pins.length > 0 ? <p className="text-xs text-slate-500">{t("missing", { count: missing })}</p> : null}
    </div>
  );
}
