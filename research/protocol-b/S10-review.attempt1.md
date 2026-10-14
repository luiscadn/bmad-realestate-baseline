## RAISED
blind-hunter | n/a | src/components/ContactForm.tsx:n/a | Success/error banner stays visible after the user edits a field, and focus is not moved to it.
blind-hunter | n/a | src/lib/listing-detail.ts:n/a | Client validation duplicates the server `validateLead` rules, with no parity test.
blind-hunter | n/a | src/lib/listing-detail.ts:n/a | Email length over 254 reports "invalid", so the `email.tooLong` message key is never used (dead `invalid` keys for name/message too).
blind-hunter | n/a | src/components/ListingGallery.tsx:n/a | `go()` navigates from the raw index while the display uses the clamped one, and `aria-current={false}` renders "false".
blind-hunter | n/a | src/components/ListingGallery.tsx:n/a | Gallery has no arrow-key or swipe support and no image-load error handling.
blind-hunter | n/a | src/components/OpenHouseBanner.tsx:n/a | `role="region"` on `<aside>` and `<dd>` placed before `<dt>` give wrong semantics.
blind-hunter | n/a | src/components/OpenHouseBanner.tsx:n/a | Time is shown in a hard-coded America/Bogota zone with no zone label, and the interval ticks while the tab is hidden.
blind-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:n/a | `force-dynamic` is set with no stated reason.
blind-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:n/a | `generateMetadata` ignores locale and sets no canonical/hreflang, Open Graph image or JSON-LD.
blind-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:n/a | `listing as unknown as ListingDetail` cast hides any mismatch with the query result.
blind-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:78 | The address line is built with separators that can leave stray punctuation when fields are null.
blind-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:n/a | A fetch error that the spec says is "Logged" is not logged, and there is no back link or route-level error/not-found page.
blind-hunter | n/a | supabase/migrations/20261013000200_listing_stratum_admin_fee.sql:n/a | Migration comes with no seed data, so stratum and admin fee are never visible in local development; there is also no rollback note.
blind-hunter | n/a | messages/en.json:n/a | No i18n parity test was extended for the new `Listing` namespace.
blind-hunter | n/a | messages/es.json:n/a | Feminine "asesora" is used for an agent of unknown gender.
blind-hunter | n/a | messages/en.json:n/a | "HOA fee" wording and mixed abbreviated/full time units; `openHouse.label` and `openHouse.title` are redundant.
blind-hunter | n/a | src/components/ContactForm.tsx:n/a | No consent text, honeypot or captcha on the public lead form.
blind-hunter | n/a | src/components/ContactForm.test.tsx:n/a | Tests run in jsdom only and have no "focus not stolen" case.
edge-case-hunter | n/a | src/components/ContactForm.tsx:698 | The `fetch` to /api/leads has no timeout or abort, so the button can stay disabled on "Sending…" forever.
edge-case-hunter | n/a | src/components/ContactForm.tsx:709 | Every non-OK response (400 field errors, 429) shows the same generic error.
edge-case-hunter | n/a | src/components/ContactForm.tsx:710 | State is set after the component may have unmounted.
edge-case-hunter | n/a | src/components/ContactForm.tsx:689 | The double-submit guard relies on render state, so two submits in the same tick can both pass and send duplicate leads.
edge-case-hunter | n/a | src/lib/listing-detail.ts:1157 | The client phone regex rejects numbers the server accepts, such as "ext 123-4567".
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:462 | An unknown `property_type` value makes next-intl fail on a missing message.
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:475 | An `area_m2` of "0" or NaN renders "0 m²" or "NaN m²".
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:500 | The location line has stray separators when neighborhood or address is empty.
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:541 | An agent phone with no digits renders an empty `tel:` link.
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:453 | The meta description is cut with `slice(0,160)` without collapsing newlines and may split a surrogate pair.
edge-case-hunter | n/a | src/app/[locale]/listings/[slug]/page.tsx:441 | `findListing` rethrows fetch errors without logging them.
edge-case-hunter | n/a | src/components/ListingGallery.tsx:855 | The index state goes stale if the `images` prop changes.
edge-case-hunter | n/a | src/components/ListingGallery.tsx:863 | `next/image` has no `onError` handling, and `priority` is set on every main image.
edge-case-hunter | n/a | src/components/OpenHouseBanner.tsx:977 | The countdown is stale after a backgrounded tab resumes, and the interval keeps running after expiry.
verification-gap | n/a | src/lib/listing-detail.ts:1140 | Duplicated `EMAIL_RE`, `MAX` and phone rules could drift from `leads.ts` with no test failing.
verification-gap | n/a | src/app/[locale]/listings/[slug]/page.test.tsx:n/a | No test shows the real query returns the new `stratum` and `admin_fee_cop` columns.
acceptance-auditor | n/a | src/lib/listing-detail.ts:n/a | `getCountdown` returns null when under one second remains, although `open_house_at > now` should show the banner.
acceptance-auditor | n/a | src/components/OpenHouseBanner.tsx:n/a | The banner is absent from server-rendered HTML because it renders only after mount.
acceptance-auditor | n/a | src/lib/listing-detail.ts:1157 | Client phone check is stricter than the server rule it is meant to mirror.
acceptance-auditor | n/a | src/lib/listing-detail.ts:n/a | The "same as server" comment is inaccurate, since the 254 email length check is reported as "invalid" rather than "tooLong".
acceptance-auditor | n/a | messages/en.json:n/a | Unused message keys: `errors.name.invalid`, `errors.message.invalid`, `errors.phone.required`, `errors.email.tooLong`.
acceptance-auditor | n/a | src/components/ContactForm.tsx:689 | The "single request" double-submit guarantee has no same-tick guard, and the test submits only after re-render.
acceptance-auditor | n/a | src/components/ContactForm.test.tsx:n/a | The "focus not stolen" requirement has no test.
acceptance-auditor | n/a | src/components/OpenHouseBanner.tsx:n/a | Hard-coded timezone and non-localized gallery glyphs against "every user-facing string comes from messages".
acceptance-auditor | n/a | messages/en.json:n/a | The spec task "extend i18n parity coverage" has no change in the diff.
acceptance-auditor | n/a | src/app/[locale]/listings/[slug]/page.tsx:n/a | The `as unknown as` cast means the claim that the new columns are selected cannot be checked from the diff.

## TRIAGE
1. reject | Low: the banner is a minor UX nit and clearing it needs extra state.
2. defer | Real drift risk, but a shared-rules refactor is beyond this story. `leads.ts` is not touched here.
3. patch | Dead message keys and a mislabeled error code. Direct fix: emit `tooLong` or delete the keys.
4. reject | The clamp already covers the display, and the stale `go()` index only matters if `images` changes, which it doesn't on this page. The `aria-current` "false" is harmless.
5. defer | Nice-to-have. The spec does not require keyboard arrows or swipe.
6. patch | Small direct semantic fix: drop the redundant `role`, and put `dt` before `dd`.
7. reject | The fixed Bogota zone fits a Cali-only product. A hidden-tab interval is negligible.
8. reject | Dynamic rendering is needed for a per-request Supabase fetch.
9. defer | SEO extras (canonical, Open Graph, JSON-LD) are outside the spec.
10. defer | Cast is a typing smell, but the select is `*`. Would need typed DB generation.
11. patch | Duplicate of #26. Join the non-empty parts to avoid stray separators.
12. patch | The spec's "Logged" row for fetch errors is unmet. A back link and an error page are out of scope.
13. defer | The deferred-work note already records the missing seed data. A rollback note is cosmetic.
14. defer | Same as #43. `src/i18n/i18n.test.ts` exists and en/es parity holds by inspection.
15. reject | Agent gender is unknown and "asesora" matches the existing copy in `es.json`.
16. reject | Wording and polish only, with no harm.
17. reject | Anti-spam is outside this story, and rate limiting is the server's job.
18. reject | Duplicate of the "focus not stolen" gap (#41). jsdom-only is the project's norm.
19. patch | A hung request locks the form forever. `AbortSignal.timeout` is a one-line, unambiguous fix.
20. decision-needed | Mapping 400 field errors and 429 to specific messages needs a UX/copy choice and new message keys.
21. reject | React 18+ ignores state updates after unmount, so there is no harm.
22. patch | A real duplicate-lead risk, since the spec guarantees a single request. Add an in-flight ref.
23. decision-needed | Client may block phone numbers the server accepts. Whether to relax the client or tighten the server is a product choice.
24. reject | `property_type` is a constrained enum and the same lookup is already used by ListingCard.
25. reject | Unlikely data; the DB likely constrains `area_m2` to be positive, and fixing it adds guards.
26. patch | Same defect as #11. Join non-empty parts.
27. reject | Unlikely data with a more-than-trivial fix.
28. reject | Cosmetic meta-description tidying.
29. patch | Same as #12. Log the error before rethrowing.
30. reject | The `images` prop never changes on this server-rendered page.
31. defer | Image-load error fallback is a nice-to-have. Host patterns are already configured in `next.config`.
32. reject | The next tick corrects the countdown within one second, and the banner is hidden once expired.
33. defer | Same as #2. Add a parity test later.
34. defer | The select is `select("*, ...")`, so the columns flow through once the migration is applied. A real-DB test would need infrastructure.
35. reject | Sub-second edge case. The spec's Implementation Notes record this deviation.
36. reject | Intentional, for hydration safety. The countdown is meaningless in static HTML.
37. decision-needed | Duplicate of #23.
38. patch | Duplicate of #3. Fix the comment and the error code together.
39. patch | Duplicate of #3. Remove or wire the unused keys.
40. patch | Duplicate of #22. Add a ref guard and a same-tick test.
41. defer | The code doesn't move focus, so the requirement is met implicitly. Adding the test is optional.
42. reject | A timezone is a format choice rather than a string, and the glyphs are labelled by `aria-label`.
43. defer | Duplicate of #14. Parity holds by inspection, and an existing i18n test may already cover it.
44. reject | Duplicate of #10. `fetchListingBySlug` uses `select("*, images:listing_images(*), agent:agents(*)")`, so the columns are included.

FINDINGS_TOTAL: 44