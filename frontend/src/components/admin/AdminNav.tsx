"use client";

/**
 * Admin sidebar (becomes a horizontal scrollable bar on mobile, since a
 * fixed sidebar doesn't work on a small screen). Highlights the active
 * section and handles logout, no other admin page needs to know about
 * routing or the token, that's all contained here.
 *
 * Redesign notes: each section now has its own icon next to the label, so
 * the sidebar can be scanned at a glance instead of reading five lines of
 * plain text, an orange left accent bar still marks the active section.
 * There is deliberately no "signed in as" name shown anywhere here: this
 * is a single shared admin login used by more than one person, so naming
 * whoever happens to be the account's on-file name would misrepresent it
 * as one specific person's personal account.
 *
 * Notification badges: Quotes and Testimonials each carry a small count,
 * new (unhandled) quote requests and pending (unmoderated) testimonials,
 * so it's obvious something needs attention without opening every section
 * to check. Counts are fetched here (not on the dashboard) since this is
 * the one place present on every admin page, refreshed on every navigation
 * and again every 45 seconds while the panel sits open.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { getAdminQuotes, getAdminTestimonials, logout } from "@/lib/adminApi";

function DashboardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.83 0L6 21" />
    </svg>
  );
}

function QuotesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function TestimonialsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const LINKS: {
  href: string;
  label: string;
  icon: () => JSX.Element;
  badgeKey?: "quotes" | "testimonials";
}[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/gallery", label: "Gallery", icon: GalleryIcon },
  { href: "/admin/quotes", label: "Quotes", icon: QuotesIcon, badgeKey: "quotes" },
  { href: "/admin/testimonials", label: "Testimonials", icon: TestimonialsIcon, badgeKey: "testimonials" },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

// How often to re-check while the panel is open. A plain interval is
// enough for a two-person business checking this from one device at a
// time, nothing fancier (websockets, push) is worth the complexity here.
const POLL_MS = 45_000;

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState({ quotes: 0, testimonials: 0 });

  useEffect(() => {
    let cancelled = false;

    function refreshCounts() {
      Promise.all([getAdminQuotes(), getAdminTestimonials()])
        .then(([quotes, testimonials]) => {
          if (cancelled) return;
          setCounts({
            quotes: quotes.filter((q) => q.status === "new").length,
            testimonials: testimonials.filter((t) => t.status === "pending").length,
          });
        })
        .catch(() => {
          // A failed check just leaves the badges at their last known
          // value rather than showing an error in the sidebar.
        });
    }

    refreshCounts();
    const interval = setInterval(refreshCounts, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <nav className="md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-neutral-200 md:min-h-screen md:flex md:flex-col">
      <div className="px-6 py-5 border-b border-neutral-100 hidden md:block">
        <Logo />
        <p className="text-xs text-neutral-500 mt-2 uppercase tracking-widest font-semibold">Admin Panel</p>
      </div>

      <div className="flex md:flex-col px-3 py-3 gap-1 overflow-x-auto md:overflow-visible md:flex-1">
        {/* Opens in a new tab on purpose: it's a quick way to check what a
            real visitor sees, not a way to navigate away from the admin
            session, the admin tab stays exactly where it was. */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors border-l-[3px] border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-dark flex items-center gap-2.5"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
          View Site
        </a>

        <div className="hidden md:block border-t border-neutral-100 my-2" />

        {LINKS.map((link) => {
          const active = pathname === link.href;
          const badgeCount = link.badgeKey ? counts[link.badgeKey] : 0;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors border-l-[3px] flex items-center justify-between gap-3 ${
                active
                  ? "bg-orange/10 text-orange border-orange"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon />
                {link.label}
              </span>
              {badgeCount > 0 && (
                <span
                  className="bg-orange text-white text-[11px] font-bold leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  aria-label={`${badgeCount} ${badgeCount === 1 ? "item needs" : "items need"} attention`}
                >
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="md:mt-auto md:pt-3 md:border-t border-neutral-100 ml-2 md:ml-0">
          <button
            onClick={handleLogout}
            className="text-left px-4 py-2.5 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
