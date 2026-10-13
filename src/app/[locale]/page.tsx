import { getTranslations, setRequestLocale } from "next-intl/server";
import FeaturedListings from "@/components/FeaturedListings";
import HeroSearch from "@/components/HeroSearch";
import { ProcessSteps, ServiceCards } from "@/components/HomeSections";
import { fetchFeaturedListings, type FeaturedListing } from "@/lib/featured-listings";
import { createPublicClient } from "@/lib/supabase-public";

export const revalidate = 300;

async function loadFeatured(): Promise<FeaturedListing[]> {
  try {
    return await fetchFeaturedListings(createPublicClient());
  } catch (error) {
    console.error("Home: could not load featured listings", error);
    return [];
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const featured = await loadFeatured();

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 px-4 pb-20 pt-20 text-white sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100/90">{t("heroSubtitle")}</p>
          <div className="mt-10 text-left text-slate-900">
            <HeroSearch />
          </div>
        </div>
      </section>
      <FeaturedListings listings={featured} />
      <ProcessSteps />
      <ServiceCards />
    </>
  );
}
