## RAISED

Blind Hunter (BH), Edge Case Hunter (EC), Verification Gap (VG), Acceptance Auditor (AA). The layers did not assign severities, so I assigned them for this report.

BH | low | src/components/Footer.tsx:n/a | Footer and nav link to /privacy, /terms, /search, /neighborhoods, /about, /contact and /login. None of these pages exist yet, so they 404, and the legal pages aren't in the spec at all.
BH | medium | src/middleware.ts:7 | The `/api` exclusion and the `/fr` → 404 row are only checked by a manual smoke test. The `.*\..*` matcher also skips any path containing a dot.
BH | medium | src/app/[locale]/layout.tsx:n/a | There is no `not-found.tsx` or root layout, so the 404 page renders bare or in the wrong language.
BH | low | src/lib/site.ts:n/a | Contact values are placeholders (`573000000000`, `000 0000`) and nothing guards against shipping them. The address sits in the catalogs, contradicting "contact values live in config".
BH | low | src/lib/site.ts:n/a | Neighborhood names are raw strings that bypass the catalogs, and nothing verifies the query values match `listings-query.ts`.
BH | low | src/components/Header.tsx:n/a | Active nav state is colour-only (no `aria-current`), uses strict equality so nested routes aren't highlighted, and the mobile drawer has no active styling.
BH | medium | src/components/Header.tsx:n/a | The drawer has no focus management, no outside-click close, stays open when the viewport grows past `md`, and has double-announcing `aria-label` plus `aria-expanded`. `aria-controls` points at a missing element.
BH | low | src/components/Header.test.tsx:n/a | Tests are weak. The link-click test doesn't exercise the pathname effect. The `not.toContain('""')` check is crude. The navigation mock replaces the real `Link`. The layout test leaks mock state. `generateMetadata`, the skip link and `lang` have no tests.
BH | medium | src/components/LanguageSwitch.tsx:n/a | `Object.fromEntries(searchParams.entries())` drops repeated query params, which will break S09 multi-value filters.
BH | low | src/app/globals.css:n/a | The dark-mode block and Geist font were removed. Brand colours are hardcoded hex values in components instead of tokens.
BH | low | src/app/[locale]/layout.tsx:n/a | The skip link has a minimal focus style. The footer's heading levels are odd. There is no `metadataBase`, hreflang alternates or Open Graph tags.
BH | low | package.json:n/a | There is no jest-dom, so tests use `toBeTruthy`. `next-intl` is on 3.x without `hasLocale`. The spec's Verification section is mixed up and records a skipped checkpoint.
BH | low | _bmad-output/implementation-artifacts/epic-1-context.md:n/a | It says stories 1.1–1.6 are done while the sprint status shows two still in `review`. It duplicates catalog text, and a hand-edited file carries a "regenerate" comment.
EC | medium | src/components/LanguageSwitch.tsx:1141 | A repeated query key (e.g. `?type=a&type=b`) keeps only the last value on language switch.
EC | low | src/components/LanguageSwitch.tsx:1154 | The active locale link has no `aria-current="page"`, and clicking it reloads the page.
EC | low | src/components/Footer.tsx:911 | The copyright year is frozen at the build year when the page is statically prerendered.
EC | low | src/components/Footer.tsx:914 | The Privacy and Terms links return 404 in both locales.
EC | medium | src/components/Header.tsx:1004 | The drawer stays open after a locale switch because the locale-stripped pathname doesn't change.
EC | low | src/components/Header.tsx:1008 | Keyboard focus is lost when the drawer closes via Escape or link click.
EC | low | src/components/Header.tsx:1017 | Nested routes aren't highlighted and nav links lack `aria-current`.
EC | medium | src/app/[locale]/layout.tsx:546 | `/fr` and unmatched paths show Next's bare default 404, with no `lang`, header or footer.
EC | low | src/app/[locale]/layout.tsx:540 | `generateMetadata` runs for an invalid locale before the `isLocale` guard.
EC | low | src/app/[locale]/page.tsx:580 | `setRequestLocale` is called with an unvalidated param, and the page runs in parallel with the layout guard.
EC | low | src/i18n/i18n.test.ts:1198 | The parity test misses dropped ICU placeholders and whitespace-only values.
EC | low | src/test/setup.tsx:1343 | The global navigation mock ignores array queries and never exercises the real `createNavigation`.
EC | low | src/components/Footer.tsx:844 | The claim "every visible string comes from the catalogs" is untrue for neighborhood names.
EC | low | src/components/LanguageSwitch.tsx:1141 | The claim that the switch keeps path and query is untrue for repeated keys, and the hash is dropped.
VG | medium | src/middleware.ts:7 | No test covers the matcher keeping `/api`, `/_next` and files out of locale routing, so a regression would break the leads and listings APIs while CI stays green.
VG | medium | src/i18n/navigation.ts:4 | Locale routing and the language switch are tested only against a hand-written mock, never the real next-intl output.
VG | medium | src/app/locale-layout.test.tsx:n/a | `LocaleLayout` itself is never rendered, so the `/fr` → 404 and `<html lang>` rows have no tests. The `pathname` close effect is also untested.
VG | low | src/components/Footer.test.tsx:n/a | The sale/rent filter hrefs and the privacy/terms hrefs have no assertions.
AA | low | src/lib/site.ts:n/a | `footerNeighborhoods` bypasses the "no hardcoded user-visible strings" rule.
AA | low | messages/en.json:n/a | The address is a contact value kept in the catalogs, but the spec says contact values live in `site.ts`. The spec's Implementation Notes call the address a placeholder in `site.ts`.
AA | medium | src/test/setup.tsx:n/a | The mocked navigation means the I/O row "`/en/search` → click ES → `/search`" and the keep-path-and-query boundary are not really verified.
AA | medium | src/app/locale-layout.test.tsx:n/a | The unknown-locale 404 and the `lang` attribute (es/en) are not verified by any test.
AA | medium | src/i18n/i18n.test.ts:n/a | No test asserts the "middleware excludes /api" constraint.
AA | medium | src/components/Header.tsx:n/a | The drawer may stay open after a language change, so "closes on navigation" is not fully met.
AA | low | src/components/Footer.tsx:n/a | The privacy and terms links point at nonexistent routes and aren't recorded as known gaps.
AA | low | src/app/globals.css:n/a | The palette tokens task is only partly done (emerald and gold aren't tokens), and the dark-mode removal isn't in the spec.
AA | low | _bmad-output/implementation-artifacts/spec-1-7-s07-app-layout-header-footer-language-switch-responsive-nav.md:n/a | Implementation notes are mixed into the Verification section, which is minor spec hygiene.

## TRIAGE

1. defer: the target pages belong to later stories and the spec forbids building them.
2. patch: add a vitest test of `config.matcher` for `/api`, `_next`, files and normal paths. The dotted-slug concern is a decision for later.
3. patch: add a `not-found` and root layout so the 404 has `html` and `body`.
4. defer: the placeholders are documented, and replacing them is pre-launch content work. The address in the catalogs is a minor spec mismatch.
5. reject: they are proper nouns, and matching the DB values is S09 scope.
6. patch: add `aria-current="page"`, and use a prefix match for nested routes.
7. patch: return focus to the toggle on Escape and close the drawer on locale change. Outside-click closing and the resize case can wait.
8. defer: this is test polish with no functional bug.
9. patch: use `getAll` to keep repeated query keys.
10. defer: the Geist and dark-mode removal is documented, and token consolidation is cosmetic.
11. defer: SEO metadata and heading polish are outside S07's ACs.
12. reject: process and dependency hygiene, with no code defect.
13. patch: fix the epic-context statuses. This is a docs-only fix.
14. patch: duplicate of finding 9.
15. patch: add `aria-current` on the active locale link, folded with finding 6.
16. defer: the year only goes stale on deploys, and it is trivial.
17. defer: duplicate of finding 1.
18. patch: also reset the drawer when `locale` changes.
19. patch: duplicate of finding 7, fixed together.
20. patch: duplicate of finding 6.
21. patch: duplicate of finding 3.
22. reject: Next calls `notFound` in the layout, so metadata for a 404 is harmless.
23. reject: `generateStaticParams` and the layout guard already cover it, so the risk is low.
24. defer: the parity test is adequate for now, and placeholder comparison is a nice-to-have.
25. defer: add one real-navigation test together with finding 30.
26. reject: duplicate of finding 5.
27. defer: the hash is dropped, which is a minor limitation, and the repeated-key part is covered by finding 9.
28. patch: duplicate of finding 2.
29. patch: add a `getPathname` test that bypasses the mock, which also covers findings 25 and 34.
30. patch: add a `LocaleLayout` test for `lang` and the `/fr` 404. The pathname-effect test can wait, since the click handler covers the AC.
31. defer: low risk, and the assertions can land with S09.
32. reject: duplicate of finding 5.
33. defer: duplicate of finding 4.
34. patch: duplicate of finding 29.
35. patch: duplicate of finding 30.
36. patch: duplicate of finding 2.
37. patch: duplicate of finding 18.
38. defer: duplicate of finding 1.
39. defer: duplicate of finding 10.
40. reject: documentation hygiene only.

FINDINGS_TOTAL: 40