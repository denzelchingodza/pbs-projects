/**
 * A slim contact strip above the main navigation, phone and email, right
 * where a visitor's eye lands first. PBS actually had this once before and
 * it was removed (see Navbar.tsx's header notes, Stage 18) for crowding a
 * single-bar header with too much at once. Bringing it back now as its own
 * separate, deliberately understated bar, not stacked on top of the busy
 * white nav bar this time, so it can hold real contact info without
 * competing with the logo and links directly below it. Not sticky on
 * purpose, it scrolls away with the page, only the main nav bar (Navbar.tsx)
 * stays pinned once you've scrolled past this.
 *
 * Hidden below the sm breakpoint, a phone's already-narrow header has no
 * room for a second row of small text, and the same phone number and a
 * WhatsApp link already live in the mobile drawer (see Navbar.tsx).
 */
import type { SiteSettings } from "@/types";

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

export default function TopBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="hidden sm:block bg-dark text-white/70 text-xs">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between">
        <span className="font-medium tracking-wide">{settings.address}</span>
        <div className="flex items-center gap-5">
          <a
            href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 hover:text-orange transition-colors"
          >
            <PhoneIcon />
            {settings.phone_primary}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-1.5 hover:text-orange transition-colors"
          >
            <MailIcon />
            {settings.email}
          </a>
        </div>
      </div>
    </div>
  );
}
