-- Seed data: demo agent and realistic listings in Cali, Colombia. All content is original.
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
);

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"agent@victoriaordonez.test"}',
  now(), now(), now()
);

insert into public.agents (id, full_name, email, phone, bio) values (
  '11111111-1111-1111-1111-111111111111',
  'Victoria Ordoñez',
  'agent@victoriaordonez.test',
  '+57 315 000 0000',
  'Real estate advisor in Cali with a focus on the city''s western and southern neighborhoods.'
);

insert into public.listings (
  agent_id, slug, title, description, operation, property_type, price_cop,
  bedrooms, bathrooms, parking_spots, area_m2, neighborhood, address,
  latitude, longitude, featured, published_at, open_house_at
) values
('11111111-1111-1111-1111-111111111111', 'apartamento-luminoso-granada', 'Bright apartment steps from Granada''s restaurants',
 'Corner unit on a high floor with cross ventilation, an open kitchen and a balcony facing the western hills. Walk to the Avenida Sexta dining strip.',
 'sale', 'apartment', 520000000, 2, 2, 1, 86.50, 'Granada', 'Avenida 9N con Calle 15N', 3.4583, -76.5336, true,
 now() - interval '20 days', now() + interval '5 days'),
('11111111-1111-1111-1111-111111111111', 'casa-remodelada-ciudad-jardin', 'Remodeled family house in Ciudad Jardín',
 'Two-story house with a private garden, covered terrace and a flexible studio. Quiet street close to schools and clubs.',
 'sale', 'house', 1350000000, 4, 4, 2, 280.00, 'Ciudad Jardín', 'Carrera 98 con Calle 18', 3.3612, -76.5367, true,
 now() - interval '15 days', now() + interval '9 days'),
('11111111-1111-1111-1111-111111111111', 'penthouse-vista-el-penon', 'Penthouse with a view over the Cali river in El Peñón',
 'Duplex penthouse with a wraparound terrace, double-height living room and sunset views. Building has a pool and 24-hour concierge.',
 'sale', 'penthouse', 1980000000, 3, 4, 2, 210.00, 'El Peñón', 'Avenida Colombia con Carrera 1', 3.4535, -76.5421, true,
 now() - interval '10 days', now() + interval '3 days'),
('11111111-1111-1111-1111-111111111111', 'casa-campestre-pance', 'Country house with pool in Pance',
 'Single-level house on a 1,200 m² lot inside a gated community. Large social area, pool, barbecue and green surroundings.',
 'sale', 'house', 2450000000, 5, 5, 4, 420.00, 'Pance', 'Km 4 vía Pance', 3.3150, -76.5700, true,
 now() - interval '30 days', null),
('11111111-1111-1111-1111-111111111111', 'apartaestudio-san-antonio', 'Studio apartment in historic San Antonio',
 'Renovated studio with high ceilings, a small terrace and walking access to the chapel plaza, cafés and galleries.',
 'rent', 'apartment', 2100000, 1, 1, 0, 42.00, 'San Antonio', 'Calle 2 Oeste con Carrera 9', 3.4510, -76.5400, false,
 now() - interval '8 days', null),
('11111111-1111-1111-1111-111111111111', 'apartamento-familiar-santa-teresita', 'Family apartment in Santa Teresita with views',
 'Three bedrooms, study nook and a wide balcony. Building with green areas, playground and gym.',
 'rent', 'apartment', 4800000, 3, 3, 2, 135.00, 'Santa Teresita', 'Carrera 4 Oeste con Calle 4', 3.4560, -76.5470, false,
 now() - interval '12 days', now() + interval '14 days'),
('11111111-1111-1111-1111-111111111111', 'apartamento-moderno-granada-renta', 'Modern one-bedroom for rent in Granada',
 'Fully equipped one-bedroom with laminate floors, washer-dryer and building coworking space.',
 'rent', 'apartment', 3200000, 1, 1, 1, 58.00, 'Granada', 'Calle 17N con Avenida 6N', 3.4600, -76.5290, false,
 now() - interval '6 days', null),
('11111111-1111-1111-1111-111111111111', 'casa-esquinera-ciudad-jardin-renta', 'Corner house for rent in Ciudad Jardín',
 'Spacious house with front garden, maid''s quarters and room for two cars. Ideal for a family or a small clinic.',
 'rent', 'house', 7500000, 4, 3, 2, 240.00, 'Ciudad Jardín', 'Carrera 100 con Calle 16', 3.3590, -76.5340, false,
 now() - interval '18 days', null),
('11111111-1111-1111-1111-111111111111', 'apartamento-con-balcon-el-penon', 'Two-bedroom with balcony in El Peñón',
 'Renovated apartment in a boutique building near Parque del Perro and the river path. Natural light all day.',
 'sale', 'apartment', 640000000, 2, 2, 1, 95.00, 'El Peñón', 'Calle 2 Oeste con Carrera 4', 3.4520, -76.5435, false,
 now() - interval '4 days', now() + interval '7 days'),
('11111111-1111-1111-1111-111111111111', 'lote-residencial-pance', 'Residential lot in Pance with mountain views',
 'Flat 900 m² lot in a gated community with utilities at the boundary, ready to build.',
 'sale', 'land', 780000000, 0, 0, 0, 900.00, 'Pance', 'Vía Pance, parcelación Los Cámbulos', 3.3100, -76.5750, false,
 now() - interval '25 days', null),
('11111111-1111-1111-1111-111111111111', 'townhouse-santa-teresita', 'Townhouse in a small gated complex in Santa Teresita',
 'Three-level townhouse with rooftop terrace, private parking and 24-hour security in a complex of only eight homes.',
 'sale', 'townhouse', 1150000000, 3, 4, 2, 180.00, 'Santa Teresita', 'Carrera 3 Oeste con Calle 5', 3.4550, -76.5485, false,
 now() - interval '2 days', null),
('11111111-1111-1111-1111-111111111111', 'oficina-boutique-san-antonio', 'Boutique office in San Antonio',
 'Open-plan office in a restored house with a patio, meeting room and kitchenette. Great for creative studios.',
 'rent', 'office', 5200000, 0, 2, 1, 110.00, 'San Antonio', 'Carrera 10 Oeste con Calle 1', 3.4500, -76.5410, false,
 now() - interval '9 days', null),
-- Not visible to the public: a draft and a listing scheduled for the future.
('11111111-1111-1111-1111-111111111111', 'borrador-apartamento-granada', 'Draft: apartment in Granada (unpublished)',
 'Draft listing used to verify that unpublished listings stay hidden from the public.',
 'sale', 'apartment', 450000000, 2, 2, 1, 78.00, 'Granada', null, null, null, false,
 null, null),
('11111111-1111-1111-1111-111111111111', 'programado-casa-pance', 'Scheduled: house in Pance (publishes later)',
 'Scheduled listing used to verify that future published_at values stay hidden.',
 'sale', 'house', 1700000000, 4, 3, 2, 300.00, 'Pance', null, null, null, false,
 now() + interval '30 days', null);

-- Three ordered placeholder images per listing.
insert into public.listing_images (listing_id, url, alt_text, position)
select l.id,
       'https://picsum.photos/seed/' || l.slug || '-' || n || '/1200/800',
       l.title || ' - photo ' || n,
       n - 1
from public.listings l
cross join generate_series(1, 3) as n;
