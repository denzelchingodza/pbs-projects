"use client";

/**
 * Admin sidebar (becomes a horizontal scrollable bar on mobile, since a
 * fixed sidebar doesn't work on a small screen). Highlights the active
 * section and handles logout, no other admin page needs to know about
 * routing or the token, that's all contained here.
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
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <nav className="md:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r border-neutral-200 md:min-h-screen md:flex md:flex-col">
      <div className="px-6 py-5 border-b border-neutral-100 hidden md:block">
        <Logo />
        <p className="text-xs text-neutral-400 mt-1.5">Admin Panel</p>
      </div>

      <div className="flex md:flex-col px-3 py-3 gap-1 overflow-x-auto md:overflow-visible md:flex-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-orange/10 text-orange" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="md:mt-auto text-left px-4 py-2.5 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-red-600 transition-colors whitespace-nowrap"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
