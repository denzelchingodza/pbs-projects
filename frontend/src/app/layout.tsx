import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import BackToTop from "@/components/layout/BackToTop";
import PublicChrome from "@/components/layout/PublicChrome";
import StructuredData from "@/components/seo/StructuredData";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { getSiteSettings } from "@/lib/api";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

// next/font downloads both fonts once at build time and self-hosts them (no
// request to Google's servers at page-load, unlike a plain <link> import),
// then exposes each as its own CSS variable, wired into Tailwind in
// tailwind.config.js as `font-sans` (Inter, body copy) and `font-display`
// (Space Grotesk, every heading, see globals.css's `h1-h4` rule). Inter
// alone, used for absolutely everything, was the exact "looks like any
// other website" problem this was meant to fix, headings now carry real,
// distinct character instead of just being bigger/bolder Inter.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

// metadataBase turns every relative URL used below (the Open Graph image,
// individual pages' canonical links) into a full address automatically,
// one place to set it instead of writing the full domain out every time.
// Every page under app/ inherits this and layers its own title/description
// on top through the "%s | PBS Projects" template below, so a page titled
// "About" becomes "About | PBS Projects" in the browser tab and in search
// results, without repeating the business name on every page.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Glass & Aluminum, Harare`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "aluminum windows Harare",
    "glass and aluminum Zimbabwe",
    "shower cubicles Harare",
    "shop fronts Zimbabwe",
    "suspended ceilings Harare",
    "PBS Projects",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Glass & Aluminum, Harare`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Glass & Aluminum, Harare`,
    description: DEFAULT_DESCRIPTION,
    images: ["/images/og-image.jpg"],
  },
};

// RootLayout is a Server Component (no "use client"), so it can fetch data
// directly with await before rendering. getSiteSettings() falls back to
// hardcoded defaults if the backend isn't running, so the frontend never
// crashes just because the API is down.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans text-dark antialiased">
        <StructuredData settings={settings} />
        <LanguageProvider>
          <PublicChrome>
            <TopBar settings={settings} />
            <Navbar settings={settings} />
          </PublicChrome>
          {children}
          <PublicChrome>
            <Footer settings={settings} />
            <WhatsAppFloat settings={settings} />
            <BackToTop />
          </PublicChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
