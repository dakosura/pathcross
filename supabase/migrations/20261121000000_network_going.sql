-- PathCross "I'm going": lets a signed-in person mark an event in My Network as one
-- they are attending. Run once in the Supabase SQL editor (safe to re-run).
-- Until it is run, the site keeps working; "I'm going" just can't be saved.
alter table public.network_items add column if not exists going boolean not null default false;

-- Allow people to update their own rows (needed to switch "going" on and off).
drop policy if exists "update own network" on public.network_items;
create policy "update own network" on public.network_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
