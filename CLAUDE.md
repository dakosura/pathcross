# Notes for Claude sessions on PathCross

Read `README.md` first for what the site is and where things live.

## Read this before writing Next.js code
This project uses a newer Next.js than your training data (see `AGENTS.md`). Check `node_modules/next/dist/docs/` before using Next.js APIs. If `node_modules` is missing, run `npm install` first.

## Who you are working with
The owner is a non-technical founder, often editing from a phone. Explain changes in plain language, keep edits small and focused, and describe what changed and how to see it.

## Workflow
- Work on a branch and open a pull request. Do not push straight to `main` unless asked.
- `main` deploys automatically to the live site (Vercel). Each pull request gets a Vercel preview link.
- Before finishing, run `npm run lint` and `npm run build`. Report failures honestly.

## Common edits
- Site name, tagline, contact email: `src/lib/site.ts`
- Page text: the matching file in `src/app/<page>/page.tsx`
- Shared pieces (header, footer, cards): `src/components`
- Event sources to import: `src/lib/ingest/sources.ts`
- Clubs: `src/lib/clubs.ts`; weekly events: `src/lib/weekly-events.ts`
- If legal wording changes, also update `policiesUpdated` in `src/lib/site.ts`.

## Secrets and data (important)
- Never commit `.env*` files or paste keys into code. `.env.example` lists the variable names only.
- Real keys exist only on the owner's Mac and in Vercel. Cloud sessions usually have none, so Supabase-backed features (sign-in, saved events, imports, `/ops`) cannot be run or tested there. Say so instead of guessing.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only; never prefix it with `NEXT_PUBLIC_`.
- Schema changes are migrations: add a new file `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql` (idempotent SQL, never edit an applied one). On the owner's Mac the Supabase CLI is logged in and the project is linked, so apply with `supabase db push --remote` (preview first with `--dry-run`; real pushes need `SUPABASE_YES=1`). Read-only checks: `supabase db query --remote --read-only "<sql>"`. Always ask the owner before pushing to production and say what the SQL does. Cloud sessions have no CLI login: describe the migration in the PR and have the owner (or a Mac session) push it.
- Event `category` and `featured` are curated by hand in Supabase; imports must not overwrite them.

## Privacy
The site has a cookie banner and a privacy-friendly visit counter. Do not add third-party trackers or collect new personal data without asking.
