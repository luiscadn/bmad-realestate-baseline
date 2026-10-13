# Design & Layout Reference Guide

This document specifies the verbal design system, visual structure, typography, and page-by-page layout hierarchy for the Victoria Ordoñez Real Estate Platform, modeled structurally after premier real estate portals (e.g. FindRealEstate) while featuring original aesthetics tailored for Cali, Colombia.

---

## 1. Design Language & Visual System

- **Color Palette**:
  - *Primary / Brand*: Deep Emerald Slate (`#0F2922` / `slate-900` with subtle forest undertone) conveying stability, luxury, and regional warmth.
  - *Accent / Warm Gold*: Warm Ochre / Brushed Gold (`#D4AF37` / `#C59B27`) used sparingly for featured tags, interactive highlights, and call-to-actions.
  - *Neutrals & Backgrounds*: Crisp Off-White / Warm Alabaster (`#FBFBF9`), Light Slate (`#F1F5F9`), Cool Gray Borders (`#E2E8F0`).
  - *Text*: Charcoal Black (`#0F172A`) for headings, Muted Charcoal (`#475569`) for body, Pale Slate (`#94A3B8`) for secondary meta.
- **Typography**:
  - Headings: Elegant sans-serif / geometric serif hybrid feel (clean modern grotesk, tracking tight).
  - Body & Data: Crisp, highly legible sans-serif with tabular figures for currency and area metrics.
- **Elevation & Surfaces**:
  - Subtle borders (`1px solid slate-200`) with soft, diffused shadows (`shadow-sm`, `shadow-md` on hover).
  - Rounded radii: `rounded-xl` for cards, `rounded-full` for search pills and tags.

---

## 2. Global Component Layouts

### Header
- Fixed / sticky top navigation with backdrop blur on scroll.
- **Left**: Agency Logotype ("VICTORIA ORDOÑEZ" in bold uppercase, subtitle "Bienes Raíces • Cali").
- **Center**: Navigation Links:
  - Propiedades / Search
  - Sectores / Neighborhoods
  - Sobre Victoria / About
  - Contacto / Contact
- **Right Action Bar**:
  - Language Switcher dropdown/toggle pill: `[ES | EN]`
  - Agent Portal button: Key icon / "Ingreso Agente" (links to `/login` or `/dashboard`)
  - Mobile hamburger toggle opening a smooth side drawer navigation.

### Footer
- High-contrast dark background (`slate-900`) with warm off-white text.
- **Column 1**: Agency identity, Victoria Ordoñez portrait thumbnail/logo, bio blurb, legal license / NIT info.
- **Column 2 (Propiedades y Sectores)**: Fast links to top sectors (Granada, Ciudad Jardín, El Peñón, Pance, San Antonio, Santa Teresita) and operation types (Venta, Arriendo).
- **Column 3 (Navegación)**: Search, About, Process, Blog / Resources, Contact.
- **Column 4 (Contacto Directo)**: Phone numbers, direct WhatsApp chat link, office address in Cali (e.g., Av. 4A Norte, Granada, Cali), email address.
- **Bottom Bar**: Copyright, privacy policy, terms of service, and Colombian consumer protection compliance note.

---

## 3. Page Layout Specifications

### Home Page (`/`)
1. **Hero Section**:
   - Full-width immersive container with dark gradient overlay over an architectural photography placeholder.
   - Large central headline: "Encuentra el espacio que te mueve" / "Find what moves you".
   - Sub-headline: "Propiedades exclusivas y asesoría inmobiliaria personalizada en los mejores sectores de Cali."
   - **Floating Quick Search Bar**:
     - Horizontal segmented pill widget on desktop (stacked card on mobile):
       - Dropdown 1: Operación (Comprar / Arrendar).
       - Dropdown 2: Sector / Barrio (Todos, Granada, Ciudad Jardín, Pance, El Peñón...).
       - Dropdown 3: Tipo de Inmueble (Apartamento, Casa, Penthouse...).
       - Search Action Button: Warm gold / emerald with magnifying glass, navigating to `/search?query...`.

2. **Featured Listings Section ("Propiedades Destacadas")**:
   - Section header with title and "Ver todas las propiedades ->" link.
   - 3-column responsive grid of `ListingCard` components.
   - Each card displays:
     - Featured photo with aspect ratio 16:10.
     - Badge overlays: "En Venta" / "En Arriendo", and "Open House" indicator when active.
     - Price tag in Colombian Pesos (COP) with formatted currency and secondary USD reference.
     - Property Title and Sector (e.g. "Penthouse con Terraza Panorámica - El Peñón").
     - Key metrics bar: Beds icon + count, Baths icon + count, Area icon + m², Parking spaces.

3. **Three-Step Advisory Process ("Nuestro Proceso")**:
   - Three horizontal step cards explaining the client journey:
     - Step 01: *Conversación Inicial* — Escuchamos tus aspiraciones, presupuesto y estilo de vida.
     - Step 02: *Curaduría & Diagnóstico* — Filtramos las opciones idóneas y organizamos visitas privadas.
     - Step 03: *Negociación & Cierre* — Acompañamiento legal, notarial y financiero hasta la entrega de llaves.

4. **Services Cards ("Servicios Especializados")**:
   - 3 distinct elevated cards:
     - *Comprar*: Asesoría experta para encontrar tu hogar ideal o inversión de alta rentabilidad.
     - *Vender*: Avalúo comercial, estrategia de marketing digital y fotografía profesional para vender al mejor precio.
     - *Arrendar*: Gestión de contratos seguros y selección calificada de arrendatarios.

5. **Client Testimonials ("Historias de Clientes")**:
   - Carousel or 3-column card block featuring authentic feedback from Cali families and investors praising Victoria's attention to detail, punctuality, and negotiation acumen.

6. **Market Insights / Blog ("Recursos y Guías del Mercado")**:
   - 3 editorial cards highlighting guides (e.g., "Guía para invertir en el sur de Cali", "Cómo preparar tu propiedad para una venta rápida", "San Antonio vs Granada: Estilos de vida").

7. **Newsletter Signup ("Boletín Inmobiliario Exclusivo")**:
   - Warm-tinted banner section: "Sé el primero en enterarte de nuevas propiedades en Cali antes de que salgan al mercado público."
   - Inline input form: Email input, name input, and "Suscribirme" button with privacy consent checkbox.

---

### Search & Listings Catalog Page (`/search`)
1. **Top Filter Controls Bar**:
   - Sticky or prominent filter panel:
     - Type selector: Comprar / Arrendar.
     - Neighborhood selector multi/single dropdown.
     - Property type dropdown (Casa, Apartamento, Penthouse...).
     - Price range slider or Min/Max inputs.
     - Bedrooms (1+, 2+, 3+, 4+) pill selector.
     - Bathrooms (1+, 2+, 3+) pill selector.
     - Clear Filters and Apply Filters buttons.
2. **View & Sort Controls**:
   - Results count: "Mostrando X propiedades en Cali".
   - Sort dropdown: Precio (Menor a Mayor), Precio (Mayor a Menor), Más recientes.
   - Layout Switcher: Grid View button vs. Map/List Split View toggle.
3. **Results Area**:
   - **Grid Mode**: 3-column (desktop) / 2-column (tablet) / 1-column (mobile) grid of `ListingCard` items with pagination controls at the bottom.
   - **Map Mode**: Split-screen view (50% left scrollable listing cards, 50% right interactive map view featuring interactive property pins with popup preview cards).

---

### Listing Detail Page (`/listings/[slug]`)
1. **Breadcrumbs & Header Bar**:
   - `Inicio > Propiedades > El Peñón > Penthouse Panorámico`.
   - Title, address/sector, price banner, and status badges.
2. **Photo Gallery**:
   - Prominent hero image with mosaic grid of 4 secondary photos and a "Ver todas las fotos (N)" interactive modal trigger.
3. **Two-Column Main Content**:
   - **Left Column (70% width)**:
     - Key Metrics Bar: Area construida (m²), Habitaciones, Baños, Parqueaderos, Estrato, Valor Administración (HOA).
     - Open House Countdown Banner (displayed prominently if `open_house_at` is set, with calendar date, time, and RSVP trigger).
     - Full Description: Detailed architectural highlights, amenities (piscina, vigilancia 24/7, balcón, ascensor privado), and surroundings.
     - Location & Neighborhood preview with embedded map.
   - **Right Column (30% sticky sidebar)**:
     - Contact the Agent Card:
       - Victoria Ordoñez profile photo, license badge, verified agent title.
       - Quick contact buttons: Direct WhatsApp CTA button, Call CTA button.
       - Inquiry Form: Name, Email, Phone number, Pre-filled message ("Hola Victoria, me interesa recibir más información sobre..."), and Submit Inquiry button.

---

### Agent Dashboard (`/dashboard`)
1. **Top Metrics Bar**: Total listings, active published, pending draft, total inquiries received.
2. **Listing Management Table**:
   - Thumbnail, Title, Sector, Price, Publication Status (Published badge in green, Draft in amber), Open House status, Actions (Edit, Publish/Unpublish toggle, Delete).
3. **Listing Creation & Edit Drawer / Page**:
   - Form tabs / sections:
     - Basic Info (Title ES/EN, slug, description, property type, operation, sector/address).
     - Financials & Details (Price COP/USD, admin fee, area m², beds, baths, parkings, estrato).
     - Open House Scheduler (Date, time range, active toggle).
     - Photo Manager (Upload to Supabase storage bucket, drag/order, delete, caption).
     - Publication state (Save Draft / Publish immediately).
4. **Leads / Inquiries Table**:
   - Contact date, inquirer name, email, phone, listing referenced, message, status (New, Contacted).
