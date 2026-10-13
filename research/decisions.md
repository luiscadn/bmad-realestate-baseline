# Research Decisions Log

This document records every deviation, ambiguity, failure, or noteworthy operational decision made during the study, along with timestamp and rationale.

| Timestamp (ISO) | Category | Description & Rationale |
|---|---|---|
| 2026-10-13T12:02:00-05:00 | INIT | Baseline initialization started with bmad-method@6.12.2 and claude-code@2.1.296. Preflight passed. |
| 2026-10-13T12:28:30-05:00 | SCAFFOLD | Next 15 with React 19 selected to satisfy peer dependency of next-intl@3.26.5 without breaking peer tree. |
| 2026-10-13T12:37:30-05:00 | PLANNING | bmad-sprint-planning generated sprint-status.yaml covering 14 stories in 1 unified epic. Readiness gate passed with forward-dependency advisory notes. |
| 2026-10-13T12:42:00-05:00 | S01-REVIEW | Code review completed for S01 with 4 findings (1 High, 2 Medium, 1 Low). Applied Low severity patch fixing `search_path` on `set_updated_at` trigger. Recorded verbatim. |
| 2026-10-13T12:48:00-05:00 | S02-REVIEW | Code review completed for S02 with 8 findings (2 decision-needed, 4 patches, 2 deferred, 4 rejected). 4 patches applied to `listing-images.ts` and test suite. Position tie-breaking accepted as-is; public storage bucket policy accepted. Recorded verbatim. |
| 2026-10-13T12:54:00-05:00 | S03-REVIEW | Code review completed for S03 with 6 findings (0 decision-needed, 1 patch, 1 deferred, 4 rejected). 1 patch applied capping `bedrooms` and `bathrooms` at `MAX_SMALLINT` (32767) to prevent Postgres out-of-range errors. Recorded verbatim. |
