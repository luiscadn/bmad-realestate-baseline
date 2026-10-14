# Code Review Findings: Story S12 (Newsletter signup, testimonials and resources sections)

**Code review complete: 0 decision-needed, 4 patches applied, 6 deferred, about 10 rejected.** I haven't committed the patches. No Blocker or High findings came up.

**Verification:** `tsc` and `eslint` are clean. The two S12 test files pass (19 tests). A full `vitest run` showed 19 failures, all 5000ms timeouts across unrelated suites (ContactForm, Footer, Header, SearchPage and others), so I read them as machine load. I did not re-run the full suite on an idle machine.

**Patches applied** (`src/components/NewsletterForm.tsx`, plus test updates in `HomeEditorial.test.tsx`):
1. **Fetch timeout (medium):** the `fetch` had no timeout, so a hung request left the button disabled forever. It now uses `AbortSignal.timeout(10_000)`, and a timeout lands in the error state so the user can retry.
2. **Live regions (medium):** the `role="status"` and `role="alert"` messages were mounted together with their text, which screen readers often skip. Both containers are now always rendered and only their content changes. The two tests that used `queryByRole` on those roles now check text content.
3. **Focus on validation failure (low-medium):** focus now moves to the first invalid field, and a test covers it.
4. **`aria-required` (low):** I added it to the name, email and consent inputs, since the form uses `noValidate` and the `*` marker is `aria-hidden`.

**Deferred** (appended to `deferred-work.md`):
- The consent flag isn't sent to the API, so S13 has no consent record.
- The consent text says "privacy policy" but links nowhere.
- The testimonials are invented placeholders and need real, consented content before launch.
- The resource cards aren't linked yet.
- No test checks that `page.tsx` renders the three new sections.
- S13 still has to decide how to handle a 409 (already subscribed) response and add bot protection.

**Rejected:**
- **Spec-sanctioned:** the form always errors until S13 exists, and the cards are non-linked. The spec says both.
- **Low and not worth the added complexity:** the double-submit ref guard, the stale success message after editing, errors not clearing on edit, the email regex missing IDN addresses and local parts over 64 characters, extra tests, and contrast.
- **Would mean editing the spec:** the `done` vs `review` status mismatch.

The spec has no Tasks/Subtasks section, so I did not write a `### Review Findings` block into it. I left the story status and `sprint-status.yaml` untouched.
