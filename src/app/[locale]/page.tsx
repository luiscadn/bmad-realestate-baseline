import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FeaturedListings from "@/components/FeaturedListings";
import HeroSearch from "@/components/HeroSearch";
import { ProcessSteps, ServiceCards } from "@/components/HomeSections";
import NewsletterForm from "@/components/NewsletterForm";
import ResourceCards from "@/components/ResourceCards";
import Testimonials from "@/components/Testimonials";
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
      <section className="relative min-h-[660px] lg:min-h-[720px] overflow-hidden bg-slate-950 text-white flex items-center justify-center">
        {/* Background Architectural Penthouse Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/miami-hero-penthouse.jpg"
            alt="Ultra-Luxury Miami Penthouse Architecture"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
          {/* Subtle gradient overlays: top dark for header contrast, bottom soft fade into clouds/content */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/65" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfbf9] to-transparent pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 text-center">
          {/* Floating Luxury Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-md mb-6 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Miami Ultra-Luxury Real Estate</span>
          </div>

          {/* Monumental Headline Inspired by FindRealEstate */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl drop-shadow-md text-white">
            {t("heroTitle")}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-100 font-normal leading-relaxed drop-shadow">
            {t("heroSubtitle")}
          </p>

          {/* Pill CTA button inspired by FindRealEstate */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#search-bar"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              <span>{locale === "es" ? "Explorar Residencias" : "Explore Residences"}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Floating Glassmorphic Search Bar */}
          <div id="search-bar" className="mt-12 text-left">
            <HeroSearch />
          </div>
        </div>

        {/* Architectural Outline Typography Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 select-none text-center text-5xl font-black uppercase tracking-widest text-transparent sm:text-7xl lg:text-8xl opacity-15"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}
        >
          VICTORIA ORDOÑEZ
        </div>
      </section>
      <FeaturedListings listings={featured} />
      <ProcessSteps />
      <ServiceCards />
      <Testimonials />
      <ResourceCards />
      <NewsletterForm />
    </>
  );
}
