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


## 6. Avance de investigación — 14 de octubre de 2026

La condición de control de E1 es `baseline-v0^{commit}` (`4c9f927`), con S01–S14. El desarrollo posterior S15–S19 y el pivote comercial a Miami quedan fuera de ese corpus. El contenido de `main` puede incluir ese desarrollo posterior: para reproducir el control se debe usar el tag, sin moverlo.

El [paquete de avance](docs/avance-2-2026-10-14/) contiene el estado del arte revisado, mapa de calor, Gantt, E1 preliminar, E4 revisado, reproducibilidad, riesgos, plan de calidad y 12 diapositivas. El anteproyecto completo actualizado queda en el paquete local de revisión y en Jira. Estos archivos no acreditan entrega institucional ni aprobación del tutor.

Se incorporan sin edición los archivos de `research/protocol-b/` de `origin/e1-protocol-b` (`f8977b6`). El inventario tiene **517 ocurrencias de candidatos**, con 517 decisiones enlazadas: 121 patch, 132 defer, 21 decision-needed y 243 reject. No son defectos únicos confirmados. S12 tiene 41 filas frente a 40 declaradas. S14 tiene un segundo intento archivado etiquetado Gemini (34 ocurrencias) y se reporta aparte del subconjunto Claude S01–S13 (483). Los 175 enunciados de A son resúmenes heterogéneos, no un inventario exhaustivo comparable con B.

La clasificación ISO inicial es una ayuda que requiere validación humana. La primera evaluación aún no está congelada y la segunda evaluación ciega de 30 casos está pendiente; **kappa no se ha calculado**. La clave de la muestra y la evaluación inicial para revisar permanecen en el paquete local. Santiago debe utilizar únicamente el archivo de evaluación ciega hasta entregar su clasificación. Los criterios de E2 publicados son una propuesta; sus asociaciones no miden detección. El paquete original `bmad-dod` y sus 29 pruebas no se localizaron y no se certifican.

### Reproducir el inventario y la demostración ATDD

Se requiere Python 3.11+ sin dependencias adicionales para estos dos scripts. Los tags y la referencia remota de origen deben estar disponibles:

```bash
git fetch origin --tags
git fetch origin e1-protocol-b:refs/remotes/origin/e1-protocol-b
python3 research/avance2/analyze_e1.py --out /tmp/pdg-e1-reproduction
python3 -m unittest discover -s research/avance2 -p 'test_*.py' -v
```

El análisis genera un borrador y la clave de muestra; el segundo evaluador debe abstenerse de consultar esos archivos antes de entregar sus respuestas. Las ocho pruebas del ejemplo de acuerdo se escribieron y ejecutaron en rojo en `6c2d238`, antes de implementar. Las mismas ocho pasan en la implementación posterior. Esta demostración manual no acredita ejecución bajo el skill perdido.

La utilidad de acuerdo se ejecuta, una vez congelada la primera clasificación humana, con dos CSV que contengan los mismos `sample_id`:

```bash
python3 research/avance2/compute_agreement.py \
  --first evaluador1.csv --second evaluador2.csv \
  --first-validated --out acuerdo.json
```

La opción `--first-validated` declara una validación que debe documentarse; el programa no puede verificar independencia ni cegamiento. Sin todos los pares completos no emite un coeficiente final (salida 2).

La reproducibilidad del control registró 381 pruebas y una compilación de producción correctas, además de HTTP 200 en `/` y `/en`. No se arrancó una base Supabase aislada: RLS, autenticación y mutaciones reales quedan pendientes de una comprobación de integración. Las evidencias y sus límites están en [Informe_reproducibilidad.pdf](docs/avance-2-2026-10-14/Informe_reproducibilidad.pdf).
