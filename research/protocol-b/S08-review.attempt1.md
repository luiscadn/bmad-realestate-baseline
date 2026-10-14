All four review layers finished; I'm compiling and triaging their findings. I edited nothing in the repo. The only files I wrote are the diff and claims files in `/tmp`.

## RAISED
Blind Hunter | n/a | src/components/HeroSearch.tsx:n/a | Neighborhood select options come from the footer link list, which may not match neighborhoods that have listings, and nothing tests that `/search` accepts them.
Blind Hunter | n/a | src/app/[locale]/page.tsx:n/a | A swallowed DB error returns `[]`, so with `revalidate = 300` the empty state can be cached for up to 5 minutes, and the catch-and-log path has no test.
Blind Hunter | n/a | src/components/FeaturedListings.tsx:n/a | Plain `<img>` with an eslint-disable, no `width`/`height`/`sizes`, and lazy loading near the fold.
Blind Hunter | n/a | src/components/FeaturedListings.tsx:n/a | Alt text falls back to the title inside a link that already contains the title, so it is announced twice, and the whole-card link has a very long accessible name.
Blind Hunter | n/a | src/lib/featured-listings.test.ts:n/a | The ordering and published filters are tested only as mock call arguments; the `lte` call isn't asserted and `new Date()` is non-deterministic.
Blind Hunter | n/a | src/lib/featured-listings.ts:n/a | Rows are cast through `unknown`, `price_cop` is typed `number` but wrapped in `Number()`, and null bedrooms or bathrooms are unguarded.
Blind Hunter | n/a | src/components/FeaturedListings.tsx:n/a | The rent price renders with a stray space and a doubled slash around `/mes`, and no test covers the rent branch.
Blind Hunter | n/a | src/components/HeroSearch.tsx:n/a | The form action hardcodes `es` as the unprefixed default locale instead of deriving it from the routing config.
Blind Hunter | n/a | src/components/HomeSections.tsx:n/a | The Sell card links to the unbuilt `/contact`, and the three "Learn more" links share the same label.
Blind Hunter | n/a | src/components/HeroSearch.tsx:n/a | Hero a11y details: redundant `role="search"` on a form, no focus-visible styling on cards, unverified contrast on small text, and the empty-state copy has no CTA link.
Blind Hunter | n/a | src/app/[locale]/page.tsx:n/a | The old `Metadata` namespace usage was removed and no `generateMetadata` replaces it, so the home page loses its SEO metadata.
Blind Hunter | n/a | src/components/Home.test.tsx:n/a | There is no page composition test and no es/en catalog parity test, and the spec's checklist items are ticked without evidence.
Blind Hunter | n/a | src/components/FeaturedListings.tsx:n/a | The `→` arrows and `COP` are hardcoded, area has no number formatting, and the price regex in the test is ICU-dependent.
Edge Case Hunter | n/a | src/components/HeroSearch.tsx:391-435 | A plain GET form submits empty selects as `operation=&neighborhood=&property_type=`, but the spec says empty fields are omitted.
Edge Case Hunter | n/a | src/components/Home.test.tsx:479-484 | The test asserts all submitted values are empty, which hides the empty-field omission requirement.
Edge Case Hunter | n/a | src/components/HomeSections.tsx:535 | The Sell card's "Learn more" link goes to `/contact`, which isn't built and returns 404.
Edge Case Hunter | n/a | src/components/FeaturedListings.tsx:338 | Featured cards link to `/listings/{slug}`, which isn't built and returns 404.
Edge Case Hunter | n/a | src/components/FeaturedListings.tsx:331-360 | Null or string `price_cop`, bedrooms, bathrooms or `area_m2` render "COP NaN" or break the plural message.
Edge Case Hunter | n/a | src/app/[locale]/page.tsx:257-266 | A fetch failure during ISR caches the empty-state page for up to 300 seconds.
Edge Case Hunter | n/a | src/lib/featured-listings.ts:656-659 | A null or non-array `row.images` embed could throw in `orderImages` and blank the whole featured list.
Verification Gap | n/a | src/app/[locale]/page.tsx:259-266 | The `loadFeatured` try/catch fallback has no test through the page, so removing it leaves every test passing.
Verification Gap | n/a | src/components/Home.test.tsx:479-484 | Empty-field omission is asserted the wrong way round, and no test selects options or checks the `sale`/`rent` option values or the resulting params.
Verification Gap | n/a | src/components/HeroSearch.tsx:389 | The hardcoded `es` locale prefix duplicates the routing config, and the test covers only `es` and `en`.
Verification Gap | n/a | src/components/HomeSections.tsx:535 | Nothing verifies that the `/contact` route exists; the test only pins the href string.
Acceptance Auditor | n/a | src/components/HomeSections.tsx:535 | The Sell card and featured cards link to routes not yet built (`/contact`, `/listings/[slug]`, `/search`), and the stub state isn't flagged anywhere.
Acceptance Auditor | n/a | src/components/Home.test.tsx:n/a | The catalog parity row from the spec's I/O matrix has no test in this diff, and the form test doesn't check the resulting query string.
Acceptance Auditor | n/a | src/components/HeroSearch.tsx:n/a | The form submits empty params, which conflicts with the "Empty search → /search" row and the "empty fields omitted" constraint.
Acceptance Auditor | n/a | src/components/HeroSearch.tsx:389 | The hardcoded locale prefix is brittle against "current locale's /search".
Acceptance Auditor | n/a | src/components/HeroSearch.tsx:n/a | Neighborhood options are a fixed footer subset, so listings in other neighborhoods can't be searched from the hero.
Acceptance Auditor | n/a | src/lib/featured-listings.ts:n/a | The published filter isn't asserted in the test and wasn't compared against the `listings.ts` pattern.
Acceptance Auditor | n/a | src/components/Home.test.tsx:n/a | The price regex depends on ICU data in the test environment.
Acceptance Auditor | n/a | src/app/[locale]/page.tsx:n/a | The unspecified `revalidate = 300` combined with the error fallback can cache an error-induced empty state.
Acceptance Auditor | n/a | _bmad-output/implementation-artifacts/spec-1-8-s08-home-hero-with-search-bar-featured-listings-services-cards.md:n/a | AC 4 (`npm run build` and `npm test` pass) is unverified by this audit.

## TRIAGE
1. defer — The spec explicitly says to reuse the footer list, so a fixed subset is a product choice for a later story.
2. patch — A transient error cached as the empty state for 5 minutes is a real defect (this finding, 6, 18, 31 and 32 overlap), and the fallback test is covered in finding 20.
3. reject — Plain `<img>` is a deliberate, disabled-lint choice; this is optimization polish.
4. reject — Double announcement is a minor a11y nit; the card link is the expected pattern.
5. patch — The `lte` published filter should be asserted, because "unpublished excluded" is a spec requirement. Fold into the `featured-listings.test.ts` update.
6. patch — A null or string value rendering "NaN" is a correctness risk (this finding, 17 and 19 overlap); add `Number.isFinite` and null guards.
7. patch — The rent price spacing/slash defect is small; fix it and add a rent test.
8. patch — Hardcoded `es` prefix duplicates the routing config (this finding, 22 and 27 overlap); derive it from the routing config.
9. reject — The 404s are expected until S09/S10 land, and `/contact` is out of scope per the spec's "Never" list.
10. reject — These are speculative design nits with no spec basis.
11. defer — The loss of home-page metadata is out of this story's scope; handle it in a later metadata story.
12. defer — A page composition test is a nice-to-have, and the parity test is covered by the existing i18n test per the Acceptance Auditor's note.
13. reject — The arrows and ICU-dependence are trivial, and `COP` currency labelling is intended.
14. patch — Empty params contradict the explicit spec rule "empty fields omitted"; add a client submit handler or strip empties. The parser tolerates empties, so severity is low.
15. patch — Rewrite the test to assert the correct behaviour (fixed together with 14).
16. reject — Duplicate of 9; out-of-scope route.
17. reject — Duplicate of 9; the detail route comes from S10.
18. patch — Duplicate of 6; fix together.
19. patch — Duplicate of 2; fix together.
20. patch — Guard with `Array.isArray(row.images)`; this is a cheap defensive fix.
21. patch — Add a page-level test for the `loadFeatured` catch fallback; this is the only coverage for a spec-mandated rule.
22. patch — Duplicate of 14/15; extend the tests to select options and assert the `FormData` entries.
23. patch — Duplicate of 8; fix together.
24. reject — Duplicate of 9; pinning the href is sufficient.
25. reject — Duplicate of 9; the stubs are expected.
26. defer — The parity test likely already exists in `i18n.test.ts`; verify it and then close this.
27. patch — Duplicate of 14; handled by the same fix.
28. patch — Duplicate of 8; handled by the same fix.
29. defer — Same product choice as 1.
30. patch — Duplicate of 5; fix together.
31. reject — Duplicate of 13; low-value polish.
32. patch — Duplicate of 2; fix together.
33. defer — Verifying build and tests is a post-review step, not a code finding.

FINDINGS_TOTAL: 33