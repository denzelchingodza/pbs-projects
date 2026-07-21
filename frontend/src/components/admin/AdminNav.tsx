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
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { logout } from "@/lib/adminApi";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <nav className="md:w-60 shrink-0 bg-white border-b md:border-b-0 md:border-r border-neutral-200 md:min-h-screen md:flex md:flex-col">
      <div className="px-6 py-5 border-b border-neutral-100 hidden md:block">
        <Logo />
        <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest font-semibold">Admin Panel</p>
      </div>

      <div className="flex md:flex-col px-3 py-3 gap-1 overflow-x-auto md:overflow-visible md:flex-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors border-l-[3px] ${
                active
                  ? "bg-orange/10 text-orange border-orange"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent"
              }`}
            >
              {link.label}
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
