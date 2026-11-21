-- PathCross: allow the new event categories (Real Estate, Food & Drink, Sports) in the events table.
-- Run once in the Supabase SQL editor (safe to re-run). Until it is run, imported events in the
-- new categories are skipped at import time; everything else keeps working. Finance events are
-- unaffected.
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.events'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.events drop constraint %I', c);
  end loop;
end $$;

alter table public.events add constraint events_category_check check (category in (
  'Finance', 'Tech', 'General Professional', 'Startup', 'Community', 'Fitness', 'Volunteer',
  'Real Estate', 'Food & Drink', 'Sports'
));
