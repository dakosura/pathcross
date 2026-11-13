import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-navy-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© PathCross · joinpathcross.com · Honolulu, HI</p>
        <div className="flex gap-6">
          <Link href="/events" className="hover:text-teal-600">Events</Link>
          <Link href="/top-10" className="hover:text-teal-600">Top 10</Link>
          <Link href="/about" className="hover:text-teal-600">About</Link>
        </div>
      </div>
    </footer>
  );
}
