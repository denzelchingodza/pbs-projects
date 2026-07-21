"use client";

/**
 * Wraps every /admin/* route. A Client Component (needs localStorage + a
 * redirect), so unlike the public RootLayout it can't fetch settings with
 * await, it checks the admin session in the browser instead.
 *
 * The login page is also nested under /admin, so it renders through this
 * same layout, it's special-cased below (no auth check, no sidebar) so
 * there's no redirect loop between "not logged in" and "go to login."
 */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { getCurrentAdmin } from "@/lib/adminApi";
import { getToken } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }

    getCurrentAdmin()
      .then(() => setChecked(true))
      .catch(() => router.replace("/admin/login"));
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-400 text-sm">
        Checking admin session...
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 md:flex">
        <AdminNav />
        <main className="flex-1 px-6 md:px-10 py-8 md:py-10 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </ToastProvider>
  );
}
