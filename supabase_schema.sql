-- ============================================================
-- Wanderplan - Relational Supabase Schema (Reset Script)
-- ============================================================

-- Cleanup existing tables (Order matters due to foreign keys)
drop table if exists public.documents;
drop table if exists public.notes;
drop table if exists public.activities;
drop table if exists public.accommodations;
drop table if exists public.flights;
drop table if exists public.destinations;
drop table if exists public.trip_countries;
drop table if exists public.trips;

-- TRIPS
create table public.trips (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  start_date  text not null,
  end_date    text not null,
  status      text not null default 'planning',
  description text,
  budget      text,
  cover_image text,
  created_at  text not null,
  updated_at  text not null
);
alter table public.trips enable row level security;
create policy "Users can manage their own trips" on public.trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TRIP COUNTRIES (The new central table)
create table public.trip_countries (
  id           bigserial primary key,
  trip_id      bigint references public.trips(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  country_name text not null,
  country_code text not null,
  budget_limit numeric default 0,
  notes        text,
  "order"      integer default 0,
  created_at   text not null
);
alter table public.trip_countries enable row level security;
create policy "Users can manage their own trip_countries" on public.trip_countries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DESTINATIONS (Linked to Trip Country)
create table public.destinations (
  id               bigserial primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  trip_id          bigint references public.trips(id) on delete cascade not null,
  trip_country_id  bigint references public.trip_countries(id) on delete cascade not null,
  city_lookup_id   numeric references public.city_lookup(id) on delete set null,
  name             text not null,
  image            text,
  notes            text,
  "order"          integer,
  created_at       text not null
);
alter table public.destinations enable row level security;
create policy "Users can manage their own destinations" on public.destinations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FLIGHTS (Linked to Trip Country)
create table public.flights (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  trip_id         bigint references public.trips(id) on delete cascade not null,
  trip_country_id bigint references public.trip_countries(id) on delete set null,
  description     text,
  segments        jsonb not null default '[]',
  price           numeric not null default 0,
  currency        text not null default 'USD',
  booking_link    text,
  notes           text,
  is_confirmed    boolean not null default false,
  created_at      text not null
);
alter table public.flights enable row level security;
create policy "Users can manage their own flights" on public.flights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ACCOMMODATIONS (Linked to Trip Country)
create table public.accommodations (
  id               bigserial primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  trip_id          bigint references public.trips(id) on delete cascade not null,
  trip_country_id  bigint references public.trip_countries(id) on delete set null,
  destination_id   bigint references public.destinations(id) on delete set null,
  name             text not null,
  type             text not null default 'hotel',
  platform         text,
  location         text not null,
  check_in         text not null,
  check_out        text not null,
  check_in_after   text,
  check_out_before text,
  price            numeric not null default 0,
  currency         text not null default 'USD',
  booking_link     text,
  notes            text,
  image            text,
  is_confirmed     boolean not null default false,
  created_at       text not null
);
alter table public.accommodations enable row level security;
create policy "Users can manage their own accommodations" on public.accommodations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ACTIVITIES (Linked to Trip Country)
create table public.activities (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  trip_id         bigint references public.trips(id) on delete cascade not null,
  trip_country_id bigint references public.trip_countries(id) on delete set null,
  destination_id  bigint references public.destinations(id) on delete set null,
  name            text not null,
  date            text not null,
  type            text,
  link            text,
  notes           text,
  duration        integer,
  cost            numeric,
  currency        text not null default 'USD',
  image           text,
  is_confirmed    boolean not null default false,
  "order"         integer not null default 0,
  created_at      text not null
);
alter table public.activities enable row level security;
create policy "Users can manage their own activities" on public.activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTES
create table public.notes (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    bigint references public.trips(id) on delete cascade not null,
  content    text not null default '',
  updated_at text not null
);
alter table public.notes enable row level security;
create policy "Users can manage their own notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DOCUMENTS
create table public.documents (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  trip_id     bigint references public.trips(id) on delete cascade not null,
  name        text not null,
  description text,
  type        text not null,
  file        text not null,
  created_at  text not null
);
alter table public.documents enable row level security;
create policy "Users can manage their own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- STATIC REFERENCE TABLES (Run only once, do not reset)
-- ============================================================
-- CITY LOOKUP (World Cities Database)
-- create table public.city_lookup (
--   id          numeric primary key,
--   city        text,
--   city_ascii  text,
--   lat         numeric,
--   lng         numeric,
--   country     text,
--   iso2        text,
--   iso3        text,
--   admin_name  text,
--   capital     text,
--   population  numeric
-- );
-- alter table public.city_lookup enable row level security;
-- create policy "Anyone can read city_lookup" on public.city_lookup for select using (true);
