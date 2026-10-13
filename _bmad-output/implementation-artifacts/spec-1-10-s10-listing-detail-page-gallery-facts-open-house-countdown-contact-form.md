---
title: 'S10 Listing detail page: gallery, facts, open-house countdown, contact form'
type: 'feature'
created: '2026-10-13'
status: 'in-review'
baseline_commit: '0dcbaac81794c8c5242c18a9339a25bfdc6075ca'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** ListingCard links to `/listings/[slug]` but the page does not exist (404). Visitors cannot see a property's full details or contact the agent about it.

**Approach:** Server page at `src/app/[locale]/listings/[slug]/page.tsx` loads the published listing via `fetchListingBySlug` and composes three components: a `next/image` gallery, an open-house countdown banner, and a client contact form posting to `/api/leads`. Add nullable `stratum` and `admin_fee_cop` columns, which the story requires but the schema lacks.

## Boundaries & Constraints

**Always:** Every user-facing string comes from `messages/{es,en}.json` (new `Listing` namespace, identical key sets). Price formatted as COP via `useFormatter`. Missing optional fields (address, area, stratum, admin fee, agent phone) are omitted, not shown as blanks. Form sends `listing_id`; server-side validation in `/api/leads` stays authoritative.

**Never:** Do not change `/api/leads` or `/api/listings/*` behaviour. Do not apply the migration to a remote database. No new runtime dependencies. No map, share, or favourite features (S11+).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Published listing | slug exists | Title, COP price, operation, type, neighborhood, address, description, facts, agent, gallery, form | N/A |
| Missing / unpublished / malformed slug | `fetchListingBySlug` returns null | `notFound()` | N/A |
| Fetch throws | Supabase error | Error propagates to Next error boundary (not a 404) | Logged |
| No images | `images: []` | Placeholder "no photo" block | N/A |
| Open house future | `open_house_at > now` | Banner with date and live d/h/m/s countdown | N/A |
| Open house past or null | past or null | No banner | N/A |
| Countdown reaches 0 | tick passes target | Banner disappears | N/A |
| Invalid form | empty name / bad email / empty message / bad phone | Per-field localized error, `aria-invalid`, no request | Focus not stolen |
| Submit ok | 201 | Success message, form cleared | N/A |
| Submit fails | 400 / 500 / network | Localized error banner, values kept, button re-enabled | Never leaks server text |
| Double submit | click while pending | Button disabled, single request | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/listings.ts` -- `fetchListingBySlug` returns listing + ordered `images` + `agent`; reuse as-is.
- `src/lib/leads.ts` -- server validation rules (name<=200, email regex, message<=5000, phone<=40); mirror client-side.
- `src/components/ListingCard.tsx` -- pattern for price formatting, badges, `next/image`.
- `src/app/[locale]/search/page.tsx` + `.test.tsx` -- pattern for async page, `setRequestLocale`, test mocks.
- `src/test/render.tsx` -- `renderWithIntl`; `src/test/setup.tsx` mocks `@/i18n/navigation`.
- `supabase/migrations/` -- add new migration after `20261013000100_*`.
- `messages/{es,en}.json` -- add `Listing` namespace.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/20261013000200_listing_stratum_admin_fee.sql` -- add nullable `stratum smallint check 1..6`, `admin_fee_cop bigint check >= 0` -- fields required by story
- [x] `src/lib/listing-detail.ts` -- `ListingDetail` type, `getCountdown(target, now)`, `isUpcoming`, `validateContactForm` returning error codes -- pure and unit-testable
- [x] `src/components/ListingGallery.tsx` -- client; main image plus thumbnail buttons, prev/next, `next/image` -- responsive gallery
- [x] `src/components/OpenHouseBanner.tsx` -- client; 1s tick, hydration-safe -- countdown
- [x] `src/components/ContactForm.tsx` -- client; validate, POST `/api/leads`, loading/error/success -- lead capture
- [x] `src/app/[locale]/listings/[slug]/page.tsx` -- server page, `notFound()`, `generateMetadata` -- composition
- [x] `messages/es.json`, `messages/en.json` -- `Listing` keys, full parity
- [x] Tests beside each file (lib, 3 components, page); extend i18n parity coverage if it exists

**Acceptance Criteria:**
- Given a published listing, when the page renders, then all required property fields, agent info, gallery and form are present.
- Given `open_house_at` in the future, when rendered, then a countdown is shown and ticks; otherwise no banner.
- Given invalid input, when submitting, then no fetch occurs and field errors show; given valid input, then `/api/leads` receives `{name,email,phone,message,listing_id}` and success shows.
- Given unknown or unpublished slug, then `notFound()` is called.
- `npm run build`, `npm test`, `npm run lint` pass.

## Implementation Notes

- Implemented inline (no subagents). Migration `20261013000200` is committed but not applied to any remote DB.
- `getCountdown` returns null once under one second remains; banner mounts client-side only to avoid hydration mismatch.
- Property-type labels reuse `Search.propertyTypes`. `generateMetadata` and the page share one query via React `cache`.
- Gotcha: a `beforeEach` that returns `mock.mockReset()` makes vitest run the mock as cleanup; use a block body.
- Review: inline self-review only; one finding (duplicate fetch) patched. Verified: 270 tests, lint, tsc, build pass.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm test` -- expected: all pass
- `npm run build` -- expected: success
- `npm run lint` -- expected: no errors
