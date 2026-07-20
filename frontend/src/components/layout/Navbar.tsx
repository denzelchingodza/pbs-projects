"use client";

/**
 * Site navigation. This is a Client Component ("use client" at the top)
 * because it needs interactivity in the browser: toggling the mobile menu
 * open/closed, and watching scroll position. Business info (phone number)
 * is passed in as a prop from a Server Component instead, since Client
 * Components can't directly do the server-side data fetch themselves.
 *
 * Redesign notes: swapped the plain text links for a clean corporate bar —
 * more horizontal breathing room, a solid "Get a Quote" button instead of
 * a plain text link (it's the #1 action we want visitors to take), and the
 * phone number moved out of the nav row into its own subtle top strip so
 * the main bar stays uncluttered.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import type { SiteSettings } from "@/types";

const NAV_LINKS = [
  { href: "/#work", label: "Our Work" },
  { href: "/#products", label: "Products" },
  { href: "/about", label: "About" },
];

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Thin top strip — contact info, hidden on mobile to save space */}
      <div className="hidden md:flex items-center justify-end gap-6 px-8 py-2 text-xs text-neutral-500 border-b border-neutral-100">
        <a href={`mailto:${settings.email}`} className="hover:text-orange transition-colors">
          {settings.email}
        </a>
        <a
          href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
          className="hover:text-orange transition-colors font-medium"
        >
          {settings.phone_primary}
        </a>
      </div>

      <div
        className={`flex items-center justify-between px-6 md:px-8 py-4 transition-shadow border-b border-neutral-100 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#quote"
            className="bg-dark text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-orange transition-colors"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          className="md:hidden text-2xl text-dark"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu panel */}
      <nav
        className={`md:hidden fixed top-0 right-0 h-screen w-3/4 bg-white border-l border-neutral-200 flex flex-col items-start justify-center gap-6 p-10 transition-transform duration-300 z-40 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-base font-medium text-dark hover:text-orange transition-colors"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/#quote"
          onClick={() => setOpen(false)}
          className="bg-dark text-white text-sm font-semibold px-5 py-2.5 rounded-md"
        >
          Get a Quote
        </Link>
        <a
          href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
          className="text-sm font-semibold text-neutral-600 mt-4"
        >
          {settings.phone_primary}
        </a>
      </nav>
    </header>
  );
}
