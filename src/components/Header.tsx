"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AGENT_SIGN_IN_HREF, navItems } from "@/lib/site";
import LanguageSwitch from "./LanguageSwitch";

export default function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const linkClass = (href: string) =>
    `text-xs font-semibold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100/70 ${
      isActive(href) ? "text-slate-950 bg-slate-100 font-bold" : "text-slate-600"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label={t("homeLabel")} className="flex flex-col leading-tight">
          <span className="text-base font-extrabold uppercase tracking-tight text-slate-950">
            {t("brand")}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">{t("tagline")}</span>
        </Link>

        <nav aria-label={t("mainNav")} className="hidden items-center gap-3 md:flex">
          {navItems.map(({ key, href }) => (
            <Link key={key} href={href} aria-current={isActive(href) ? "page" : undefined} className={linkClass(href)}>
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <LanguageSwitch />
          </Suspense>
          <Link
            href={AGENT_SIGN_IN_HREF}
            className="hidden rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow md:inline-block active:scale-95"
          >
            {t("agentSignIn")}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-emerald-950 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={t("mobileNav")}
          className="border-t border-slate-200 bg-[#FBFBF9] px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100">
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={AGENT_SIGN_IN_HREF}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-emerald-950 px-4 py-2 text-center text-base font-medium text-white"
              >
                {t("agentSignIn")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
