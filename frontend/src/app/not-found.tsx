/**
 * Custom 404, shown for any URL that doesn't match a real route. Next.js
 * falls back to a plain, unbranded "404 | This page could not be found"
 * page if this file doesn't exist, which is exactly the kind of detail
 * that makes a site feel unfinished. This one keeps the site's own
 * chrome (Navbar/Footer still render around it, since not-found.tsx sits
 * inside the same root layout as every other page) and the same visual
 * language as everywhere else: a giant faint watermark number behind the
 * heading, and a couple of real ways back into the site instead of a
 * dead end.
 */
import type { Metadata } from "next";
import Watermark from "@/components/ui/Watermark";
import PillButton from "@/components/ui/PillButton";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main>
      <section className="relative px-6 md:px-8 py-28 md:py-36 bg-neutral-50 overflow-hidden">
        <Watermark text="404" />
        <div className="max-w-lg mx-auto relative text-center">
          <p className="font-display text-dark/60 text-xs font-medium uppercase tracking-[0.2em] mb-3">
            Error 404
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-dark tracking-tight">
            This page doesn&apos;t exist
          </h1>
          <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">
            The page you were looking for may have moved or never existed.
            Here are a few places that definitely do.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <PillButton href="/" variant="solid">
              Back to Home
            </PillButton>
            <PillButton href="/gallery" variant="outlineDark">
              View Our Work
            </PillButton>
          </div>
        </div>
      </section>
    </main>
  );
}
