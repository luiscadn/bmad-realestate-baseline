# Bmad-RealEstate

A modern, high-performance, bilingual (Spanish `es-CO` default, English `en`) real-estate platform built for **Victoria Ordoñez**, an independent luxury real estate agent based in Cali, Colombia.

This repository also serves as the **baseline (control condition)** in an empirical software engineering research study evaluating defect density and software quality characteristics (ISO/IEC 25010) in agent-built software using **Claude Code CLI** and the **BMAD method** (`bmad-method@6.12.2`).

---

## 1. Feature & Architecture Overview

### Public Experience
- **Bilingual Internationalization (`next-intl`)**: Full route-level localization (`/es`, `/en`) with locale persistence, server-side message loading, and SEO-friendly metadata.
- **Hero & Curated Discovery**: Cali-focused hero search with neighborhood filtering (Ciudad Jardín, Granada, El Peñón, Santa Teresita, etc.), property types, and COP price brackets.
- **Dynamic Search & Listings Grid**: Real-time filtering, responsive layout, and listing preview cards with image optimization.
- **Interactive Projection Map**: Dependency-free Web Mercator projection map of Cali with COP price markers, active selection highlights, and popup preview cards.
- **Property Details**: High-resolution gallery, comprehensive property facts (socioeconomic stratum, administration fee, m²), open-house countdown banner, and inline lead contact inquiry form.
- **Editorial & Newsletter**: Testimonials, market guides, and client newsletter subscription with duplicate protection and privacy consent.

### Protected Agent Portal
- **Secure Authentication**: Supabase Auth login (`/login`) with session management, rate-limiting guards, and automatic redirects.
- **Listing Management Dashboard**: Server-guarded `/dashboard` displaying property inventory with quick-toggle publish/unpublish, deletion confirmations, and real-time status feedback.
- **Create & Edit Listing**: Full-featured form validating all property attributes, coordinates, strata, fees, and publishing state.

### Backend & API
- **RESTful Endpoints**:
  - `GET /api/listings`: Public paginated listings with multi-attribute filtering and sorting.
  - `GET /api/listings/[slug]`: Public listing detail endpoint with agent info and ordered media.
  - `POST /api/leads`: Lead generation endpoint with PII sanitization and payload limits.
  - `POST /api/newsletter`: Newsletter subscription endpoint with idempotent duplicate handling.
  - `GET`, `POST /api/agent/listings`: Authenticated listing retrieval and creation.
  - `PUT`, `DELETE /api/agent/listings/[id]`: Authenticated listing mutation and deletion with agent ownership enforcement.
- **Database & Storage (Supabase / PostgreSQL)**:
  - Row-Level Security (RLS) policies enforcing public read-only access on published records and authenticated write access.
  - Automated `set_updated_at` triggers with explicit `search_path` security hardening.
  - Dedicated Supabase Storage bucket (`listing-images`) with access control and image reordering.

---

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Localization**: `next-intl` (v3.26+)
- **Styling**: Tailwind CSS v4
- **Database, Auth & Storage**: Supabase (PostgreSQL 15+, Supabase Auth, Storage)
- **Testing**: Vitest 3, React Testing Library, JSDOM (381 unit and integration tests)
- **Agent Orchestration**: BMAD Method (`bmad-method@6.12.2`) via Claude Code CLI (`2.1.296`)

---

## 3. Getting Started

### Prerequisites
- Node.js >= 20.x
- Docker (for local Supabase instance)
- Supabase CLI (`npm install -g supabase` or `npx supabase`)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Bmad-RealEstate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` or create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

4. **Start Supabase & Apply Migrations:**
   ```bash
   npx supabase start
   ```
   Migrations applied:
   - `20261013000000_init_schema.sql` (Tables: `agents`, `listings`, `listing_images`, RLS, seed data)
   - `20261013000100_storage_listing_images.sql` (Storage bucket & policies)
   - `20261013000200_listing_stratum_admin_fee.sql` (Stratum & admin fee columns)
   - `20261013000300_newsletter_subscribers.sql` (Newsletter subscribers table & policies)

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application is available at `http://localhost:3000`.

---

## 4. Testing & Verification

Run the full automated test suite:
```bash
npm test
```
*Current test suite: 45 test suites, 381 tests passing.*

Run production build validation:
```bash
npm run build
```

---

## 5. Research Provenance & Protocol

This repository represents the **Control Condition (Baseline)** for an academic study on software quality characteristics in AI-generated software.

### Baseline Governance Rules
1. **Zero Extra Governance**: No custom Definition-of-Done checklists, no TEA module, no git pre-commit hooks, and no blocking CI gates were used during implementation.
2. **Method Pinned**: Pinned to `bmad-method@6.12.2` and Claude Code `2.1.296`.
3. **Autonomous Execution**: All code generation and review operations were executed via fresh headless Claude Code sessions (`claude -p`).

### Git Tag Cadence
For each story `Sxx` (S01 through S14), the git history strictly adheres to the research protocol:
- `Sxx-start`: Branch creation off `main`.
- `Sxx-pre-review`: State immediately after `bmad-build` execution before review.
- `Sxx-post-review`: State after adversarial `bmad-code-review` triage and patch application.
- Merged via `--no-ff` into `main`.

### Research Artifacts
- **Verbatim Review Reports**: Preserved under `research/reviews/Sxx-review.md`.
- **Review Patch Diffs**: Captured under `research/reviews/Sxx-patches.diff`.
- **Run Telemetry**: Recorded with timestamps, durations, and commit hashes in `research/run-log.jsonl`.
- **Decision Audit Trail**: Cataloged in `research/decisions.md`.
