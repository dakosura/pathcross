import type { Event } from "@/types";
import { hostLabel, signupUrl } from "@/lib/links";

/** External link to the organizer's sign-up page. Renders nothing for sample listings. */
export function SignupLink({ event, variant = "text" }: { event: Event; variant?: "text" | "button" }) {
  const url = signupUrl(event);
  if (!url) return null;
  const host = hostLabel(url);
  if (variant === "button") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-clay px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-clay-700">
        Sign up on {host}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold text-clay-700 underline-offset-4 hover:underline">
      Sign up <span aria-hidden="true">↗</span>
      <span className="sr-only">on {host} (opens in a new tab)</span>
    </a>
  );
}
