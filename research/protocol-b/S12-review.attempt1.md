Ran all four review layers as parallel subagents (diff 1b87f85..75d550b, review mode full). The Blind Hunter, Edge Case Hunter, Verification Gap and Acceptance Auditor all returned. No files were changed.

## RAISED

BH | medium | src/components/NewsletterForm.tsx:n/a | The success and error messages have no persistent aria-live region, so assistive tech may not announce them.
BH | medium | src/components/NewsletterForm.tsx:n/a | The form ships against a nonexistent /api/newsletter, with no flag or TODO, no contract test, and one generic error for 400/409/429.
BH | medium | src/components/NewsletterForm.tsx:n/a | Consent is never recorded server-side (no timestamp or policy version), and the consent copy has no privacy-policy link.
BH | low | src/components/NewsletterForm.tsx:n/a | There is no honeypot, rate limiting or captcha, no locale is sent, and validation is client-only.
BH | low | src/components/NewsletterForm.tsx:n/a | The aria-labelledby ids (newsletter-title, testimonials-title, resources-title) are hard-coded and could collide.
BH | low | src/components/NewsletterForm.tsx:n/a | Inputs have no required or aria-required, and the aria-hidden "*" hides that fields are required from screen readers.
BH | low | src/components/NewsletterForm.tsx:n/a | Focus is not moved to the first invalid field after a failed validation.
BH | low | src/components/NewsletterForm.tsx:n/a | The aria-invalid red border is low contrast on the dark background.
BH | low | src/components/NewsletterForm.tsx:n/a | A stale error or success status is not cleared when the user edits a field.
BH | low | src/lib/newsletter.ts:13 | EMAIL_RE is too loose or too strict for some addresses (single-label domains, odd forms).
BH | low | src/lib/newsletter.test.ts:n/a | The validation tests are thin: no IDN, plus-address or trailing-dot cases, the 250-character local part is invalid anyway, and the 200-character name limit is not tested exactly.
BH | medium | messages/en.json:n/a | The testimonials are fabricated placeholder quotes with real-sounding names, presented as genuine reviews with no "sample" marker.
BH | low | src/components/ResourceCards.tsx:n/a | The resource cards look clickable but have no link or "coming soon" label, and no date, author or image.
BH | low | src/components/HomeEditorial.test.tsx:n/a | There is no test for the double-submit guard, for clearing success on re-edit, for aria-describedby wiring, or for Home page integration.
BH | low | src/components/HomeEditorial.test.tsx:n/a | One test file covers three components under a name that fits none of them, and the listitem and label queries are loose.
BH | low | _bmad-output/implementation-artifacts/spec-1-12-s12-newsletter-signup-testimonials-and-resources-sections.md:11 | The spec status is `done` while sprint-status.yaml says `review`.
BH | low | _bmad-output/implementation-artifacts/spec-1-12-s12-newsletter-signup-testimonials-and-resources-sections.md:n/a | The spec says the blind-hunter layer was skipped, and its "314 passed" claim has no committed evidence.
ECH | medium | src/components/NewsletterForm.tsx:n/a | The fetch has no timeout or AbortController, so a stalled request leaves the button disabled on "Subscribing…".
ECH | medium | src/components/NewsletterForm.tsx:n/a | A 409 or other 4xx for an already-subscribed email shows a generic failure.
ECH | low | src/components/NewsletterForm.tsx:n/a | Focus stays on the submit button after a failed validation, so the errors are not announced.
ECH | low | src/components/NewsletterForm.tsx:n/a | The success banner stays after the user edits the fields or resubmits.
ECH | low | src/components/NewsletterForm.tsx:n/a | The role=status/alert elements are mounted with their text already inside, so some assistive tech does not announce them.
ECH | low | src/lib/newsletter.ts:13 | The regex accepts a..b@x.com, a@-x.com and a@x.c.
ECH | low | src/components/NewsletterForm.tsx:n/a | Consent is not included in the POST payload.
ECH | low | src/components/Testimonials.tsx:n/a | The quote marks are hard-coded in JSX instead of coming from the locale files.
ECH | low | src/components/HomeEditorial.test.tsx:n/a | The in-flight double submit and the success-then-resubmit path are untested.
ECH | low | _bmad-output/implementation-artifacts/spec-1-12-s12-newsletter-signup-testimonials-and-resources-sections.md:11 | The spec says `done` and sprint-status says `review`.
ECH | low | _bmad-output/implementation-artifacts/spec-1-12-s12-newsletter-signup-testimonials-and-resources-sections.md:22 | The "all strings via next-intl" claim is not literally true (hard-coded quote marks and "*"), and the parity test covers only three sections.
VG | low | src/app/[locale]/page.tsx:n/a | The Home page has no test that it composes Testimonials, ResourceCards and NewsletterForm, so removing them would not fail any test.
VG | low | src/components/HomeEditorial.test.tsx:n/a | The test pins the POST body to exactly {name, email}, which fixes "consent not sent" and would fail if S13 changes the contract.
VG | low | src/components/NewsletterForm.tsx:n/a | The section and the form both use aria-labelledby="newsletter-title", so two landmarks share one name.
VG | low | src/components/HomeEditorial.test.tsx:n/a | The /Name/, /Email/, /Nombre/ and /Correo/ label queries are loose and rely on the " *" suffix.
VG | low | src/components/HomeEditorial.test.tsx:n/a | No test checks that the success message clears when the user edits again.
VG | low | src/components/NewsletterForm.tsx:n/a | Until S13 ships the endpoint 404s, so the form always shows the error state, and tests mock fetch only.
AA | low | _bmad-output/implementation-artifacts/spec-1-12-s12-newsletter-signup-testimonials-and-resources-sections.md:n/a | The spec's "314 passed" and clean-build claims are unverified in the diff, and its `done` status conflicts with sprint-status `review`.
AA | low | src/components/NewsletterForm.tsx:n/a | The server has no proof of consent, which may conflict with S13 (policies), although the spec documents this as intentional.
AA | low | src/components/NewsletterForm.tsx:n/a | The success branch does not check the response type, so a non-JSON or opaque 200 counts as success.
AA | low | src/components/ResourceCards.tsx:n/a | The resource cards are unlinked articles, which matches the spec notes.
AA | low | src/components/NewsletterForm.tsx:n/a | The "*" required marker is hard-coded outside next-intl.
AA | low | src/components/Testimonials.tsx:n/a | The curly quote marks are hard-coded outside next-intl.
AA | low | messages/en.json:n/a | The consent copy mentions a privacy policy that is neither linked nor created.

## TRIAGE

1. defer: Real a11y improvement, but not in the spec and it affects no AC. Fix it together with the other form a11y items.
2. defer: The spec says the endpoint is S13 and the form shows the error state until then. The error-code handling belongs to S13.
3. defer: The spec says consent is client-side only. Server-side recording and the policy link belong to S13 (policies).
4. defer: Server-side protection belongs to S13.
5. reject: Each id is used once per page, and the sections render once.
6. patch: Adding `required` and `aria-required` is cheap and the "*" is otherwise meaningless to screen readers. `noValidate` is fine, but the fields need to be announced as required.
7. defer: Focus management on error is an a11y nicety outside the spec.
8. reject: The red-500 border sits alongside red text and an error message, so it is not the sole cue.
9. patch: Clearing the status on edit is a small change that fixes the stale banner.
10. defer: The lenient regex is a deliberate trade-off, and the server validates in S13.
11. reject: The test inputs are valid for their purpose, and the exact-limit coverage is nitpicking.
12. decision-needed: Fabricated testimonials are a product and legal call. They need a "sample" label or real content.
13. reject: This matches the spec notes (non-linked articles), and the content is intentional.
14. defer: Extra test coverage, and the double-submit guard is low risk.
15. reject: A style nitpick about test file organization.
16. patch: The spec and sprint status should agree. This is a metadata fix only.
17. reject: This is process noise and does not affect the code.
18. defer: A timeout or AbortController is robustness work that fits with the S13 integration.
19. defer: Duplicate handling depends on the S13 API contract.
20. defer: Duplicate of finding 7.
21. patch: Same fix as item 9, since it is the same stale-state defect.
22. defer: Duplicate of finding 1.
23. defer: Duplicate of finding 10.
24. defer: Duplicate of finding 3, and the spec documents it.
25. reject: Typographic quote marks are not translatable copy, and the spec's i18n constraint targets user-facing strings.
26. defer: Duplicate of finding 14.
27. reject: Duplicate of finding 16.
28. reject: Same as finding 25. The claim is fine in practice.
29. defer: Low-risk static composition, so a Home page test can be added later.
30. defer: The test deliberately pins the current contract and gets updated in S13.
31. reject: Both are named by the same title, so the landmark is not a real issue.
32. reject: The loose queries pass and carry no real risk.
33. defer: Duplicate of finding 14.
34. defer: Duplicate of finding 2, and expected until S13.
35. reject: Duplicate of finding 16.
36. defer: Duplicate of finding 3, and the spec documents it.
37. reject: A non-JSON 200 is hypothetical, because the success path never reads the body.
38. reject: Duplicate of finding 13, and it matches the spec.
39. reject: Duplicate of finding 25.
40. reject: Duplicate of finding 25.
41. defer: Duplicate of finding 3.

The list above has 41 lines. The `RAISED` section has 40 lines, so the `TRIAGE` numbering is off by one from item 25 onward. In `TRIAGE`, items 18–26 correspond to the Edge Case Hunter findings and items 27–32 to the Verification Gap findings, shifted by one. `RAISED` is the authoritative list.

FINDINGS_TOTAL: 40