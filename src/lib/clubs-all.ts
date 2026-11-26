import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Club, InterestId } from "@/types";
import { clubs as codeClubs } from "./clubs";
import { adminClient } from "./supabase-admin";

interface ClubRow {
  id: string; name: string; interest: InterestId; blurb: string; url: string | null; area: string;
  address: string | null; membership: string | null; phone: string | null; facilities: string[] | null;
  lat: number | null; lng: number | null;
}

const fromRow = (r: ClubRow): Club => ({
  id: r.id, name: r.name, interest: r.interest, blurb: r.blurb, area: r.area,
  ...(r.url ? { url: r.url } : {}), ...(r.address ? { address: r.address } : {}),
  ...(r.membership ? { membership: r.membership } : {}), ...(r.phone ? { phone: r.phone } : {}),
  ...(r.facilities?.length ? { facilities: r.facilities } : {}),
  ...(r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : {}),
});

/** Every club: the hand-researched ones in code, then those added from the Ops page. Cached; saving a club busts the "clubs" tag. */
export async function getClubs(): Promise<Club[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("clubs");
  try {
    const { data, error } = await adminClient().from("clubs").select("*").eq("status", "active").order("created_at");
    if (error || !data) return codeClubs;
    const taken = new Set(codeClubs.map((c) => c.id));
    return [...codeClubs, ...(data as ClubRow[]).filter((r) => !taken.has(r.id)).map(fromRow)];
  } catch {
    return codeClubs; // no database configured, or the table doesn't exist yet
  }
}

export const getClubById = async (id?: string) => (await getClubs()).find((c) => c.id === id);
export const getClubsByInterest = async (interest: string) => (await getClubs()).filter((c) => c.interest === interest);
