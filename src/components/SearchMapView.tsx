"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FeaturedListing } from "@/lib/featured-listings";
import ListingCard from "./ListingCard";
import SearchMap from "./SearchMap";

type Pane = "list" | "map";

/** Split view: cards beside the map from `lg` up; on small screens a tab switch shows one pane at a time. */
export default function SearchMapView({ listings }: { listings: FeaturedListing[] }) {
  const t = useTranslations("Search.map");
  const [pane, setPane] = useState<Pane>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabs: { value: Pane; label: string }[] = [
    { value: "list", label: t("showList") },
    { value: "map", label: t("showMap") },
  ];

  return (
    <div>
      <div role="group" aria-label={t("paneLabel")} className="mb-4 flex gap-2 lg:hidden">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={pane === value}
            onClick={() => setPane(value)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
              pane === value ? "border-emerald-900 bg-emerald-900 text-white" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul data-testid="map-list" className={`gap-4 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-1 ${pane === "list" ? "grid" : "hidden lg:grid"}`}>
          {listings.map((listing) => (
            <li
              key={listing.id}
              className={`rounded-2xl ${listing.id === selectedId ? "ring-2 ring-emerald-700" : ""}`}
            >
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
        <div data-testid="map-pane" className={`lg:sticky lg:top-4 lg:h-[75vh] ${pane === "map" ? "block" : "hidden lg:block"}`}>
          <SearchMap listings={listings} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
