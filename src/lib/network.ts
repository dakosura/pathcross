"use client";
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import { EMPTY_PROFILE, hasProfile, parseProfile, type Profile } from "./profile";

/**
 * "My Network" picks, stored per signed-in user in Supabase (table
 * `network_items`, see supabase/network.sql). Browsing needs no account;
 * adding a pick while signed out opens the sign-in prompt and the pick is
 * applied once the person signs in.
 */
/** `going` is the subset of `events` the person has said they are attending. */
export interface SavedNetwork { events: string[]; clubs: string[]; going: string[]; attended: string[] }
/** How the networking rating felt after the event. */
export type FeedbackAnswer = "too_high" | "about_right" | "too_low";
export type NetworkKind = "events" | "clubs";

interface State {
  /** "loading" until the session has been checked */
  status: "loading" | "ready";
  user: { id: string; email: string } | null;
  saved: SavedNetwork;
  /** Private follow-up notes, by event id. Only the signed-in owner can read them. */
  notes: Record<string, string>;
  /** Answers to "was the rating accurate?", by event id */
  feedback: Record<string, FeedbackAnswer>;
  /** Profession and goals. Kept in the account when signed in, else in this browser. */
  profile: Profile;
  promptOpen: boolean;
  /** Set when saving to the account failed */
  error: string | null;
}

const EMPTY: SavedNetwork = { events: [], clubs: [], going: [], attended: [] };
const SERVER: State = { status: "loading", user: null, saved: EMPTY, notes: {}, feedback: {}, profile: EMPTY_PROFILE, promptOpen: false, error: null };
const PENDING_KEY = "pathcross.network.pending";
const LEGACY_KEY = "pathcross.network.v1"; // picks made before accounts existed
const PROFILE_KEY = "pathcross.profile.v1";

let state: State = SERVER;
let started = false;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Picks waiting for sign-in: the one just clicked, plus any from the old browser-only version. */
function takePending(): { kind: NetworkKind; id: string; going?: boolean }[] {
  const out: { kind: NetworkKind; id: string; going?: boolean }[] = [];
  try {
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? "null");
    strings(legacy?.events).forEach((id) => out.push({ kind: "events", id }));
    strings(legacy?.clubs).forEach((id) => out.push({ kind: "clubs", id }));
    const p = JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "null");
    if ((p?.kind === "events" || p?.kind === "clubs") && typeof p?.id === "string") out.push({ kind: p.kind, id: p.id, going: p.going === true });
    window.localStorage.removeItem(LEGACY_KEY);
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage blocked */
  }
  return out;
}

async function loadFor(user: { id: string; email: string }) {
  if (!supabase) return;
  const pending = takePending();
  if (pending.length) {
    await supabase.from("network_items").upsert(
      pending.map((p) => ({ user_id: user.id, kind: p.kind, item_id: p.id })),
      { onConflict: "user_id,kind,item_id", ignoreDuplicates: true },
    );
  }
  // Picks made with "I'm going" while signed out are marked once the rows exist.
  for (const p of pending.filter((x) => x.going && x.kind === "events")) {
    await supabase.from("network_items").update({ going: true }).eq("user_id", user.id).eq("kind", "events").eq("item_id", p.id);
  }
  type Row = { kind: string; item_id: string; going?: boolean; attended?: boolean; note?: string | null };
  type Result = { data: Row[] | null; error: { code?: string } | null };
  let res: Result = { data: null, error: null };
  // Newer columns come from supabase/network-going.sql and network-followup.sql; load without whichever are not there yet.
  for (const cols of ["kind,item_id,going,attended,note", "kind,item_id,going", "kind,item_id"]) {
    res = (await supabase.from("network_items").select(cols).order("created_at")) as unknown as Result;
    if (res.error?.code !== "42703") break;
  }
  const fb = (await supabase.from("rating_feedback").select("event_id,answer")) as unknown as { data: { event_id: string; answer: FeedbackAnswer }[] | null };
  if (state.user?.id !== user.id) return; // signed out meanwhile
  if (res.error) return set({ status: "ready", error: "We couldn't load your saved network. Please try again." });
  const saved: SavedNetwork = { events: [], clubs: [], going: [], attended: [] };
  const notes: Record<string, string> = {};
  for (const r of res.data ?? []) {
    if (r.kind === "events" || r.kind === "clubs") saved[r.kind as NetworkKind].push(r.item_id);
    if (r.kind === "events" && r.going) saved.going.push(r.item_id);
    if (r.kind === "events" && r.attended) saved.attended.push(r.item_id);
    if (r.kind === "events" && r.note) notes[r.item_id] = r.note;
  }
  const feedback: Record<string, FeedbackAnswer> = {};
  for (const f of fb.data ?? []) feedback[f.event_id] = f.answer;
  set({ status: "ready", saved, notes, feedback, error: null });
}

function localProfile(): Profile {
  try { return parseProfile(JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null")); } catch { return EMPTY_PROFILE; }
}

function start() {
  if (started) return;
  started = true;
  const local = localProfile();
  if (hasProfile(local)) set({ profile: local });
  if (!supabase) return set({ status: "ready" });
  const client = supabase;
  client.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    const next = u ? { id: u.id, email: u.email ?? "" } : null;
    if (next?.id === state.user?.id && state.status === "ready") return;
    if (!next) return set({ status: "ready", user: null, saved: EMPTY, notes: {}, feedback: {} });
    // The account's profile wins; answers given before signing in fill an empty one.
    const fromAccount = parseProfile(u?.user_metadata);
    const adopt = !hasProfile(fromAccount) && hasProfile(state.profile);
    set({ user: next, promptOpen: false, profile: hasProfile(fromAccount) ? fromAccount : state.profile });
    // Deferred: Supabase calls made inside this callback can deadlock
    setTimeout(() => {
      void loadFor(next);
      if (adopt) void client.auth.updateUser({ data: { profession: state.profile.profession ?? null, goals: state.profile.goals } });
    }, 0);
  });
}

/** Saves profession and goals: to the account when signed in, and always to this browser. */
async function saveProfile(profile: Profile) {
  set({ profile, error: null });
  try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* storage blocked */ }
  if (!state.user || !supabase) return;
  const { error } = await supabase.auth.updateUser({ data: { profession: profile.profession ?? null, goals: profile.goals } });
  if (error) set({ error: "We couldn't save your profile. Please try again." });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => { listeners.delete(cb); };
}

async function toggle(kind: NetworkKind, id: string) {
  const { user, saved } = state;
  if (!user || !supabase) {
    try { window.localStorage.setItem(PENDING_KEY, JSON.stringify({ kind, id })); } catch { /* ignore */ }
    return set({ promptOpen: true });
  }
  const had = saved[kind].includes(id);
  const before = saved;
  set({ saved: { ...saved, [kind]: had ? saved[kind].filter((x) => x !== id) : [...saved[kind], id], going: had && kind === "events" ? saved.going.filter((x) => x !== id) : saved.going, attended: had && kind === "events" ? saved.attended.filter((x) => x !== id) : saved.attended }, error: null });
  const q = had
    ? supabase.from("network_items").delete().eq("user_id", user.id).eq("kind", kind).eq("item_id", id)
    : supabase.from("network_items").insert({ user_id: user.id, kind, item_id: id });
  const { error } = await q;
  if (error && error.code !== "23505") set({ saved: before, error: "That change didn't save. Please try again." });
}

/** "I'm going": adds the event to My Network if needed and marks it as one the person is attending. */
async function toggleGoing(id: string) {
  const { user, saved } = state;
  if (!user || !supabase) {
    try { window.localStorage.setItem(PENDING_KEY, JSON.stringify({ kind: "events", id, going: true })); } catch { /* ignore */ }
    return set({ promptOpen: true });
  }
  const isGoing = saved.going.includes(id);
  const inNetwork = saved.events.includes(id);
  const before = saved;
  set({
    saved: { ...saved, events: inNetwork ? saved.events : [...saved.events, id], going: isGoing ? saved.going.filter((x) => x !== id) : [...saved.going, id] },
    error: null,
  });
  const { error } = inNetwork
    ? await supabase.from("network_items").update({ going: !isGoing }).eq("user_id", user.id).eq("kind", "events").eq("item_id", id)
    : await supabase.from("network_items").insert({ user_id: user.id, kind: "events", item_id: id, going: true });
  if (error && error.code !== "23505") set({ saved: before, error: "That change didn't save. Please try again." });
}

/** "I went": marks a past event in My Network as attended, which opens the private note. */
async function setAttended(id: string, on: boolean) {
  const { user, saved } = state;
  if (!user || !supabase || !saved.events.includes(id)) return;
  const before = saved;
  set({ saved: { ...saved, attended: on ? [...saved.attended.filter((x) => x !== id), id] : saved.attended.filter((x) => x !== id) }, error: null });
  const { error } = await supabase.from("network_items").update({ attended: on }).eq("user_id", user.id).eq("kind", "events").eq("item_id", id);
  if (error) set({ saved: before, error: "That change didn't save. Please try again." });
}

/** Saves the private "who did you meet?" note for an event. An empty note clears it. */
async function saveNote(id: string, text: string): Promise<boolean> {
  const { user, notes } = state;
  if (!user || !supabase) return false;
  const note = text.trim().slice(0, 2000);
  const next = { ...notes };
  if (note) next[id] = note; else delete next[id];
  set({ notes: next, error: null });
  const { error } = await supabase.from("network_items").update({ note: note || null }).eq("user_id", user.id).eq("kind", "events").eq("item_id", id);
  if (error) { set({ notes, error: "We couldn't save your note. Please try again." }); return false; }
  return true;
}

/** Records whether the networking rating felt accurate after the event. */
async function setFeedback(id: string, answer: FeedbackAnswer, starsShown: number) {
  const { user, feedback } = state;
  if (!user || !supabase) return;
  set({ feedback: { ...feedback, [id]: answer }, error: null });
  const { error } = await supabase.from("rating_feedback").upsert({ user_id: user.id, event_id: id, answer, stars_shown: starsShown }, { onConflict: "user_id,event_id" });
  if (error) set({ feedback, error: "We couldn't save your answer. Please try again." });
}

async function clear() {
  const { user, saved } = state;
  if (!user || !supabase) return;
  set({ saved: EMPTY, notes: {}, error: null });
  const { error } = await supabase.from("network_items").delete().eq("user_id", user.id);
  if (error) set({ saved, error: "We couldn't clear your network. Please try again." });
}

/** Emails a one-time sign-in link. Creates the account on first use. */
export async function sendSignInLink(email: string, redirectPath = "/my-network"): Promise<string | null> {
  if (!supabase) return "Sign-in isn't set up yet.";
  const p = state.profile;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // `data` is stored on the account only when this email is new.
    options: { emailRedirectTo: `${window.location.origin}${redirectPath}`, ...(hasProfile(p) ? { data: { profession: p.profession ?? null, goals: p.goals } } : {}) },
  });
  if (!error) return null;
  return error.status === 429 ? "Too many sign-in emails were requested. Please wait a few minutes and try again." : "We couldn't send the email. Check the address and try again.";
}

const openPrompt = () => set({ promptOpen: true });
const closePrompt = () => set({ promptOpen: false });
const signOut = async () => { await supabase?.auth.signOut(); };

export function useNetwork() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER);
  return {
    ...s,
    has: (kind: NetworkKind, id: string) => s.saved[kind].includes(id),
    isGoing: (id: string) => s.saved.going.includes(id),
    toggle,
    toggleGoing,
    setAttended,
    saveNote,
    setFeedback,
    clear,
    saveProfile,
    openPrompt,
    closePrompt,
    signOut,
  };
}
