# PathCross

PathCross helps people find networking events, clubs and groups in Honolulu. Every event is rated 1 to 5 stars for meeting people and matched to the visitor's profession and goals. Live at https://www.joinpathcross.com.

## Stack
- Next.js (App Router) + React + Tailwind CSS, deployed on Vercel
- Supabase for the database and email sign-in
- MapLibre for maps

## Main pages (`src/app`)
| Route | Purpose |
|---|---|
| `/` | Home: hero, Top 10, upcoming events |
| `/events`, `/calendar` | Event browser and calendar |
| `/top-10` | Auto-ranked best events |
| `/clubs` | Clubs directory |
| `/my-network` | Signed-in map and calendar of saved events |
| `/about` | How it works and how ratings are calculated |
| `/privacy`, `/terms` | Legal pages (facts live in `src/lib/site.ts`) |
| `/ops` | Visitor analytics, restricted to `OPS_ADMIN_EMAILS` |

Other code: components in `src/components`, data and rating logic in `src/lib`, event importers in `src/lib/ingest`, database SQL in `supabase/`.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```
Open http://localhost:3000.

See `LAUNCH.md` for hosting, domain, Supabase and event-import setup, and `CLAUDE.md` for notes for AI-assisted editing.
