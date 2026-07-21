"use client";

/**
 * Site navigation. This is a Client Component ("use client" at the top)
 * because it needs interactivity in the browser: toggling the mobile menu
 * open/closed, and watching scroll position. Business info (phone number)
 * is passed in as a prop from a Server Component instead, since Client
 * Components can't directly do the server-side data fetch themselves.
 *
 * Mobile menu redesign notes: the previous version was a plain white panel
 * with the hero page still visible (and readable) through the gap next to
 * it, which looked unfinished rather than like a real app drawer. Now: a
 * dark backdrop actually dims the rest of the page while the menu is open,
 * the panel itself uses the dark brand color instead of plain white so it
 * reads as a deliberate surface, and it carries three real colors instead
 * of one (white text, orange for the primary action, WhatsApp's own green
 * for the chat link), each meaning something rather than decoration.
 *
 * Header redesign notes: back to a single clean bar, the earlier two tier
 * version (a dark contact strip above it) and the small back and forward
 * buttons next to the logo were both tried and didn't land well, so both
 * are gone now. Contact details live in the footer and the Contact page
 * instead of crowding the header, and the WhatsApp float (see
 * WhatsAppFloat.tsx) is the quick way to reach the business from anywhere
 * on the site.
 *
 * The bar itself is white, not orange, on purpose: the real company logo
 * (see ui/Logo.tsx) is an orange roof icon with a dark "PBS" and a gray
 * "PROJECTS" underneath it, matching the actual flyer exactly. Putting
 * that on an orange bar meant recoloring it to all white just to stay
 * readable, which lost the logo's real colors entirely. White keeps the
 * logo exactly as designed and clearly visible, the orange still shows up
 * throughout the bar as the "Get a Quote" button and the link hover color.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import type { SiteSettings } from "@/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
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

  // Locks background scroll while the mobile drawer is open, standard for
  // any real app-style menu, so the page behind it doesn't scroll along.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const waDigits = settings.whatsapp_number.replace(/[^\d]/g, "");

  return (
    <header className="sticky top-0 z-50">
      {/* Single bar — white, so the real logo shows in its true colors */}
      <div
        className={`bg-white border-b border-neutral-100 flex items-center justify-between px-4 md:px-8 py-3 transition-shadow ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <Link href="/" className="px-1">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark/80 hover:text-orange transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#quote"
            className="bg-orange text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:brightness-95 transition"
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

      {/* Backdrop — dims and blocks the page behind the drawer, tap to close */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile menu panel */}
      <nav
        className={`md:hidden fixed top-0 right-0 h-screen w-[78%] max-w-xs bg-dark flex flex-col p-6 transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <Logo dark />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-semibold text-white px-3 py-3 rounded-md hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 mt-6 pt-6 border-t border-white/10">
          <a
            href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
            className="text-sm font-medium text-white/70 px-3 hover:text-white transition-colors"
          >
            {settings.phone_primary}
          </a>
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[#25D366] px-3 hover:brightness-110 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm4.51 12.02c-.2.58-1.2 1.13-1.65 1.17-.45.04-.87.2-2.94-.62-2.49-.98-4.06-3.52-4.19-3.68-.12-.16-1-1.33-1-2.53 0-1.2.64-1.79.86-2.04.23-.25.5-.31.66-.31h.47c.15 0 .35-.06.55.42.2.5.7 1.73.76 1.86.06.13.1.28.02.44-.09.16-.13.27-.25.41-.13.15-.27.33-.38.44-.13.13-.25.26-.11.51.15.25.65 1.07 1.4 1.73.96.86 1.77 1.12 2.02 1.25.25.12.4.1.54-.06.15-.16.62-.71.78-.96.16-.26.33-.21.55-.13.22.08 1.42.67 1.67.8.25.12.42.18.48.28.06.1.06.6-.14 1.18z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        <Link
          href="/#quote"
          onClick={() => setOpen(false)}
          className="mt-auto bg-orange text-white text-center text-sm font-semibold py-3.5 rounded-md hover:brightness-95 transition"
        >
          Get a Quote
        </Link>
      </nav>
    </header>
  );
}
