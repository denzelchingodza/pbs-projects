import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import PublicChrome from "@/components/layout/PublicChrome";
import { getSiteSettings } from "@/lib/api";

// next/font downloads Inter once at build time and self-hosts it (no request
// to Google's servers at page-load, unlike a plain <link> import), then
// exposes it as a CSS variable we wire into Tailwind in tailwind.config.js.
// This replaces the old generic system-font look with a real, consistent
// typeface across every page.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PBS Projects | Glass & Aluminum",
  description: "Windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets, based in Harare, Zimbabwe.",
  manifest: "/manifest.json",
};

// RootLayout is a Server Component (no "use client"), so it can fetch data
// directly with await before rendering. getSiteSettings() falls back to
// hardcoded defaults if the backend isn't running, so the frontend never
// crashes just because the API is down.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-dark antialiased">
        <PublicChrome>
          <Navbar settings={settings} />
        </PublicChrome>
        {children}
        <PublicChrome>
          <Footer settings={settings} />
          <WhatsAppFloat settings={settings} />
        </PublicChrome>
      </body>
    </html>
  );
}
