-- ============================================================
-- Wanderplan - Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Note: Create buckets via Supabase UI or API first.
-- The following SQL is for RLS policies once buckets exist.

-- trip-covers
-- destination-images
-- accommodation-images
-- activity-images
-- user-documents

-- TRIPS
create table public.trips (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  destinations text[] not null default '{}',
  start_date  text not null,
  end_date    text not null,
  status      text not null default 'planning',
  description text,
  budget      text,
  cover_image text, -- Stores path in storage instead of base64
  created_at  text not null,
  updated_at  text not null
);
alter table public.trips enable row level security;
create policy "Users can manage their own trips"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DESTINATIONS
create table public.destinations (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    bigint references public.trips(id) on delete cascade not null,
  name       text not null,
  country    text not null,
  image      text, -- Stores path in storage instead of base64
  notes      text,
  "order"    integer,
  created_at text not null
);
alter table public.destinations enable row level security;
create policy "Users can manage their own destinations"
  on public.destinations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- FLIGHTS
create table public.flights (
  id           bigserial primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  trip_id      bigint references public.trips(id) on delete cascade not null,
  description  text,
  country      text,
  segments     jsonb not null default '[]',
  price        numeric not null default 0,
  currency     text not null default 'USD',
  booking_link text,
  notes        text,
  is_confirmed boolean not null default false,
  created_at   text not null
);
alter table public.flights enable row level security;
create policy "Users can manage their own flights"
  on public.flights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ACCOMMODATIONS
create table public.accommodations (
  id               bigserial primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  trip_id          bigint references public.trips(id) on delete cascade not null,
  name             text not null,
  country          text,
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
  image            text, -- Stores path in storage instead of base64
  is_confirmed     boolean not null default false,
  created_at       text not null
);
alter table public.accommodations enable row level security;
create policy "Users can manage their own accommodations"
  on public.accommodations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ACTIVITIES
create table public.activities (
  id             bigserial primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  trip_id        bigint references public.trips(id) on delete cascade not null,
  destination_id bigint references public.destinations(id) on delete set null,
  name           text not null,
  date           text not null,
  country        text,
  type           text,
  link           text,
  notes          text,
  duration       integer,
  cost           numeric,
  currency       text not null default 'USD',
  image          text, -- Stores path in storage instead of base64
  is_confirmed   boolean not null default false,
  "order"        integer not null default 0,
  created_at     text not null
);
alter table public.activities enable row level security;
create policy "Users can manage their own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- NOTES
create table public.notes (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    bigint references public.trips(id) on delete cascade not null,
  content    text not null default '',
  updated_at text not null
);
alter table public.notes enable row level security;
create policy "Users can manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DOCUMENTS
create table public.documents (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  trip_id     bigint references public.trips(id) on delete cascade not null,
  name        text not null,
  description text,
  type        text not null,
  file        text not null, -- Stores path in storage instead of base64
  created_at  text not null
);
alter table public.documents enable row level security;
create policy "Users can manage their own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- STORAGE RLS POLICIES (Assuming buckets are created)
-- Run these after buckets are created in the UI:
-- insert into storage.buckets (id, name, public) values ('trip-covers', 'trip-covers', true);
-- insert into storage.buckets (id, name, public) values ('destination-images', 'destination-images', true);
-- insert into storage.buckets (id, name, public) values ('accommodation-images', 'accommodation-images', true);
-- insert into storage.buckets (id, name, public) values ('activity-images', 'activity-images', true);
-- insert into storage.buckets (id, name, public) values ('user-documents', 'user-documents', false);

-- Policy for public buckets:
create policy "Public Select" on storage.objects for select using (bucket_id in ('trip-covers', 'destination-images', 'accommodation-images', 'activity-images'));
create policy "User Manage Objects" on storage.objects for all using (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for private documents:
create policy "User Manage Documents" on storage.objects for all using (bucket_id = 'user-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "User Select Documents" on storage.objects for select using (bucket_id = 'user-documents' and auth.uid()::text = (storage.foldername(name))[1]);

