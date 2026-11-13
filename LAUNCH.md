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

## 4. Supabase (when real data is ready)
1. supabase.com → new project → create `events` table matching `src/types/index.ts`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → Settings → Environment Variables (and a local `.env.local`).
3. Replace the functions in `src/lib/data.ts` with Supabase queries.
4. Enable Row Level Security with a public read-only policy on `events`.
