-- PathCross events table. Run in the Supabase SQL editor.
create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null default '',
  date date not null,
  start_time text not null,
  end_time text not null,
  venue text not null default '',
  city text not null default 'Honolulu',
  address text,
  organizer text not null default '',
  source_url text not null,
  registration_url text,
  price text,
  note text,
  category text not null default 'General Professional'
    check (category in ('Finance','Tech','General Professional','Startup')),
  featured boolean not null default false,
  placeholder boolean not null default false,
  lat double precision,
  lng double precision,
  -- ingestion bookkeeping
  source text,                -- e.g. "meetup:honolulu-tech-network"
  external_id text,
  status text not null default 'active' check (status in ('active','removed')),
  last_seen timestamptz not null default now()
);
create index if not exists events_date_idx on public.events (date) where status = 'active';

alter table public.events enable row level security;
-- Public read-only. Writes happen only with the service-role key (bypasses RLS).
drop policy if exists "public read active events" on public.events;
create policy "public read active events" on public.events
  for select using (status = 'active');
