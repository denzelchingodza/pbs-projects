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
 *
 * Language notes: the small EN / SN switch (LanguageToggle.tsx) lives here
 * since the header is the one place present on every page, nav labels use
 * <T> (see components/i18n/T.tsx) so they follow whichever language is
 * currently selected, same as the translated text further down the page.
 *
 * Second mobile drawer pass: the first version read as a plain list of
 * links dropped into a dark box, a lot of empty space and no real visual
 * design, like the desktop nav just narrowed down rather than a menu built
 * for a phone. Each link now carries its own icon and a left accent bar on
 * the current page, the phone/WhatsApp contact block is now a distinct
 * card instead of two bare lines of text, and the drawer plus its backdrop
 * now sit above the floating WhatsApp button (WhatsAppFloat.tsx, also
 * fixed position at the same bottom right corner) instead of it bleeding
 * through the open menu, which was the biggest source of the cluttered
 * look, two separate WhatsApp entry points fighting for the same corner
 * of the screen at once.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Motto from "@/components/ui/Motto";
import T from "@/components/i18n/T";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import type { SiteSettings } from "@/types";

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

function WorkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.83 0L6 21" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", key: "nav.home", icon: HomeIcon },
  { href: "/#work", key: "nav.ourWork", icon: WorkIcon },
  { href: "/#products", key: "nav.products", icon: ProductsIcon },
  { href: "/about", key: "nav.about", icon: AboutIcon },
];

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
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

  // Escape closes the drawer, same as tapping the backdrop, a keyboard-only
  // visitor has no other way to dismiss it once it's open.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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
        <div className="flex items-center gap-3">
          <Link href="/" className="px-1">
            <Logo />
          </Link>
          <span className="hidden sm:block w-px h-6 bg-neutral-200" aria-hidden="true" />
          <Motto className="hidden sm:inline-block text-dark text-xs" />
        </div>

        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark/80 hover:text-orange transition-colors"
            >
              <T k={link.key} />
            </Link>
          ))}
          <Link
            href="/#quote"
            className="bg-orange text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:brightness-95 transition"
          >
            <T k="nav.getQuote" />
          </Link>
          <LanguageToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          <button
            className="text-2xl text-dark"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Backdrop — dims and blocks the page behind the drawer, tap to close.
          z-[55], above the floating WhatsApp button's z-50, so it's fully
          covered (and untappable) the moment the menu opens, instead of
          showing through the dimmed backdrop like a second, competing
          WhatsApp entry point. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile menu panel. z-[60], above the backdrop and the floating
          WhatsApp button, so the open drawer fully owns that corner of the
          screen instead of the float bleeding through on top of it. */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`md:hidden fixed top-0 right-0 h-screen w-[78%] max-w-xs bg-dark flex flex-col p-6 transition-transform duration-300 z-[60] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <Logo dark />
            <Motto className="text-white/70 text-[10px] block mt-1" />
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 text-base font-semibold px-3 py-3 rounded-md transition-colors border-l-[3px] ${
                  active
                    ? "bg-white/10 text-white border-orange"
                    : "text-white/90 hover:bg-white/5 border-transparent"
                }`}
              >
                <Icon />
                <T k={link.key} />
              </Link>
            );
          })}
        </div>

        {/* Contact block: a distinct card instead of two bare lines of text,
            same visual treatment (icon + label) as the nav links above it,
            so the drawer reads as one designed surface rather than a list
            with an afterthought tacked on underneath. */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-3.5">
            <a
              href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              <PhoneIcon />
              {settings.phone_primary}
            </a>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm font-medium text-[#25D366] hover:brightness-110 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm4.51 12.02c-.2.58-1.2 1.13-1.65 1.17-.45.04-.87.2-2.94-.62-2.49-.98-4.06-3.52-4.19-3.68-.12-.16-1-1.33-1-2.53 0-1.2.64-1.79.86-2.04.23-.25.5-.31.66-.31h.47c.15 0 .35-.06.55.42.2.5.7 1.73.76 1.86.06.13.1.28.02.44-.09.16-.13.27-.25.41-.13.15-.27.33-.38.44-.13.13-.25.26-.11.51.15.25.65 1.07 1.4 1.73.96.86 1.77 1.12 2.02 1.25.25.12.4.1.54-.06.15-.16.62-.71.78-.96.16-.26.33-.21.55-.13.22.08 1.42.67 1.67.8.25.12.42.18.48.28.06.1.06.6-.14 1.18z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <Link
          href="/#quote"
          onClick={() => setOpen(false)}
          className="mt-auto bg-orange text-white text-center text-sm font-semibold py-3.5 rounded-md hover:brightness-95 transition"
        >
          <T k="nav.getQuote" />
        </Link>
      </nav>
    </header>
  );
}
