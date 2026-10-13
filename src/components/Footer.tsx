import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerNeighborhoods, navItems, siteConfig, whatsappUrl } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Header.nav");

  const linkClass = "text-sm text-stone-300 transition-colors hover:text-white";
  const titleClass = "mb-3 text-sm font-semibold uppercase tracking-wide text-[#D4AF37]";

  return (
    <footer className="bg-[#0F2922] text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <section>
          <h2 className="text-lg font-bold uppercase text-white">{t("identityTitle")}</h2>
          <p className="mt-3 text-sm text-stone-300">{t("identityBlurb")}</p>
          <p className="mt-3 text-xs text-stone-400">{t("license")}</p>
        </section>

        <section>
          <h2 className={titleClass}>{t("sectorsTitle")}</h2>
          <ul className="space-y-2">
            {footerNeighborhoods.map((name) => (
              <li key={name}>
                <Link href={{ pathname: "/search", query: { neighborhood: name } }} className={linkClass}>
                  {name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={{ pathname: "/search", query: { operation: "sale" } }} className={linkClass}>
                {t("sale")}
              </Link>
            </li>
            <li>
              <Link href={{ pathname: "/search", query: { operation: "rent" } }} className={linkClass}>
                {t("rent")}
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className={titleClass}>{t("navTitle")}</h2>
          <ul className="space-y-2">
            {navItems.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={linkClass}>
                  {nav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={titleClass}>{t("contactTitle")}</h2>
          <address className="space-y-2 text-sm not-italic text-stone-300">
            <p>
              <span className="text-stone-400">{t("addressLabel")}: </span>
              {t("address")}
            </p>
            <p>
              <span className="text-stone-400">{t("phoneLabel")}: </span>
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {siteConfig.phone}
              </a>
            </p>
            <p>
              <span className="text-stone-400">{t("emailLabel")}: </span>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </p>
          </address>
          <a
            href={whatsappUrl(t("whatsappMessage"))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-[#C59B27] px-4 py-2 text-sm font-semibold text-[#0F2922] transition-colors hover:bg-[#D4AF37]"
          >
            {t("whatsapp")}
          </a>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-stone-400 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
            <ul className="flex gap-4">
              <li>
                <Link href="/privacy" className="hover:text-white">{t("privacy")}</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">{t("terms")}</Link>
              </li>
            </ul>
          </div>
          <p>{t("legalNotice")}</p>
        </div>
      </div>
    </footer>
  );
}
