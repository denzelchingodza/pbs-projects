"use client";

/**
 * The public Navbar/Footer/WhatsApp button shouldn't show above the admin
 * panel, which has its own sidebar nav. RootLayout (app/layout.tsx) is a
 * Server Component so it can't check the current path itself; this small
 * Client Component does that one check and hides its children on any
 * /admin/* route.
 */
import { usePathname } from "next/navigation";

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
