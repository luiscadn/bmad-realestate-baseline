---
title: 'S07 - App layout: header, footer, language switch, responsive nav'
type: 'feature'
created: '2026-10-13'
status: 'in-review'
baseline_commit: 'fc575752937055a395bdfb0dcc6ef61f0feae71e'
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/docs/design-reference.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app has the create-next-app placeholder layout: no i18n, navigation, or footer.

**Approach:** Configure next-intl with locale-prefixed routing (`es` default, no prefix; `en` under `/en`) and es/en catalogs. Add a global layout with a sticky responsive `Header` (branding, nav links, ES/EN switch, agent sign-in, mobile drawer) and a `Footer` (Victoria Ordoñez contact, Cali office, WhatsApp link, neighborhood links, legal notices). Every visible string comes from the catalogs.

## Boundaries & Constraints

**Always:** `/api/*` stays outside locale routing. Locale switch keeps the current path and query. Drawer is keyboard accessible (toggle `aria-expanded`, Escape closes, closes on navigation). Contact values live in one config module, not in catalogs.

**Never:** Build the target pages (search, about, contact, login). Hardcode user-visible strings in components. Change API routes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default locale | GET `/` | Spanish page, `<html lang="es">` | N/A |
| English | GET `/en` | English strings, `lang="en"` | N/A |
| Unknown locale | GET `/fr` | 404 | `notFound()` |
| Switch | on `/en/search`, click ES | navigates to `/search` | N/A |
| Drawer | click toggle | nav panel opens; click again/Escape/link closes | N/A |
| Catalog parity | es.json vs en.json | identical key sets | test fails otherwise |

</frozen-after-approval>

## Code Map

- `src/app/layout.tsx`, `src/app/page.tsx` -- placeholders; move into `src/app/[locale]/`.
- `src/app/api/**` -- existing routes; unchanged.
- `next.config.ts` -- wrap with `createNextIntlPlugin`.
- `vitest.config.ts` -- jsdom, globals, `@` alias; add setup for RTL cleanup if needed.
- `docs/design-reference.md` -- header/footer layout and palette.
- `src/lib/listings-query.ts` -- `neighborhood` query param name for sector links.

## Tasks & Acceptance

**Execution:**
- [x] `src/i18n/routing.ts`, `navigation.ts`, `request.ts`, `src/middleware.ts`, `next.config.ts` -- next-intl setup; middleware matcher excludes `api`, `_next`, files
- [x] `messages/es.json`, `messages/en.json` -- Metadata, Header, Footer, Language namespaces
- [x] `src/lib/site.ts` -- contact config, nav items, neighborhoods
- [x] `src/components/{Header,LanguageSwitch,Footer}.tsx` -- components
- [x] `src/app/[locale]/layout.tsx`, `page.tsx` -- html/body, provider, header/main/footer; placeholder home
- [x] `src/app/globals.css` -- brand palette tokens
- [x] tests: components, catalog parity, routing config
- [x] `package.json` -- add `@testing-library/react` dev dependency

**Acceptance Criteria:**
- Given `/` or `/en`, when rendered, then header, main and footer appear in the matching language.
- Given the mobile drawer is open, when Escape is pressed or a link is clicked, then it closes.
- Given `npm run build` and `npm test`, then both pass.

## Implementation Notes

- Contact phone/WhatsApp/email/address are placeholders in `src/lib/site.ts` (none supplied); replace before launch.
- Approved-checkpoint note: the user asked for end-to-end delivery, so the checkpoint was not halted on.

## Verification

**Commands:**
- `npm test` -- expected: all pass
- `npm run build` -- expected: success
- `next-intl` is 3.26.5, which has no `hasLocale`; `isLocale` in `src/i18n/routing.ts` replaces it.
- Removed `next/font/google` (Geist): the build could not fetch Google Fonts offline, and `globals.css` already used the Arial stack, so nothing visible changed.
- `LanguageSwitch` uses `useSearchParams`, so `Header` wraps it in `Suspense` (required for static prerender).
- Verified: `npm test` (195 pass), `tsc --noEmit`, `npm run lint`, `npm run build`; `next start` smoke: `/` es 200, `/en` en 200, `/fr` 404.
