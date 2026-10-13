"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ListingImage } from "@/lib/listing-images";

export default function ListingGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const t = useTranslations("Listing.gallery");
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
        {t("noImage")}
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);
  const navClass =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-semibold text-emerald-950 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700";

  return (
    <section aria-label={t("label")} className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={current.url}
          alt={current.alt_text?.trim() || title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t("previous")} className={`${navClass} left-3`}>
              ‹
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t("next")} className={`${navClass} right-3`}>
              ›
            </button>
            <p
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white"
            >
              {t("counter", { current: images.indexOf(current) + 1, total: images.length })}
            </p>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("show", { number: i + 1 })}
                aria-current={image === current}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                  image === current ? "ring-2 ring-emerald-800" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={image.url} alt="" fill sizes="(min-width: 640px) 12vw, 25vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
