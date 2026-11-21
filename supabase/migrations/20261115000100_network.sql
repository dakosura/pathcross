-- PathCross "My Network": each signed-in user's saved clubs and events.
-- Run once in the Supabase SQL editor (safe to re-run).
create table if not exists public.network_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('events', 'clubs')),
  item_id text not null check (char_length(item_id) <= 200),
  created_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

alter table public.network_items enable row level security;

-- People can only see and change their own rows.
drop policy if exists "read own network" on public.network_items;
create policy "read own network" on public.network_items
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "add to own network" on public.network_items;
create policy "add to own network" on public.network_items
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "remove from own network" on public.network_items;
create policy "remove from own network" on public.network_items
  for delete to authenticated using ((select auth.uid()) = user_id);
