import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthDialog } from "@/components/AuthDialog";
import { CookieBanner } from "@/components/CookieConsent";
import { PageViewTracker } from "@/components/PageViewTracker";
import { site } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "PathCross: Networking Made Efficient in Honolulu", template: "%s · PathCross" },
  description: site.description,
  metadataBase: new URL(site.url),
  // Each page's canonical address is its own path on the www domain.
  alternates: { canonical: "./" },
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "./",
    title: "PathCross: Networking Made Efficient in Honolulu",
    description: site.description,
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "PathCross" }],
  },
  twitter: { card: "summary_large_image", title: "PathCross: Networking Made Efficient in Honolulu", description: site.description, images: ["/brand/og.jpg"] },
};

// Tells search engines who runs the site and what it is.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/brand/mark.png`, email: site.contactEmail, areaServed: "Honolulu, Hawaii" },
    { "@type": "WebSite", "@id": `${site.url}/#site`, name: site.name, url: site.url, description: site.description, publisher: { "@id": `${site.url}/#org` }, inLanguage: "en-US" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AuthDialog />
        <CookieBanner />
        <PageViewTracker />
      </body>
    </html>
  );
}
