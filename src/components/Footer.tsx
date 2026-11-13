import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-bark sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© PathCross · joinpathcross.com · Honolulu, HI</p>
        <div className="flex gap-6">
          <Link href="/events" className="hover:text-clay-700">Events</Link>
          <Link href="/top-10" className="hover:text-clay-700">Top 10</Link>
          <Link href="/about" className="hover:text-clay-700">About</Link>
        </div>
      </div>
    </footer>
  );
}
