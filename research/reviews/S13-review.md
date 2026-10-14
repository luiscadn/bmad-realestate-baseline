# Code Review Findings: Story S13 (Newsletter subscribers table and policies)

I reviewed commit 1d773d6 and found one real bug, which I fixed. The newsletter and API tests pass (29), and `tsc --noEmit` printed no errors. I did not run the full test suite or apply the migration to a database.

I ran all four review passes myself rather than launching sub-agents. The spec I reviewed against is `spec-1-13-s13-newsletter-subscribers-table-and-policies.md`.

**Fixed**
- **Control characters in the email gave a 500.** The email regex doesn't reject characters like NUL, so `a\u0000@b.co` reached Postgres, which refused it and returned a 500. `parseNewsletterBody` in `src/lib/newsletter.ts` now rejects control characters in the email with a 400. I added a test for it in `src/lib/newsletter.test.ts`.

**Open decision for you**
- **Response bodies differ from the spec table.** The spec's I/O matrix calls for `{ok:true,message}`, `{ok:true,status:"already_subscribed"}` and `{error:"Invalid email"}`. The code returns `{data:{subscribed:true}}` for both new and duplicate subscribers, matching `/api/leads`, and its 400 body is `{error:"Invalid newsletter payload", errors}`. The acceptance criteria only mention status codes, and those match (201, 200, 400). I left this alone, so tell me if you want the bodies to follow the spec.

**Deferred, not patched**
- **Subscriber probing and no rate limit.** The spec requires 200 for a duplicate and 201 for a new subscriber, so anyone can check whether an email is already subscribed. There is also no rate limiting, so the table could be flooded.
- **Lowercasing mismatch.** The API lowercases with JS `toLowerCase()` and the database check uses SQL `lower()`. Some non-ASCII emails could be lowercased differently, fail the check constraint and return a 500. This is rare.
- **No consent recorded.** The S12 form asks for consent, but nothing stores it.

**Checked and fine**
- **Duplicates:** a unique-violation (`23505`) returns 200, and the insert has no `.select()` or upsert, which RLS would block.
- **Row-level security:** anonymous and authenticated users can insert, only agents can read, and there is no update or delete policy.
- **SQL injection:** the insert is parameterised through supabase-js.
- **Errors:** the 500 response doesn't leak details, and only the error code and message are logged.
- **Name handling:** the name is sanitised and length-checked.

I haven't committed the fix. The two changed files are `src/lib/newsletter.ts` and `src/lib/newsletter.test.ts`.
