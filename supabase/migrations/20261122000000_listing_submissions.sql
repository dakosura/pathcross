-- Listing requests: clubs, events and networks that people ask to have listed on PathCross
-- (the /submit form). Only the server can read or write this table, using the service-role key,
-- so the site owner sees requests on /ops and nobody else can.
create table if not exists public.listing_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'reviewing', 'listed', 'declined')),
  kind text not null check (kind in ('event', 'group', 'program', 'other')),
  name text not null check (char_length(name) <= 160),
  organizer text not null check (char_length(organizer) <= 160),
  interest text not null check (char_length(interest) <= 40),
  description text not null check (char_length(description) <= 1500),
  event_date date,
  start_time text check (start_time is null or start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  end_time text check (end_time is null or end_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  repeats text check (repeats is null or char_length(repeats) <= 200),
  venue text check (venue is null or char_length(venue) <= 200),
  address text check (address is null or char_length(address) <= 300),
  price text check (price is null or char_length(price) <= 200),
  website text not null check (char_length(website) <= 400),
  social text check (social is null or char_length(social) <= 400),
  join_info text check (join_info is null or char_length(join_info) <= 800),
  extra text check (extra is null or char_length(extra) <= 1500),
  contact_name text not null check (char_length(contact_name) <= 160),
  contact_email text not null check (char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 60),
  ip_hash text,   -- daily-rotating anonymous hash, used only to limit repeat submissions
  notes text      -- the owner's own notes
);

create index if not exists listing_submissions_created_idx on public.listing_submissions (created_at desc);

-- Row security on with no policies: nothing but the server's service-role key can touch it.
alter table public.listing_submissions enable row level security;
