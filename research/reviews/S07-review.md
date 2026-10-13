I reviewed S07 (80dd46d against main) and found nine issues. I patched four and left five. With the patches, `npm test` passes (199 tests, up from 195), as do `tsc --noEmit` and `npm run lint`. I didn't re-run `npm run build` or any browser or `next start` check, and I didn't commit anything.

I ran the review myself rather than through the skill's four parallel reviewer subagents, since you hadn't asked for subagents. I also didn't pause at the step-1 checkpoint. The review covered the diff and the spec (`spec-1-7-s07-…md`), but it didn't have the independent perspectives of separate reviewers.

I found no acceptance-criteria violations. The two catalogs have identical keys, the drawer behaves as the spec says (toggle, Escape and link click all close it), and `/api` is outside locale routing.

**Patched**
- **Locale switch lost repeated query params.** `LanguageSwitch.tsx` used `Object.fromEntries`. On `/search?neighborhood=Granada&neighborhood=Pance`, clicking EN kept only the last value. Repeated keys are now preserved, and I added a test.
- **Middleware matcher had no boundary on `api`.** Any page route starting with "api" (for example `/api-docs`) skipped locale routing. The matcher is now `api(?:/|$)`, with a new `src/middleware.test.ts`.
- **Active nav link had no `aria-current`.** It also matched only the exact path, so `/search/123` didn't highlight Propiedades. It now uses a prefix match and `aria-current="page"`, with a test.
- **Skip-link target wasn't focusable.** `<main>` now has `tabIndex={-1}`, so keyboard focus moves into it.

I also updated the test mock in `src/test/setup.tsx` so it can handle array query values.

**Not patched**
- **Mocked navigation in tests.** The tests mock `@/i18n/navigation`, so locale prefixing is never tested against the real next-intl `Link`. Only an integration or e2e check for `/`, `/en` and `/fr` would catch a routing regression.
- **Stale copyright year.** The footer year is computed at build time, so it freezes until the next deploy.
- **Drawer focus.** Escape doesn't return focus to the toggle. The open state also persists if the window is widened past the `md` breakpoint.
- **SEO and 404.** There are no hreflang or canonical tags. Unmatched routes show Next's default 404 instead of a localized one.
- **Language switch labels (accepted as-is).** The `aria-label` ("Español"/"English") differs from the visible "ES"/"EN" text, and the touch targets are about 24px.

The contact details in `src/lib/site.ts` are placeholders, as the spec notes, and need real values before launch.
