-- Seed data: demo agent and luxury listings in Miami, Florida (USA).
-- Local development only: the demo agent can sign in with agent@victoriaordonez.test / password123.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'agent@victoriaordonez.test',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"agent@victoriaordonez.test"}',
  now(), now(), now()
) on conflict (provider_id, provider) do nothing;

insert into public.agents (id, full_name, email, phone, bio) values (
  '11111111-1111-1111-1111-111111111111',
  'Victoria Ordoñez',
  'agent@victoriaordonez.test',
  '+1 (305) 555-0199',
  'Elite Luxury & Waterfront Real Estate Advisor based in Miami, specializing in signature towers such as Aston Martin Residences, Porsche Design Tower, and waterfront estates across Brickell, Miami Beach, and Biscayne Bay.'
) on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  bio = excluded.bio;

insert into public.listings (
  agent_id, slug, title, description, operation, property_type, price_usd, price_cop,
  bedrooms, bathrooms, parking_spots, area_sqft, area_m2, hoa_fee_usd, building_name,
  neighborhood, address, city, latitude, longitude, featured, published_at, open_house_at
) values
('11111111-1111-1111-1111-111111111111', 'aston-martin-residences-triplex-penthouse', 'Signature Triplex Penthouse at Aston Martin Residences',
 'Crown jewel penthouse atop 300 Biscayne Boulevard Way. Features private rooftop pool, sweeping 360-degree views of Biscayne Bay and the Atlantic Ocean, private elevator, Bulthaup bespoke kitchen, and direct superyacht marina slip access.',
 'sale', 'penthouse', 25000000.00, 100000000000, 5, 6, 4, 8900.00, 826.80, 6800.00, 'Aston Martin Residences',
 'Downtown Miami', '300 Biscayne Blvd Way, Penthouse 01', 'Miami', 25.7708, -80.1878, true,
 now() - interval '20 days', now() + interval '5 days'),

('11111111-1111-1111-1111-111111111111', 'aston-martin-residences-bayfront-residence', 'Panoramic Bayfront Residence at Aston Martin Residences',
 'High-floor luxury residence curated with Aston Martin leather door pulls, custom marble flooring, floor-to-ceiling glass, and dual balconies framing the Miami River and Biscayne Bay. Access to 4 full levels of sky amenities.',
 'sale', 'apartment', 4750000.00, 19000000000, 3, 4, 2, 3250.00, 301.90, 2850.00, 'Aston Martin Residences',
 'Downtown Miami', '300 Biscayne Blvd Way, Unit 4502', 'Miami', 25.7709, -80.1877, true,
 now() - interval '15 days', now() + interval '9 days'),

('11111111-1111-1111-1111-111111111111', 'porsche-design-tower-sky-villa', 'Sky Villa with Dezervator Car Elevator at Porsche Design Tower',
 'Ultra-exclusive beachfront residence featuring the patented Dezervator glass car elevator that delivers vehicles directly into an in-unit glass sky garage. Private plunge pool on deep oceanfront balcony.',
 'sale', 'apartment', 8900000.00, 35600000000, 4, 5, 3, 4800.00, 445.90, 4200.00, 'Porsche Design Tower',
 'Sunny Isles Beach', '18555 Collins Ave, Unit 3205', 'Miami', 25.9482, -80.1200, true,
 now() - interval '10 days', now() + interval '3 days'),

('11111111-1111-1111-1111-111111111111', 'una-residences-waterfront-brickell', 'Waterfront Bay Residence with Private Loggia at Una Residences',
 'Nautical-inspired architecture by Adrian Smith + Gordon Gill. Undulating floor-to-ceiling glass curves, flow-through layout with Biscayne Bay views, teak decking, and private boat slips.',
 'sale', 'apartment', 3850000.00, 15400000000, 3, 4, 2, 2650.00, 246.20, 2400.00, 'Una Residences',
 'Brickell', '175 SE 25th Rd, Unit 18B', 'Miami', 25.7535, -80.1985, true,
 now() - interval '30 days', null),

('11111111-1111-1111-1111-111111111111', 'one-thousand-museum-zaha-hadid', 'Half-Floor Exoskeleton Sky Residence at One Thousand Museum',
 'Iconic architecture by Dame Zaha Hadid featuring revolutionary curving glass-fiber exoskeleton. Private rooftop helipad, bank-grade safe, aquatic center, and dual sunrise/sunset terraces overlooking Museum Park.',
 'sale', 'apartment', 11500000.00, 46000000000, 4, 6, 3, 5400.00, 501.70, 5100.00, 'One Thousand Museum',
 'Downtown Miami', '1000 Biscayne Blvd, Unit 3801', 'Miami', 25.7845, -80.1902, true,
 now() - interval '8 days', null),

('11111111-1111-1111-1111-111111111111', 'eighty-seven-park-renzo-piano', 'Oceanfront Flow-Through Residence at 87 Park by Renzo Piano',
 'Coastal sanctuary surrounded by the Atlantic Ocean and 35 acres of protected parkland. Fluid interiors crafted in American oak, Italian stone, and botanical gardens curated by West 8.',
 'sale', 'apartment', 6900000.00, 27600000000, 3, 4, 2, 3400.00, 315.90, 3600.00, '87 Park',
 'Miami Beach', '8701 Collins Ave, Unit 802', 'Miami', 25.8732, -80.1215, true,
 now() - interval '12 days', now() + interval '14 days'),

('11111111-1111-1111-1111-111111111111', 'the-surf-club-four-seasons', 'Four Seasons Oceanfront Residence at The Surf Club',
 'Timeless coastal elegance designed by Richard Meier and Joseph Dirand. Full Four Seasons hotel services, Michelin-starred dining on-site, and 50 feet of direct ocean frontage.',
 'sale', 'apartment', 14200000.00, 56800000000, 4, 5, 3, 5100.00, 473.80, 5900.00, 'The Surf Club Four Seasons',
 'Surfside', '9011 Collins Ave, Unit S-601', 'Miami', 25.8785, -80.1220, true,
 now() - interval '6 days', null),

('11111111-1111-1111-1111-111111111111', 'continuum-south-beach-oceanfront', 'Direct Oceanfront Sanctuary at Continuum South Beach',
 'Situated in South of Fifth (SoFi) on 12 acres of private manicured beachfront. Includes private beach club, three-story wellness pavilion, tennis courts, and panoramic views of Fisher Island and the cruise ship channel.',
 'sale', 'apartment', 7500000.00, 30000000000, 3, 3, 2, 2900.00, 269.40, 3950.00, 'Continuum South Beach',
 'South Beach', '100 S Pointe Dr, Unit 1904', 'Miami', 25.7672, -80.1325, false,
 now() - interval '18 days', null),

('11111111-1111-1111-1111-111111111111', 'palazzo-del-sol-fisher-island', 'Private Island Waterfront Palace at Palazzo Del Sol',
 'Ultra-exclusive Fisher Island residence accessed exclusively via private yacht or ferry. Unrivaled security, private golf course, marina slips for 250-foot vessels, and private beach club.',
 'sale', 'penthouse', 18500000.00, 74000000000, 4, 5, 3, 6200.00, 576.00, 7800.00, 'Palazzo Del Sol',
 'Fisher Island', '7000 Fisher Island Dr, Unit 7041', 'Miami', 25.7610, -80.1415, true,
 now() - interval '4 days', now() + interval '7 days'),

('11111111-1111-1111-1111-111111111111', 'faena-house-oceanfront-aleros', 'Faena House Signature Oceanfront Residence with Aleros Terrace',
 'Designed by Foster + Partners with distinctive wraparound Brazilian lapacho aleros that fuse indoor living with the Atlantic breeze. Membership into the visionary Faena District arts and cultural sphere.',
 'sale', 'apartment', 16000000.00, 64000000000, 4, 5, 3, 4900.00, 455.20, 6200.00, 'Faena House',
 'Miami Beach', '3315 Collins Ave, Unit 10A', 'Miami', 25.8080, -80.1242, false,
 now() - interval '25 days', null),

('11111111-1111-1111-1111-111111111111', 'park-grove-bayfront-tower', 'Lush Bayfront Residence at Park Grove by OMA',
 'Curved bayfront tower by Rem Koolhaas / OMA nestled in Coconut Grove. 5 acres of private Enzo Enea gardens, rooftop infinity pool, wine cellar, and steps from private yacht marinas.',
 'sale', 'apartment', 4200000.00, 16800000000, 3, 4, 2, 2800.00, 260.10, 2600.00, 'Park Grove',
 'Coconut Grove', '2701 S Bayshore Dr, Unit 1403', 'Miami', 25.7315, -80.2360, false,
 now() - interval '2 days', null),

('11111111-1111-1111-1111-111111111111', 'gables-estates-deepwater-villa', 'Modern Waterfront Estate with Private Yacht Dock in Gables Estates',
 'Spectacular deepwater compound on 1.2 manicured acres with 200 feet of water frontage with direct no-bridge access to Biscayne Bay. Features guest house, infinity pool, summer kitchen, and private yacht slip.',
 'sale', 'house', 22000000.00, 88000000000, 6, 7, 5, 9500.00, 882.50, 1200.00, 'Gables Estates',
 'Coral Gables', '125 Arvida Pkwy', 'Miami', 25.6885, -80.2520, true,
 now() - interval '9 days', null),

('11111111-1111-1111-1111-111111111111', 'elysee-miami-edgewater-residence', 'Draft: Panoramic Telescoping Bay Residence at Elysée Miami',
 'Unpublished agent draft used to verify that unpublished properties remain private in the database.',
 'sale', 'apartment', 2950000.00, 11800000000, 3, 4, 2, 2300.00, 213.60, 2100.00, 'Elysée Miami',
 'Edgewater', '700 NE 23rd St, Unit 2102', 'Miami', 25.7995, -80.1872, false,
 null, null),

('11111111-1111-1111-1111-111111111111', 'st-regis-residences-brickell', 'Scheduled: Waterfront Sky Sanctuary at The St. Regis Residences Brickell',
 'Scheduled listing used to verify that future published_at values stay hidden until release date.',
 'sale', 'apartment', 5100000.00, 20400000000, 3, 4, 2, 3100.00, 287.90, 3100.00, 'St. Regis Residences',
 'Brickell', '1809 Brickell Ave, Unit 1902', 'Miami', 25.7570, -80.1965, false,
 now() + interval '30 days', null);

-- Three ordered placeholder images per listing.
insert into public.listing_images (listing_id, url, alt_text, position)
select l.id,
       'https://picsum.photos/seed/' || l.slug || '-' || n || '/1200/800',
       l.title || ' - photo ' || n,
       n - 1
from public.listings l
cross join generate_series(1, 3) as n;
