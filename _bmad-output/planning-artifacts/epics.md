# Epics and Stories: Victoria Ordoñez Real Estate Platform

## Epic 1: Victoria Ordoñez Real Estate Platform

### Story 1.1: S01 - Schema and migrations for agents, listings, listing_images, leads with RLS and seed data
**Description:** Define database tables and migrations for agents, listings (with `published_at`, `open_house_at`), listing_images, and leads in Supabase Postgres. Implement Row Level Security (RLS) policies allowing public read of published listings and agent-only management. Provide seed data with at least 12 realistic listings in Cali (Granada, Ciudad Jardín, El Peñón, Pance, San Antonio, Santa Teresita) with original content.
**Acceptance Criteria:**
- Given local Supabase, when migrations are applied, tables `agents`, `listings`, `listing_images`, and `leads` exist with appropriate types and foreign keys.
- Given public unauthenticated users, they can only SELECT listings where `published_at IS NOT NULL` and `published_at <= NOW()`.
- Given `supabase/seed.sql`, running seed populates >= 12 listings across varied neighborhoods in Cali.

### Story 1.2: S02 - Image storage bucket and policies with listing image upload and ordering
**Description:** Configure Supabase Storage bucket `listing-images` with public read access and authenticated upload/delete policies. Support image ordering (`position` or `display_order`) for property galleries.
**Acceptance Criteria:**
- Storage bucket `listing-images` is created with RLS policies allowing public GET and authenticated write.
- Table `listing_images` supports ordering via a numeric sort column (`position`).

### Story 1.3: S03 - GET /api/listings with filters, sorting and pagination
**Description:** Implement `GET /api/listings` endpoint supporting filters (operation: sale/rent, neighborhood, price min/max, bedrooms, bathrooms, property_type), sorting (price_asc, price_desc, newest), and pagination (page, limit).
**Acceptance Criteria:**
- Calling `GET /api/listings` returns JSON with listings array, total count, page, and limit.
- Query parameters filter published listings accurately.
- Invalid filter parameters return appropriate 400 Bad Request responses.

### Story 1.4: S04 - GET /api/listings/[slug]
**Description:** Implement `GET /api/listings/[slug]` endpoint to retrieve a single published listing by unique slug, including its ordered images and agent information.
**Acceptance Criteria:**
- Calling `GET /api/listings/[slug]` returns 200 with full listing details and ordered image gallery.
- Querying a nonexistent or unpublished slug as a public user returns 404 Not Found.

### Story 1.5: S05 - POST /api/leads contact-the-agent form
**Description:** Implement `POST /api/leads` endpoint to capture buyer/renter inquiries from property detail and contact forms (name, email, phone, message, listing_id optional).
**Acceptance Criteria:**
- Calling `POST /api/leads` with valid payload inserts lead record into database and returns 201 Created.
- Missing required fields (name, email) return 400 Bad Request with descriptive validation errors.

### Story 1.6: S06 - Authenticated agent CRUD for listings, publish and unpublish
**Description:** Implement agent API endpoints to create, update, delete, and toggle publish status (`published_at`) of listings, secured with Supabase Auth session / token verification.
**Acceptance Criteria:**
- Unauthenticated requests to agent listing endpoints return 401 Unauthorized.
- Authenticated agent can create, edit, delete, and publish/unpublish listings.

### Story 1.7: S07 - App layout: header, footer, language switch, responsive nav
**Description:** Build global application layout using `next-intl` (es-CO default, en) with sticky header, responsive navigation drawer, footer with contact details, social links, legal notices, and agent sign-in link.
**Acceptance Criteria:**
- Header displays branding, navigation links, locale switcher (ES/EN), and agent sign-in link.
- Language switcher changes locale seamlessly across message catalogs.
- Responsive mobile drawer opens and closes cleanly.
- Footer displays Victoria Ordoñez contact information, Cali office location, and neighborhood links.

### Story 1.8: S08 - Home hero with search bar, featured listings, services cards
**Description:** Build Home page (`/`) featuring hero section with headline ("Encuentra el espacio que te mueve"), quick property search widget, featured listings grid, 3-step advisory process, and services cards (Buy, Sell, Rent).
**Acceptance Criteria:**
- Hero section renders headline and quick search bar navigating to `/search` with parameters.
- Featured listings section displays prominent listing cards.
- 3-step process and 3 services cards render with bilingual strings.

### Story 1.9: S09 - ListingCard and results grid with filters panel
**Description:** Build `/search` page featuring filter sidebar/panel (operation, neighborhood, price range, bedrooms, bathrooms, property type) and results grid with `ListingCard` components.
**Acceptance Criteria:**
- Filters update search query and reload results dynamically.
- `ListingCard` renders property image, price in COP, bedrooms, bathrooms, area m², neighborhood badge.
- Empty search results show a clear fallback message.

### Story 1.10: S10 - Listing detail page: gallery, facts, open-house countdown, contact form
**Description:** Build `/listings/[slug]` detail page featuring responsive image gallery, key property facts (area, rooms, HOA fee, estrato), narrative description, open house countdown (when scheduled), and interactive contact form submitting to leads API.
**Acceptance Criteria:**
- Page renders complete property information and photo gallery.
- Open house banner renders countdown when `open_house_at` is in the future.
- Lead contact form validates input and submits inquiry with success feedback.

### Story 1.11: S11 - Map/list toggle on /search
**Description:** Implement Map vs List/Grid view toggle on the `/search` page, enabling visitors to switch between grid layout and split view with interactive map pins and preview cards.
**Acceptance Criteria:**
- Toggle control switches between Grid view and Map/List split view.
- Map view displays interactive property pins corresponding to current filtered listings.

### Story 1.12: S12 - Newsletter signup, testimonials and resources sections
**Description:** Add testimonials section, 3 market insight/resource cards, and newsletter signup form to the website.
**Acceptance Criteria:**
- Testimonials component renders client reviews.
- 3 resource/blog preview cards render with Cali real estate tips.
- Newsletter signup form captures email with validation and success confirmation.

### Story 1.13: S13 - Newsletter subscribers table and policies
**Description:** Create database table `newsletter_subscribers` with RLS policies and API endpoint `POST /api/newsletter` to record subscriber emails and prevent duplicates.
**Acceptance Criteria:**
- Migration creates `newsletter_subscribers` table with unique email constraint and timestamp.
- `POST /api/newsletter` accepts valid email, prevents duplicates gracefully, and returns 201/200.

### Story 1.14: S14 - Agent dashboard: listings table and create/edit form
**Description:** Build authenticated agent portal `/dashboard` displaying listings table with publish status badges, and an intuitive create/edit form with image upload and publish/unpublish toggle.
**Acceptance Criteria:**
- Protected dashboard route redirects unauthenticated visitors to login.
- Listings table displays title, neighborhood, price, status (Published/Draft), and action buttons.
- Create/Edit form allows full listing management including publish status toggle.

## Epic 2: Victoria Ordoñez Miami Ultra-Luxury Real Estate Pivot

### Story 2.1: S15 - Miami luxury database schema, USD pricing and seed data
**Description:** Migrate schema and seed data to support Miami ultra-luxury residences: USD pricing (`price_usd`), HOA/condo fees (`hoa_fee_usd`), square footage (`area_sqft` with `area_m2` equivalent), and 14 flagship Miami luxury listings including Aston Martin Residences, Porsche Design Tower, Una Residences, 87 Park, One Thousand Museum, Continuum South Beach, and Fisher Island estates.
**Acceptance Criteria:**
- Database migration adds USD pricing and HOA fee columns with backwards compatibility.
- Seed data contains 14 authentic Miami luxury developments with accurate coordinates, descriptions, and USD price brackets ($1.5M - $35M+).
- Public listings API routes return USD price values and Miami neighborhood filters.

### Story 2.2: S16 - Miami and Biscayne Bay interactive projection map
**Description:** Adapt Web Mercator map projection and bounds to South Florida / Miami coastline (Brickell, Downtown Miami, Biscayne Bay, Miami Beach, Sunny Isles Beach, Coconut Grove, Coral Gables). Format interactive price pin badges in millions of USD (e.g., `$3.85M`, `$12.5M`).
**Acceptance Criteria:**
- Map viewport correctly bounds Miami luxury corridor without projection distortion.
- Price pins render formatted USD millions and select listing cards on click.
- Filter synchronization preserves map bounds and active view mode.

### Story 2.3: S17 - Miami luxury brand identity, hero, editorial and bilingual catalogs
**Description:** Update bilingual message catalogs (`es.json`, `en.json`) and UI components for Victoria Ordoñez as an elite Miami Luxury & Waterfront Real Estate Advisor. Update hero search, featured properties showcase (Aston Martin Residences, Porsche Design Tower, Una Residences), market advisory guides (FIRPTA, Florida tax advantages), and Brickell office contact details.
**Acceptance Criteria:**
- Hero section and meta tags reflect Miami luxury positioning and neighborhood selectors.
- Featured listings highlight signature waterfront towers with USD pricing and sq ft.
- Testimonials and market insight cards feature Miami/South Florida luxury real estate topics.
- 100% key parity maintained between `es` and `en` next-intl catalogs.

### Story 2.4: S18 - Agent dashboard and listing forms for Miami luxury properties
**Description:** Update agent dashboard table and listing create/edit forms for USD pricing, HOA/condo fees, square footage, luxury property categories (Penthouse, Waterfront Residence, Island Estate, Sky Villa), and Miami neighborhood selections.
**Acceptance Criteria:**
- Agent listings table renders formatted USD currency and Miami neighborhoods.
- Create/Edit form validates USD prices, HOA fees, sq ft/m², and Miami luxury locations.
- Mutations (publish/unpublish, edit, delete) succeed through authenticated agent API.

### Story 2.5: S19 - Ultra-Luxury Cinematic UX/UI & Architectural Hero (Inspired by FindRealEstate)
**Description:** Elevate the platform UX/UI to premier luxury standards inspired by FindRealEstate.com: floating minimalist navigation with pill buttons, cinematic architectural penthouse hero with ethereal cloud atmosphere, bold modern display typography with subtle translucency, floating glassmorphic search bar with backdrop blur, and listing cards with smooth hover zoom micro-interactions, translucent status badges, and crisp USD price hierarchy.
**Acceptance Criteria:**
- Floating minimalist navigation header with rounded pill button for agent portal.
- Hero section featuring high-end architectural imagery, monumental modern typography, and pill CTA button.
- Glassmorphic floating search bar with backdrop blur and responsive inputs.
- Listing cards feature smooth image zoom-in on hover, glassmorphic badges, and high-contrast USD formatting.
- All existing tests pass, and Next.js production build succeeds with 0 errors.


