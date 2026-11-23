"use client";
import { useCallback, useEffect, useState } from "react";
import { isIgnored, setIgnored } from "@/lib/ignore-me";
import { sendSignInLink } from "@/lib/network";
import { supabase } from "@/lib/supabase";
import { QuickAddEvent } from "./QuickAddEvent";

interface Named { name: string; visitors: number }
export interface Stats {
  days: number;
  generatedAt: string;
  trafficError?: string;
  traffic: null | {
    views: number; visitors: number; today_views: number; today_visitors: number; active_now: number; outbound_clicks: number;
    daily: { day: string; views: number; visitors: number }[];
    pages: { path: string; label: string; views: number; visitors: number }[];
    referrers: Named[]; countries: Named[]; devices: Named[]; browsers: Named[];
    campaigns: { source: string; medium: string | null; campaign: string | null; visitors: number }[];
    outbound: { target: string; path: string; clicks: number }[];
    saved_total: number;
    saved_top: { kind: string; id: string; label: string; saves: number }[];
  };
  submissions: { total: number; error?: string; recent: Record<string, string | null>[] };
  accounts: { total: number; last7: number; last30: number; daily: { day: string; count: number }[]; professions: Named[]; goals: Named[]; recent: { email: string; created_at: string }[] };
}
type Problem = null | { kind: "signed-out" | "not-admin" | "not-configured" | "server"; email?: string; message?: string };

const fmt = (n: number) => n.toLocaleString("en-US");
const COUNTRIES = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (c: string) => { try { return COUNTRIES?.of(c) ?? c; } catch { return c; } };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-bark">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-semibold text-forest">{value}</dd>
      {note && <p className="mt-1 text-xs text-bark">{note}</p>}
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-bark">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A ranked list with a proportional bar behind each row. */
function BarList({ rows, empty = "Nothing yet." }: { rows: { label: string; value: number; sub?: string }[]; empty?: string }) {
  if (rows.length === 0) return <p className="text-sm text-bark">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={`${r.label}-${r.sub ?? ""}`} className="relative overflow-hidden rounded-lg bg-sand/60">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-moss-50" style={{ width: `${(r.value / max) * 100}%` }} />
          <span className="relative flex items-baseline justify-between gap-3 px-3 py-1.5 text-sm">
            <span className="min-w-0 truncate text-ink">{r.label}{r.sub && <span className="ml-2 text-xs text-bark">{r.sub}</span>}</span>
            <span className="shrink-0 font-semibold text-forest">{fmt(r.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Daily visitors (dark) and page views (light) as bars. */
function DailyChart({ daily, days, asOf }: { daily: { day: string; views: number; visitors: number }[]; days: number; asOf: string }) {
  // Fill days with no traffic so gaps are visible.
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series: { day: string; views: number; visitors: number }[] = [];
  const end = new Date(asOf);
  for (let i = Math.min(days, 60) - 1; i >= 0; i--) {
    const iso = new Date(end.getTime() - i * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });
    series.push(byDay.get(iso) ?? { day: iso, views: 0, visitors: 0 });
  }
  const max = Math.max(...series.map((d) => d.views), 1);
  const W = 720, H = 180, gap = 3, bw = (W - gap * (series.length - 1)) / series.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label={`Daily page views and visitors, last ${series.length} days`}>
        {series.map((d, i) => {
          const x = i * (bw + gap);
          const hv = (d.views / max) * H, hu = (d.visitors / max) * H;
          return (
            <g key={d.day}>
              <title>{`${shortDay(d.day)}: ${d.visitors} visitors, ${d.views} views`}</title>
              <rect x={x} y={H - hv} width={bw} height={hv} rx={2} fill="#d4a574" opacity={0.55} />
              <rect x={x} y={H - hu} width={bw} height={hu} rx={2} fill="#1e3a2f" />
              {(i === 0 || i === series.length - 1 || i % Math.ceil(series.length / 6) === 0) && (
                <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize="11" fill="#5c4a3a">{shortDay(d.day)}</text>
              )}
            </g>
          );
        })}
        <line x1="0" x2={W} y1={H} y2={H} stroke="#e6dfd3" />
      </svg>
      <figcaption className="mt-2 flex gap-4 text-xs text-bark">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-forest" />Visitors</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-clay/60" />Page views</span>
      </figcaption>
    </figure>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(true);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (usePassword) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setPhase("sending");
          // On success the page picks up the new session by itself.
          const { error: err } = (await supabase?.auth.signInWithPassword({ email: email.trim(), password })) ?? { error: { message: "not-set-up", status: 0 } };
          if (err) {
            setError(err.status === 429 ? "Too many attempts. Please wait a few minutes and try again." : "That email and password didn't work. No password yet? Tap “Email me a sign-in link instead”, then choose “Set a password” once you're in.");
            setPhase("idle");
          }
        }}
        className="space-y-3"
      >
        <label htmlFor="ops-email" className="block text-sm font-semibold text-ink">Email</label>
        <input id="ops-email" name="username" type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-moss" />
        <label htmlFor="ops-password" className="block text-sm font-semibold text-ink">Password</label>
        <input id="ops-password" name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-moss" />
        {error && <p role="alert" className="text-sm font-medium text-clay-700">{error}</p>}
        <button type="submit" disabled={phase === "sending"} className="w-full rounded-full bg-forest px-4 py-3 text-sm font-semibold text-cream hover:bg-forest-700 disabled:opacity-60">{phase === "sending" ? "Signing in…" : "Sign in"}</button>
        <button type="button" onClick={() => { setUsePassword(false); setError(null); }} className="w-full text-center text-sm font-semibold text-clay-700 hover:underline">Email me a sign-in link instead</button>
      </form>
    );
  }
  if (phase === "sent") return <p role="status" className="rounded-xl bg-moss-50 p-4 text-sm text-forest">Check your email for a sign-in link, and open it on this device. You&apos;ll land back here.</p>;
  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); setError(null); setPhase("sending"); const problem = await sendSignInLink(email.trim(), window.location.hostname.startsWith("ops.") ? "/" : "/ops"); if (problem) { setError(problem); setPhase("idle"); } else setPhase("sent"); }}
      className="space-y-3"
    >
      <label htmlFor="ops-email" className="block text-sm font-semibold text-ink">Email</label>
      <input id="ops-email" type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-moss" />
      {error && <p role="alert" className="text-sm font-medium text-clay-700">{error}</p>}
      <button type="submit" disabled={phase === "sending"} className="w-full rounded-full bg-forest px-4 py-3 text-sm font-semibold text-cream hover:bg-forest-700 disabled:opacity-60">{phase === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
      <button type="button" onClick={() => { setUsePassword(true); setError(null); setPhase("idle"); }} className="w-full text-center text-sm font-semibold text-clay-700 hover:underline">Use a password instead</button>
    </form>
  );
}

/** Lets a signed-in admin create or change their password (used by the password sign-in). */
function SetPassword({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return <button onClick={() => { setOpen(true); setPhase("idle"); setPassword(""); }} className="text-sm font-semibold text-clay-700 hover:underline">Set a password</button>;
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPhase("saving");
        const { error: err } = (await supabase?.auth.updateUser({ password })) ?? { error: { message: "Sign-in isn't set up here." } };
        if (err) { setError(err.message); setPhase("idle"); } else setPhase("done");
      }}
      className="flex flex-wrap items-center gap-2"
    >
      {/* Lets the phone or browser offer to save the email and password together. */}
      <input type="email" name="username" autoComplete="username" value={email ?? ""} readOnly hidden />
      {phase === "done" ? (
        <>
          <span role="status" className="text-sm font-medium text-forest">Password saved. Use it next time you sign in.</span>
          <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-clay-700 hover:underline">Close</button>
        </>
      ) : (
        <>
          <label htmlFor="ops-new-password" className="sr-only">New password</label>
          <input id="ops-new-password" name="new-password" type="password" required minLength={8} autoComplete="new-password" autoFocus placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm outline-none focus:border-moss" />
          <button type="submit" disabled={phase === "saving"} className="rounded-full bg-forest px-4 py-1.5 text-sm font-semibold text-cream hover:bg-forest-700 disabled:opacity-60">{phase === "saving" ? "Saving…" : "Save"}</button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-bark hover:underline">Cancel</button>
          {error && <p role="alert" className="w-full text-sm font-medium text-clay-700">{error}</p>}
        </>
      )}
    </form>
  );
}

export function Report({ stats }: { stats: Stats }) {
  const t = stats.traffic;
  const a = stats.accounts;
  return (
        <div className="mt-8 space-y-6">
          {stats.trafficError && (
            <p role="alert" className="rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">Visit counting isn&apos;t set up yet ({stats.trafficError}). The database step is still to do, so only account numbers show below.</p>
          )}

          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile label="Active now" value={fmt(t?.active_now ?? 0)} note="Visitors in the last 5 minutes" />
            <Tile label="Visitors today" value={fmt(t?.today_visitors ?? 0)} note={`${fmt(t?.today_views ?? 0)} page views`} />
            <Tile label={`Visitors, ${stats.days} days`} value={fmt(t?.visitors ?? 0)} note={`${fmt(t?.views ?? 0)} page views`} />
            <Tile label="Clicks out to organizers" value={fmt(t?.outbound_clicks ?? 0)} note="Sign-up and Visit site links" />
            <Tile label="Accounts" value={fmt(a?.total ?? 0)} note={`${fmt(a?.last7 ?? 0)} new in 7 days · ${fmt(a?.last30 ?? 0)} in 30`} />
            <Tile label="Saved to My Network" value={fmt(t?.saved_total ?? 0)} note="Events and clubs, all accounts" />
          </dl>

          <Panel title="Visitors and page views by day" hint="A visitor is counted once per day. The same person on two days counts twice, because visitors are anonymous.">
            {t ? <DailyChart daily={t.daily} days={stats.days} asOf={stats.generatedAt} /> : <p className="text-sm text-bark">No data yet.</p>}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Most viewed pages">
              <BarList rows={(t?.pages ?? []).map((p) => ({ label: p.label, value: p.views, sub: p.label !== p.path ? p.path : undefined }))} empty="No page views yet." />
            </Panel>
            <Panel title="Where visitors come from" hint="The site they were on before. “Direct” means a typed address, a bookmark or an app that hides it.">
              <BarList rows={(t?.referrers ?? []).map((r) => ({ label: r.name, value: r.visitors }))} empty="No visits yet." />
            </Panel>
            <Panel title="Your social posts" hint="Add a tag to links you post and they show up here by name.">
              <BarList rows={(t?.campaigns ?? []).map((c) => ({ label: c.source, value: c.visitors, sub: [c.medium, c.campaign].filter(Boolean).join(" · ") || undefined }))} empty="No tagged links yet." />
              <p className="mt-4 rounded-xl bg-sand px-3 py-2 text-xs text-bark">Example for an Instagram post: <code className="break-all">https://www.joinpathcross.com/weekly?utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=weekly-lineup</code></p>
            </Panel>
            <Panel title="What people click through to" hint="Links that leave PathCross, such as an event's Sign up button.">
              <BarList rows={(t?.outbound ?? []).map((o) => ({ label: o.target, value: o.clicks, sub: `from ${o.path}` }))} empty="No click-throughs yet." />
            </Panel>
            <Panel title="Countries">
              <BarList rows={(t?.countries ?? []).map((c) => ({ label: c.name.length === 2 ? countryName(c.name) : c.name, value: c.visitors }))} empty="No visits yet." />
            </Panel>
            <Panel title="Devices and browsers">
              <BarList rows={(t?.devices ?? []).map((d) => ({ label: d.name[0].toUpperCase() + d.name.slice(1), value: d.visitors }))} empty="No visits yet." />
              <div className="mt-4"><BarList rows={(t?.browsers ?? []).map((b) => ({ label: b.name, value: b.visitors }))} empty="" /></div>
            </Panel>
            <Panel title="Most saved to My Network">
              <BarList rows={(t?.saved_top ?? []).map((s) => ({ label: s.label, value: s.saves, sub: s.kind === "clubs" ? "club" : "event" }))} empty="Nothing saved yet." />
            </Panel>
            <Panel title="Who has signed up" hint="Professions and goals are counts only. The email list is in the next panel.">
              <p className="mb-2 text-sm font-semibold text-ink">Profession</p>
              <BarList rows={(a?.professions ?? []).map((p) => ({ label: p.name, value: p.visitors }))} empty="No one has chosen a profession yet." />
              <p className="mb-2 mt-5 text-sm font-semibold text-ink">Looking for</p>
              <BarList rows={(a?.goals ?? []).map((g) => ({ label: g.name, value: g.visitors }))} empty="No one has chosen goals yet." />
            </Panel>
          </div>

          <Panel title={`Listing requests (${fmt(stats.submissions?.total ?? 0)})`} hint="Clubs, events and networks people sent through the List your event form. Newest first. Private: only you can see this.">
            {stats.submissions?.error ? (
              <p className="text-sm text-clay-700">The requests table isn&apos;t set up yet ({stats.submissions.error}).</p>
            ) : (stats.submissions?.recent?.length ?? 0) === 0 ? (
              <p className="text-sm text-bark">No requests yet.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {stats.submissions.recent.map((r) => (
                  <li key={r.id ?? r.created_at} className="space-y-1 py-4">
                    <p className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-ink">{r.name} <span className="font-normal text-bark">· {r.kind} · {r.organizer}</span></span>
                      <span className="text-xs text-bark">{r.created_at ? new Date(r.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Pacific/Honolulu" }) : ""}</span>
                    </p>
                    <p className="text-bark">{r.description}</p>
                    <p className="text-xs text-bark">
                      {[r.event_date, r.start_time && `${r.start_time}${r.end_time ? `–${r.end_time}` : ""}`, r.repeats, r.venue, r.address, r.price].filter(Boolean).join(" · ")}
                    </p>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-clay-700 hover:underline">Website ↗</a>}
                      {r.social && <a href={r.social} target="_blank" rel="noopener noreferrer" className="font-semibold text-clay-700 hover:underline">Social ↗</a>}
                      <a href={`mailto:${r.contact_email}?subject=${encodeURIComponent(`Your PathCross listing: ${r.name}`)}`} className="font-semibold text-clay-700 hover:underline">Reply to {r.contact_name} ({r.contact_email})</a>
                      {r.contact_phone && <span className="text-bark">{r.contact_phone}</span>}
                    </p>
                    {(r.join_info || r.extra) && <p className="text-xs text-bark">{[r.join_info, r.extra].filter(Boolean).join(" · ")}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent sign-ups" hint={`Free accounts, newest first. Showing ${a?.recent?.length ?? 0} of ${fmt(a?.total ?? 0)}. Private: only you can see this.`}>
            {(a?.recent?.length ?? 0) === 0 ? (
              <p className="text-sm text-bark">No sign-ups yet.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {a.recent.map((r) => (
                  <li key={r.email} className="flex items-baseline justify-between gap-3 py-2">
                    <a href={`mailto:${r.email}`} className="min-w-0 truncate text-ink hover:underline">{r.email}</a>
                    <span className="shrink-0 text-xs text-bark">{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Pacific/Honolulu" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <p className="text-xs text-bark">Counting began when this feature was published, so older visits aren&apos;t included. Visits from search-engine and monitoring bots, and from people who send a Do Not Track signal, are left out, so your own numbers may read a little higher than Google&apos;s.</p>
        </div>
  );
}


export function OpsDashboard() {
  const [token, setToken] = useState<string | null | undefined>(undefined); // undefined = still checking
  const [email, setEmail] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [ignoreMe, setIgnoreMe] = useState(isIgnored); // only shown after sign-in, so it never renders on the server
  const [stats, setStats] = useState<Stats | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) { void Promise.resolve().then(() => setToken(null)); return; }
    client.auth.getSession().then(({ data }) => { setToken(data.session?.access_token ?? null); setEmail(data.session?.user.email ?? null); });
    const { data } = client.auth.onAuthStateChange((_e, session) => { setToken(session?.access_token ?? null); setEmail(session?.user.email ?? null); });
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/stats?days=${days}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const body = await res.json();
      if (res.ok) { setStats(body); setProblem(null); }
      else setProblem({ kind: body.error === "not-admin" || body.error === "not-configured" || body.error === "signed-out" ? body.error : "server", email: body.email, message: body.message });
    } catch {
      setProblem({ kind: "server", message: "Couldn't reach the server." });
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    if (!token) return;
    const first = setTimeout(() => void load(), 0);
    const every = setInterval(() => void load(), 60_000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [token, load]);

  const shell = (children: React.ReactNode) => <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>;

  if (token === undefined) return shell(<div className="h-64 animate-pulse rounded-2xl bg-sand" />);

  if (!token) {
    return shell(
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Private</p>
        <h1 className="mt-1 text-2xl font-semibold">Ops sign-in</h1>
        <p className="mb-5 mt-2 text-sm text-bark">Sign in with the email that is set up as the site&apos;s admin.</p>
        <SignIn />
      </div>,
    );
  }

  if (problem && problem.kind !== "server" && problem.kind !== "signed-out") {
    return shell(
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{problem.kind === "not-configured" ? "One setup step left" : "This account isn't an admin"}</h1>
        {problem.kind === "not-configured" ? (
          <p className="mt-3 text-sm text-bark">Signed in as <strong>{problem.email}</strong>. The site doesn&apos;t know who the admin is yet. Add an <code>OPS_ADMIN_EMAILS</code> setting in Vercel with your email, redeploy, and reload this page.</p>
        ) : (
          <p className="mt-3 text-sm text-bark">Signed in as <strong>{problem.email}</strong>, which isn&apos;t on the admin list. Sign out and use the admin email.</p>
        )}
        <button onClick={() => void supabase?.auth.signOut()} className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700">Sign out</button>
      </div>,
    );
  }

  return shell(
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Ops</p>
          <h1 className="mt-1 text-3xl font-semibold">How the site is doing</h1>
          <p className="mt-1 text-sm text-bark" aria-live="polite">
            {stats ? `Updated ${new Date(stats.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Loading…"}
            {loading && stats ? " · refreshing" : ""} · refreshes every minute
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-full bg-sand p-1 text-sm font-semibold" role="group" aria-label="Time range">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} aria-pressed={days === d} className={`rounded-full px-3.5 py-1.5 transition ${days === d ? "bg-card text-forest shadow-sm" : "text-bark hover:text-ink"}`}>{d} days</button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bark" title="Stops this browser's visits from being counted. Turned on automatically when an admin signs in.">
            <input type="checkbox" checked={ignoreMe} onChange={(e) => { setIgnored(e.target.checked); setIgnoreMe(e.target.checked); }} className="h-4 w-4 accent-[#c17f4a]" />
            Don&apos;t count my visits here
          </label>
          <SetPassword email={email} />
          <button onClick={() => void supabase?.auth.signOut()} className="text-sm font-semibold text-clay-700 hover:underline">Sign out{email ? ` (${email})` : ""}</button>
        </div>
      </div>

      {problem?.kind === "server" && <p role="alert" className="mt-6 rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">Something went wrong loading the numbers{problem.message ? `: ${problem.message}` : ""}.</p>}
      {!stats && !problem && <div className="mt-8 h-64 animate-pulse rounded-2xl bg-sand" />}

      <QuickAddEvent token={token} />

      {stats && <Report stats={stats} />}
    </>,
  );
}
