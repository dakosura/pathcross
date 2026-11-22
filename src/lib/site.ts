/** Facts the legal pages rely on. Update here and every page follows. */
export const site = {
  name: "PathCross",
  url: "https://www.joinpathcross.com",
  location: "Honolulu, Hawaiʻi",
  /** Shown under the site name in Google results and link previews. */
  tagline: "Efficient networking for business professionals in Honolulu",
  description:
    "Your one-stop shop for building a professional network in Honolulu, Hawaiʻi. Find networking events, business clubs and groups in one place, matched to what you do. Free.",
  contactEmail: "hello@joinpathcross.com",
  /** Official social accounts: shown in the footer and listed for search engines. */
  social: [
    { id: "facebook", name: "Facebook", handle: "PathCross", url: "https://www.facebook.com/profile.php?id=61596821220456" },
    { id: "instagram", name: "Instagram", handle: "@path.cross", url: "https://www.instagram.com/path.cross/" },
    { id: "x", name: "X", handle: "@JoinPathCross", url: "https://x.com/JoinPathCross" },
  ] as const,
  /** Shown as "Last updated" on the legal pages. Change whenever their wording changes. */
  policiesUpdated: "November 21, 2026",
};
