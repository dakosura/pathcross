import type { Metadata } from "next";
import { OpsDashboard } from "@/components/OpsDashboard";

// Private: not listed in the sitemap, blocked in robots.txt, and told not to be indexed.
export const metadata: Metadata = { title: "Ops", robots: { index: false, follow: false } };

export default function OpsPage() {
  return <OpsDashboard />;
}
