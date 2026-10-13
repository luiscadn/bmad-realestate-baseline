import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("Metadata");
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-slate-600">{t("description")}</p>
    </section>
  );
}
