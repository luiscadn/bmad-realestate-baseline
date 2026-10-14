---
title: 'S19 - Ultra-Luxury Cinematic UX/UI & Architectural Hero (Inspired by FindRealEstate)'
type: 'feature'
created: '2026-10-14'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'd06a3510e69e2135ad57161503c2a2f506eb365d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current homepage hero uses a standard solid dark-green gradient and an opaque white search card, which lacks the breathtaking visual caliber, architectural sophistication, and modern glassmorphic elegance of premier portals like FindRealEstate.com.

**Approach:**
1. Generate / introduce a high-resolution cinematic architectural asset (luxury rooftop penthouse overlooking the Miami skyline / bay with warm interior lighting and soft ethereal cloud mist).
2. Redesign the Hero section with monumental display typography with subtle translucency ("Find What Moves You" / "Encuentra el espacio que te mueve"), architectural outline overlay, and a sleek pill-shaped CTA button (`Explorar Residencias →`).
3. Transform `HeroSearch` into a floating glassmorphic search bar with frosted blur (`backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 shadow-2xl`) and refined select inputs.
4. Elevate the navigation `Header` with a minimalist floating glass effect and a rounded-full pill button for agent login.
5. Enhance `ListingCard` and `FeaturedListings` with smooth hover zoom transitions (`group-hover:scale-105 duration-700`), glassmorphic badges, and high-contrast USD price typography.
6. Verify and update test suites and ensure 0 build errors.

## Boundaries & Constraints

**Always:** Maintain full bilingual key parity between `es.json` and `en.json`. Ensure accessible ARIA labels, semantic HTML, and high contrast for text. Maintain 100% passing tests in Vitest and clean Next.js production builds.

**Never:** Do not remove functionality, search filters, or breaking changes to API endpoints.

## Acceptance Criteria

- Hero section presents an architectural penthouse visual with ethereal atmosphere, monumental typography, and pill CTA button.
- HeroSearch renders as a floating glassmorphic bar with backdrop blur and responsive inputs.
- Header features minimalist styling and rounded-full pill button.
- ListingCard components feature smooth hover zoom micro-interactions and glass badges.
- All tests pass and Next.js production build succeeds with 0 errors.

</frozen-after-approval>

## Tasks

- [ ] Create branch `story/S19-miami-cinematic-ux` and tag `S19-start`.
- [ ] Generate / add high-resolution luxury architectural hero image.
- [ ] Redesign `src/components/HeroSearch.tsx` with floating glassmorphism aesthetics.
- [ ] Redesign hero section in `src/app/[locale]/page.tsx` with architectural visual, monumental typography, and pill CTA.
- [ ] Polish `src/components/Header.tsx` with floating minimalist glass and pill button.
- [ ] Polish `src/components/ListingCard.tsx` with smooth hover zoom and glassmorphic badge styling.
- [ ] Update tests in `Home.test.tsx`, `Header.test.tsx`, and `ListingCard.test.tsx`.
- [ ] Verify test suite and production build.
