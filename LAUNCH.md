# PathCross launch checklist

## 1. Code → GitHub
1. Create an empty repo (e.g. `pathcross`) on GitHub.
2. `git add -A && git commit -m "Initial frame" && git remote add origin <url> && git push -u origin main`

## 2. Host on Vercel (free Hobby tier is fine)
1. vercel.com → Add New Project → import the GitHub repo. Framework auto-detects Next.js.
2. Deploy. You get a `*.vercel.app` URL to confirm it works.

## 3. Connect joinpathcross.com (Squarespace Domains)
1. Vercel → Project → Settings → Domains → add `joinpathcross.com` and `www.joinpathcross.com`. Vercel shows the exact DNS records to use.
2. Squarespace → Domains → joinpathcross.com → DNS Settings → Custom Records:
   - `A` record, host `@`, value shown by Vercel (typically `76.76.21.21`)
   - `CNAME` record, host `www`, value shown by Vercel (typically `cname.vercel-dns.com`)
3. Delete any conflicting default Squarespace `A`/`CNAME` records for `@` and `www`.
4. Wait for propagation (minutes to a few hours); Vercel issues HTTPS automatically.
   (Use the values Vercel displays — they override the typical ones above.)

## 4. Supabase (database + event import)
1. supabase.com → new project (region: West US / North California).
2. Apply the database setup: run `supabase db push --remote` from this folder (after `supabase login` and `supabase link --project-ref <ref>`), or, without the CLI, paste each file in `supabase/migrations/` in date order into SQL Editor → New query → Run. Expect "Success. No rows returned".
3. Project Settings → API Keys: copy the Project URL (base address only, no `/rest/v1/`), the anon/publishable key and the service_role/secret key.
4. Put them in a local `.env.local`, and in Vercel → Settings → Environment Variables (all environments):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never prefix with `NEXT_PUBLIC_`)
   - `CRON_SECRET` (random string: `openssl rand -hex 32`)
   - `EVENTBRITE_TOKEN` (optional; only for Eventbrite organizations you are authorized on)
5. Redeploy after adding env vars so they take effect.

## 5. Event import
- Feeds are listed in `src/lib/ingest/sources.ts`. Add a source there to import it.
- `vercel.json` runs `/api/cron/ingest` daily (14:00 UTC, 4 AM Honolulu). Vercel sends `CRON_SECRET` automatically.
- Run it by hand (locally or on the deployed site):
  `curl -H "Authorization: Bearer $CRON_SECRET" https://joinpathcross.com/api/cron/ingest`
  The JSON reply shows inserted / updated / removed counts per source.
- Check Vercel → Project → Cron Jobs after the first deploy to confirm the schedule is registered.
- Edit `category` or `featured` in the Supabase Table Editor to curate; imports will not overwrite those two columns.
