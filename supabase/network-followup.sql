-- PathCross follow-ups: "I went", a private note per event, and rating feedback.
-- Run once in the Supabase SQL editor (safe to re-run). Run supabase/network-going.sql first.
-- Until it is run the site keeps working; these new buttons just can't save.

-- 1) Attended flag and a private note on each My Network event.
--    Only the signed-in owner can read these rows (existing row-level security).
alter table public.network_items add column if not exists attended boolean not null default false;
alter table public.network_items add column if not exists note text;
alter table public.network_items drop constraint if exists network_items_note_len;
alter table public.network_items add constraint network_items_note_len check (note is null or char_length(note) <= 2000);

-- 2) "Was the networking rating accurate?" One answer per person per event.
create table if not exists public.rating_feedback (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null check (char_length(event_id) <= 200),
  answer text not null check (answer in ('too_high', 'about_right', 'too_low')),
  stars_shown smallint check (stars_shown between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.rating_feedback enable row level security;

drop policy if exists "read own feedback" on public.rating_feedback;
create policy "read own feedback" on public.rating_feedback
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "add own feedback" on public.rating_feedback;
create policy "add own feedback" on public.rating_feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "change own feedback" on public.rating_feedback;
create policy "change own feedback" on public.rating_feedback
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- To see how the ratings are holding up (run in the SQL editor any time):
--   select event_id, count(*) as answers,
--          count(*) filter (where answer = 'too_high')    as too_high,
--          count(*) filter (where answer = 'about_right') as about_right,
--          count(*) filter (where answer = 'too_low')     as too_low
--   from public.rating_feedback group by event_id order by answers desc;
