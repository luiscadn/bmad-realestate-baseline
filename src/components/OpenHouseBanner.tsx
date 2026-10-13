"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { getCountdown } from "@/lib/listing-detail";

/** Renders nothing until mounted (no server/client clock mismatch) and again once the event has started. */
export default function OpenHouseBanner({ openHouseAt }: { openHouseAt: string }) {
  const t = useTranslations("Listing.openHouse");
  const format = useFormatter();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = now === null ? null : getCountdown(openHouseAt, now);
  if (!countdown) return null;

  const when = format.dateTime(new Date(openHouseAt), {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
  const units = [
    ["days", countdown.days],
    ["hours", countdown.hours],
    ["minutes", countdown.minutes],
    ["seconds", countdown.seconds],
  ] as const;

  return (
    <aside
      role="region"
      aria-label={t("label")}
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"
    >
      <p className="text-sm font-semibold uppercase tracking-wide">{t("title")}</p>
      <p className="mt-1">{when}</p>
      <p className="mt-3 text-sm">{t("startsIn")}</p>
      <dl data-testid="countdown" className="mt-1 flex gap-4">
        {units.map(([unit, value]) => (
          <div key={unit} className="text-center">
            <dd className="text-2xl font-semibold tabular-nums">{String(value).padStart(2, "0")}</dd>
            <dt className="text-xs">{t(unit)}</dt>
          </div>
        ))}
      </dl>
    </aside>
  );
}
