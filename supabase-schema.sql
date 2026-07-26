-- Artispreneur Directory — Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the contacts table

-- Enable full-text search extension
create extension if not exists pg_trgm;

-- Contacts table
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null, -- radio, blog, venue, playlist, podcast, record_label, magazine, press, newspaper, distributor, publisher, licensing_library
  location    text,
  description text,
  website     text,
  email       text,
  phone       text,
  genre       text,
  country     text,
  state       text,
  city        text,
  social_ig   text,
  social_tw   text,
  verified    boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Indexes for fast filtering + search
create index if not exists idx_contacts_type      on public.contacts (type);
create index if not exists idx_contacts_country   on public.contacts (country);
create index if not exists idx_contacts_state     on public.contacts (state);
create index if not exists idx_contacts_name_trgm on public.contacts using gin (name gin_trgm_ops);
create index if not exists idx_contacts_desc_trgm on public.contacts using gin (description gin_trgm_ops);
create index if not exists idx_contacts_loc_trgm  on public.contacts using gin (location gin_trgm_ops);

-- Row Level Security — public read, service-role write
alter table public.contacts enable row level security;

create policy "Public read access"
  on public.contacts for select
  using (true);

create policy "Service role insert"
  on public.contacts for insert
  with check (auth.role() = 'service_role');

create policy "Service role update"
  on public.contacts for update
  using (auth.role() = 'service_role');

-- Helper function to get counts by type (used by stats endpoint)
create or replace function get_type_counts()
returns table (type text, count bigint)
language sql
security definer
as $$
  select type, count(*) as count
  from public.contacts
  group by type
  order by count desc;
$$;

-- Updated_at trigger
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger contacts_updated_at
  before update on public.contacts
  for each row execute function handle_updated_at();
