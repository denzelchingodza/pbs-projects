"use client";

/**
 * Admin sidebar (becomes a horizontal scrollable bar on mobile, since a
 * fixed sidebar doesn't work on a small screen). Highlights the active
 * section and handles logout, no other admin page needs to know about
 * routing or the token, that's all contained here.
 *
 * Redesign notes: matches the same design language as the public site's
 * clean corporate look, an orange left accent bar marks the active
 * section instead of a plain background tint, and Log Out is now a clear
 * red-bordered pill rather than blending in with the other links, so it
 * reads as a distinct, deliberate action instead of just another page.
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

const LINKS: { href: string; label: string; badgeKey?: "quotes" | "testimonials" }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/quotes", label: "Quotes", badgeKey: "quotes" },
  { href: "/admin/testimonials", label: "Testimonials", badgeKey: "testimonials" },
  { href: "/admin/settings", label: "Settings" },
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
    <nav className="md:w-60 shrink-0 bg-white border-b md:border-b-0 md:border-r border-neutral-200 md:min-h-screen md:flex md:flex-col">
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
          className="px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors border-l-[3px] border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-dark flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span>{link.label}</span>
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
        <button
          onClick={handleLogout}
          className="md:mt-auto text-left px-4 py-2.5 mt-2 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
