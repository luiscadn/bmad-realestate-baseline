# Code Review Findings: Story S10 (Listing detail page: gallery, facts, open-house countdown, contact form)

The S10 review found no blocking problems, and I applied 7 patches. All 273 tests, `tsc` and lint pass, and the banner test also passes under `TZ=Asia/Tokyo`. I did not run `npm run build`. The changes are uncommitted.

I ran all four reviewers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor) and checked each claim against the code. 0 needed a decision from you, 7 were patched, none were deferred, and the rest were rejected.

**Patches applied**
1. **Interval kept running:** `OpenHouseBanner` kept its 1-second timer after the event started. It now clears the timer when the countdown ends, and depends on `openHouseAt`.
2. **Invalid `<dl>` order:** the countdown rendered `<dd>` before `<dt>`. I swapped them and used `flex-col-reverse`, so the look is unchanged.
3. **Landmark override:** `<aside role="region">` replaced the complementary landmark. It is now a `<section>`.
4. **Empty alt text:** an empty-string `alt_text` left the main photo with no description, because `??` only falls back on null. It now uses `?.trim() || title` in `ListingGallery.tsx`.
5. **Area of zero:** an `area_m2` of `"0.00"` is a truthy string and would render "0 m²". `page.tsx` now checks `Number(area) > 0`.
6. **New page test:** it submits the rendered form and asserts that `listing_id` equals the fetched listing's id. Before, no test would have caught the page passing the wrong id.
7. **New banner tests:** one asserts the open-house date text in Bogotá time, and one checks that the timer stops after the event starts.

**Rejected after checking**
- **Phone rule:** the client regex is stricter than the server's. That's intended, since the spec lists "bad phone" as an invalid input.
- **Unused `email.tooLong`:** emails over 254 characters show the "invalid" message instead. This is cosmetic.
- **Missing `property_type` label:** the database check constraint matches the message catalog, so this can't happen.
- **New columns not fetched:** `fetchListingBySlug` uses `select("*")`, so `stratum` and `admin_fee_cop` do reach the page.
- **Fetch errors not logged:** the spec wants fetch errors to propagate, and they do. Next.js logs them.
- **Out of scope:** fetch timeout, rate-limit handling, spam protection, Open Graph/JSON-LD metadata, swipe and lightbox.
- **Other:** `aria-current="false"` is valid, the spec says focus should not move on invalid submit, and the gendered "Asesora" label is cosmetic.

I appended the findings and rejections to the S10 spec file. I also set its status and the `sprint-status.yaml` entry to `done`, since nothing is left open.
