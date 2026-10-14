---
title: 'S12 Newsletter signup, testimonials and resources sections'
type: 'feature'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Home page lacks social proof, editorial content and a way to capture newsletter subscribers.

**Approach:** Add `Testimonials`, `ResourceCards` (3 Cali guides) and a client `NewsletterForm` (name, email, consent; validates, POSTs `/api/newsletter`, shows success/error) to Home. All strings via next-intl (es + en, key parity). The `/api/newsletter` endpoint belongs to S13 and is not built here; the form must degrade gracefully when it errors or the network fails.

</frozen-after-approval>

## Implementation Notes

- New: `src/lib/newsletter.ts` (validator), `src/components/Testimonials.tsx`, `ResourceCards.tsx`, `NewsletterForm.tsx`, tests for each; Home page and `messages/{es,en}.json` updated.
- Resource cards are non-linked articles (no guide pages exist yet). Form sends `{name, email}` only; consent is enforced client-side. `/api/newsletter` is S13, so until then the form shows the error state.
- Review: the blind-hunter subagent layer was skipped (no explicit permission to spawn); a self-review found nothing further. tsc, eslint, vitest (314 passed) and `next build` are clean.

### Review Findings

- [x] [Review][Patch] Fetch timeout: added `AbortSignal.timeout(10_000)` to prevent indefinite disabled button on network stall [NewsletterForm.tsx]
- [x] [Review][Patch] Persistent live regions: rendered status and alert containers permanently so screen readers announce changes [NewsletterForm.tsx]
- [x] [Review][Patch] Validation failure focus: auto-focus first invalid input on submit error [NewsletterForm.tsx]
- [x] [Review][Patch] Added `aria-required` to required form inputs with noValidate [NewsletterForm.tsx]
- [x] [Review][Defer] Consent flag not sent to API (S13 record)
- [x] [Review][Defer] Privacy policy text not linked
- [x] [Review][Defer] Real client testimonial copy needed before launch
- [x] [Review][Defer] Resource cards not linked to detail guides
- [x] [Review][Defer] S13 409 handling and bot protection

