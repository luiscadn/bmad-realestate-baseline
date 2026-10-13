# Epic 1 Context: Victoria Ordoñez Real Estate Platform

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Bilingual (es default, en) real estate web platform for agent Victoria Ordoñez in Cali, Colombia: public property browsing and lead capture, plus an authenticated agent area to manage listings.

## Stories

- Story 1.1–1.6: schema, storage, listings/leads/agent APIs (done)
- Story 1.7: App layout: header, footer, language switch, responsive nav
- Story 1.8: Home hero, featured listings, services
- Story 1.9: ListingCard and search results with filters
- Story 1.10: Listing detail page

## Requirements & Constraints

- All visible strings come from next-intl catalogs (es-CO default, en).
- Premium look: deep emerald slate (#0F2922) brand, warm gold (#C59B27/#D4AF37) accent, alabaster background (#FBFBF9), rounded-xl cards, rounded-full pills.

## Technical Decisions

- Next.js App Router, Tailwind v4, next-intl 3.x, Vitest + jsdom, Supabase.
- Public routes: /search, /neighborhoods, /about, /contact; agent routes /login, /dashboard.
- Header: sticky, blurred; logotype "VICTORIA ORDOÑEZ" + "Bienes Raíces • Cali"; ES|EN switch; agent sign-in; mobile drawer. Footer: dark, identity, sector links, navigation, direct contact (WhatsApp, Cali office, email), legal bar.
