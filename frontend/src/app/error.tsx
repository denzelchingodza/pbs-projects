"use client";

/**
 * Catches any runtime error thrown while rendering a page (a bad API
 * response, a bug, anything unexpected), instead of Next.js falling back
 * to its own generic, unbranded error screen. Must be a Client Component,
 * this is how Next.js's error boundaries work (see error.tsx docs), and it
 * still renders inside the root layout, so Navbar/Footer stay in place
 * around it rather than a blank crashed page.
 *
 * No real error-tracking service (e.g. Sentry) is wired up yet, so this
 * logs to the browser console for now, at least visible in dev tools
 * rather than silently swallowed. Wiring up real error tracking would be
 * a good next step once the site has real traffic worth watching.
 */
import { useEffect } from "react";
import Watermark from "@/components/ui/Watermark";
import PillButton from "@/components/ui/PillButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PBS Projects: unhandled page error", error);
  }, [error]);

  return (
    <main>
      <section className="relative px-6 md:px-8 py-28 md:py-36 bg-neutral-50 overflow-hidden">
        <Watermark text="Oops" />
        <div className="max-w-lg mx-auto relative text-center">
          <p className="font-display text-dark/60 text-xs font-medium uppercase tracking-[0.2em] mb-3">
            Something Went Wrong
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-dark tracking-tight">
            This page hit a snag
          </h1>
          <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">
            Something went wrong loading this page. It&apos;s usually
            temporary, try again, or head back to the homepage.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={reset}
              className="shine-hover font-display inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-medium text-sm transition bg-orange border border-orange text-white hover:brightness-95"
            >
              Try Again
            </button>
            <PillButton href="/" variant="outlineDark">
              Back to Home
            </PillButton>
          </div>
        </div>
      </section>
    </main>
  );
}
