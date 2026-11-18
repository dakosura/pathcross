import type { InterestId } from "@/types";

const paths: Record<InterestId, string[]> = {
  professional: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  fitness: ["M6.5 6.5v11", "M17.5 6.5v11", "M3 9v6", "M21 9v6", "M6.5 12h11"],
  golf: ["M8 20V4l9 3.5L8 11", "M4 20.5c0-.8 1.8-1.5 4-1.5s4 .7 4 1.5"],
  social: ["M3 21h18", "M5 21V8l7-4 7 4v13", "M10 21v-5h4v5", "M9 11h.01M15 11h.01"],
  volunteer: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"],
  boating: ["M12 3v12", "M12 4l6 10h-6", "M12 7l-5 7h5", "M3 19c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"],
};

export function InterestIcon({ id, className = "h-6 w-6" }: { id: InterestId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[id].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
