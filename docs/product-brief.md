# Product Brief: Victoria Ordoñez Real Estate Platform

## 1. Client & Market Context
- **Client**: Victoria Ordoñez, independent professional real estate agent.
- **Location**: Cali, Valle del Cauca, Colombia (covering premium and emerging neighborhoods such as Granada, El Peñón, Ciudad Jardín, San Antonio, Pance, Santa Teresita, Chipichape, and Valle del Lili).
- **Primary Audience**: Local buyers, sellers, and renters in Cali, as well as Colombian diaspora and international investors seeking properties in south-western Colombia.
- **Default Locale**: `es-CO` (Spanish - Colombia).
- **Secondary Locale**: `en` (English).

## 2. Core Value Proposition
A modern, trustworthy, high-performance real estate digital showcase that elevates Victoria Ordoñez's boutique agency brand. Visitors can effortlessly explore curated property listings, filter by specific criteria, inspect immersive details and open house schedules, and initiate direct inquiries. The agent enjoys a streamlined management dashboard to administer listings, manage publication statuses, and capture qualified leads.

## 3. Scope & Key Pages
1. **Header & Navigation**:
   - Agency branding / logo ("Victoria Ordoñez - Bienes Raíces").
   - Navigation links: Search (`/search`), Neighborhoods (`/neighborhoods`), About / Agent (`/about`), Contact (`/contact`).
   - Locale switcher (`ES` / `EN`).
   - Agent Sign-In link (`/dashboard` / `/login`).
   - Mobile responsive drawer navigation.

2. **Home Page (`/`)**:
   - **Hero Section**: High-impact banner with inspirational headline ("Encuentra el espacio que te mueve" / "Find what moves you") and quick search widget (operation type, neighborhood/city, property type, price range).
   - **Featured Properties Grid**: Highlights of select high-priority listings.
   - **Three-Step Process**:
     1. Asesoría Personalizada (Talk to the agent).
     2. Claridad y Diagnóstico (Clarify needs and evaluate options).
     3. Cierre y Acompañamiento (Move forward and close smoothly).
   - **Services Section**: Interactive cards for Comprar (Buy), Vender (Sell), and Arrendar (Rent).
   - **Testimonials**: Verbatim satisfaction quotes from verified buyers and sellers in Cali.
   - **Resources / Insights**: 3 informative articles on market trends and investment tips in Cali.
   - **Newsletter Signup**: Dedicated email capture for weekly market reports and exclusive private listings.
   - **Footer**: Agency contact numbers, WhatsApp link, physical address in Cali, professional social media, legal / privacy terms, and curated neighborhood quick links.

3. **Search Page (`/search`)**:
   - Comprehensive filter bar: Operation (Venta / Arriendo), Neighborhood/Sector, Price min/max, Bedrooms, Bathrooms, Property Type (Apartamento, Casa, Penthouse, Lote, Oficina).
   - View toggle: Grid view vs. Interactive Map / List toggle.
   - Dynamic results grid with responsive `ListingCard` items displaying key metrics (price in COP/USD equivalent, sqm, beds, baths, neighborhood, badges).
   - Pagination and sort controls (price ascending/descending, date published).

4. **Listing Detail Page (`/listings/[slug]`)**:
   - High-resolution photo gallery / image slider.
   - Essential property facts: Price, area (m²), bedrooms, bathrooms, parking spots, HOA (administración), year built.
   - Narrative property description.
   - Open House schedule and countdown banner (when scheduled).
   - Direct lead inquiry form (Name, email, phone, custom message, preferred contact method).

5. **Neighborhoods Guide (`/neighborhoods`)**:
   - Overview of Cali's top sectors (Granada, Ciudad Jardín, El Peñón, Pance, San Antonio, Santa Teresita) with lifestyle notes and active listings count.

6. **About Page (`/about`)**:
   - Victoria Ordoñez professional biography, track record, certifications, and service philosophy.

7. **Contact Page (`/contact`)**:
   - Direct messaging form, phone, WhatsApp direct link, email, and office location in Cali.

8. **Agent Management Dashboard (`/dashboard`)**:
   - Authenticated portal for Victoria Ordoñez.
   - Listings data table: title, price, status (Draft, Published), open house date, actions.
   - Listing CRUD interface: create new listing, update metadata, manage photos/order, publish/unpublish.
   - Leads overview: incoming inquiries from listing and contact forms.

## 4. Technical Architecture
- **Framework**: Next.js App Router (TypeScript, React 19).
- **Styling**: Tailwind CSS.
- **Internationalization**: `next-intl` (all user-visible strings managed in message catalogs `es-CO` and `en`).
- **Database & Backend**: Supabase (PostgreSQL with Row Level Security, Auth, Storage).
- **Quality & Verification**: Vitest unit/integration testing suite, Playwright smoke end-to-end flow.
