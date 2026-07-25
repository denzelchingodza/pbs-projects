"use client";

/**
 * Real login form, posts to POST /api/auth/login (see backend build log
 * Stage 2). On success the token is stored (lib/adminApi -> lib/auth) and
 * we redirect straight to the dashboard, on failure the backend's real
 * "Incorrect email or password." message is shown, not a generic one.
 *
 * Redesign notes: this used to be a plain white card on a gray background,
 * indistinguishable from any login template. Now a real PBS Projects
 * moment, a split screen on larger screens with an actual jobsite photo
 * (the same hero.jpg used on the homepage) as a dark, branded backdrop on
 * the left carrying the motto, and the form itself on the right. On a
 * phone, where there's no room for a second panel, the motto sits above
 * the form card instead so the branding still shows before the form does.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/ui/Logo";
import Motto from "@/components/ui/Motto";
import { login } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-neutral-50">
      {/* Brand panel: hidden below lg, there just isn't room for a second
          panel on a phone without squeezing the form. A real jobsite photo
          instead of a flat color, dimmed and darkened so the white text
          and motto stay easily readable over it, plus a soft orange glow
          in the corner, the same accent treatment the homepage hero uses
          behind its own photo. */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark">
        <Image src="/images/hero.jpg" alt="" fill priority className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/85 to-dark/50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange/25 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo dark />
          <div>
            <Motto className="text-white text-3xl block mb-4" />
            <p className="text-white/70 text-sm max-w-xs leading-relaxed">
              The control room behind every quote, project photo, and
              testimonial on the PBS Projects site.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center lg:hidden mb-8">
            <Logo />
            <Motto className="text-dark text-sm mt-3" />
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg shadow-neutral-200/60">
            <h1 className="text-xl font-bold text-dark text-center mb-1">Admin Login</h1>
            <p className="text-sm text-neutral-500 text-center mb-7">
              Sign in to manage quotes, gallery photos, and testimonials.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
              />

              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
              />

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange text-white font-semibold py-3 rounded-md hover:brightness-95 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            PBS Projects admin panel. Not for public access.
          </p>
        </div>
      </div>
    </main>
  );
}
