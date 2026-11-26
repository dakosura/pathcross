-- Clubs added from the Ops page quick-add tool (a link to a group or club's page).
-- The hand-researched clubs stay in code (src/lib/clubs.ts); the site shows both lists together.
-- Only the server (service-role key) can read or write this table; the site reads it through
-- src/lib/clubs-all.ts and falls back to the code list if the table is missing.
create table if not exists public.clubs (
  id text primary key,
  created_at timestamptz not null default now(),
  source text not null default 'manual',
  status text not null default 'active' check (status in ('active', 'hidden')),
  name text not null check (char_length(name) between 1 and 200),
  interest text not null check (interest in ('professional','realestate','food','sports','fitness','golf','social','boating','volunteer')),
  blurb text not null check (char_length(blurb) <= 1500),
  url text check (url is null or char_length(url) <= 500),
  area text not null default 'Honolulu' check (char_length(area) <= 120),
  address text check (address is null or char_length(address) <= 300),
  membership text check (membership is null or char_length(membership) <= 1500),
  phone text check (phone is null or char_length(phone) <= 60),
  facilities text[],
  lat double precision,
  lng double precision
);

create index if not exists clubs_url_idx on public.clubs (url);
create index if not exists clubs_name_lower_idx on public.clubs (lower(name));

-- Row security on with no policies: nothing but the server's service-role key can touch it.
alter table public.clubs enable row level security;
