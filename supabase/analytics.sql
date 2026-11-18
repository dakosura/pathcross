-- PathCross Ops analytics. Run once in the Supabase SQL editor (safe to re-run).
--
-- Privacy by design: no IP address, user agent or cookie id is stored. A visitor
-- is a one-way hash that changes every day, so the site can count people in a
-- day without being able to follow anyone across days.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null default 'view' check (kind in ('view', 'outbound')),
  path text not null check (char_length(path) <= 300),
  referrer text,            -- site the visitor came from (host only); null = direct
  source text,              -- utm_source, e.g. "instagram"
  medium text,              -- utm_medium
  campaign text,            -- utm_campaign
  country text,             -- two-letter code from the hosting network
  device text check (device in ('desktop', 'mobile', 'tablet')),
  browser text,
  visitor text not null,    -- daily-rotating anonymous hash
  target text               -- for kind = 'outbound': the site that was clicked through to
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);

-- Row security on with no policies: nothing can read or write this table
-- except the server, using the service-role key.
alter table public.page_views enable row level security;

create or replace function public.ops_summary(p_since timestamptz, p_tz text default 'Pacific/Honolulu')
returns jsonb
language sql
stable
as $$
  with v as (
    select kind, path, referrer, source, medium, campaign, country, device, browser, visitor, target, created_at,
           (created_at at time zone p_tz)::date as day
    from public.page_views
    where created_at >= p_since
  ),
  pv as (select * from v where kind = 'view'),
  ob as (select * from v where kind = 'outbound')
  select jsonb_build_object(
    'views', (select count(*) from pv),
    'visitors', (select count(distinct (visitor, day)) from pv),
    'today_views', (select count(*) from pv where day = (now() at time zone p_tz)::date),
    'today_visitors', (select count(distinct visitor) from pv where day = (now() at time zone p_tz)::date),
    'active_now', (select count(distinct visitor) from public.page_views where kind = 'view' and created_at >= now() - interval '5 minutes'),
    'outbound_clicks', (select count(*) from ob),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'views', n, 'visitors', u) order by day)
                       from (select day, count(*) n, count(distinct visitor) u from pv group by day) d), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', n, 'visitors', u) order by n desc)
                       from (select path, count(*) n, count(distinct (visitor, day)) u from pv group by path order by n desc limit 15) x), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'visitors', n) order by n desc)
                           from (select coalesce(referrer, 'Direct') as name, count(distinct (visitor, day)) n from pv group by 1 order by n desc limit 12) x), '[]'::jsonb),
    'campaigns', coalesce((select jsonb_agg(jsonb_build_object('source', source, 'medium', medium, 'campaign', campaign, 'visitors', n) order by n desc)
                           from (select source, medium, campaign, count(distinct (visitor, day)) n from pv where source is not null group by 1, 2, 3 order by n desc limit 12) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'visitors', n) order by n desc)
                           from (select coalesce(country, 'Unknown') as name, count(distinct (visitor, day)) n from pv group by 1 order by n desc limit 10) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'visitors', n) order by n desc)
                         from (select coalesce(device, 'unknown') as name, count(distinct (visitor, day)) n from pv group by 1 order by n desc) x), '[]'::jsonb),
    'browsers', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'visitors', n) order by n desc)
                          from (select coalesce(browser, 'Other') as name, count(distinct (visitor, day)) n from pv group by 1 order by n desc limit 6) x), '[]'::jsonb),
    'outbound', coalesce((select jsonb_agg(jsonb_build_object('target', target, 'path', path, 'clicks', n) order by n desc)
                          from (select target, path, count(*) n from ob group by 1, 2 order by n desc limit 15) x), '[]'::jsonb),
    'saved_total', (select count(*) from public.network_items),
    'saved_top', coalesce((select jsonb_agg(jsonb_build_object('kind', kind, 'id', item_id, 'saves', n) order by n desc)
                           from (select kind, item_id, count(*) n from public.network_items group by 1, 2 order by n desc limit 10) x), '[]'::jsonb)
  );
$$;

-- Only the server (service role) may call it.
revoke all on function public.ops_summary(timestamptz, text) from public, anon, authenticated;
grant execute on function public.ops_summary(timestamptz, text) to service_role;
