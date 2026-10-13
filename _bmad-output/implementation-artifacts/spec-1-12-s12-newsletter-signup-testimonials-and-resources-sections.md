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
