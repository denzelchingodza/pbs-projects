"use client";

/**
 * A thin vertical rail on the right edge of the screen that fills in as you
 * scroll down the homepage, the same scroll-progress cue used on the
 * funema.co reference site's portfolio section. Purely a "how far through
 * the page am I" cue, no navigation function, so it's `aria-hidden` and
 * skipped entirely below the `lg` breakpoint, a thin rail has no real room
 * to matter on a phone-width screen, and the homepage is already fairly
 * short there.
 */
import { useEffect, useState } from "react";

export default function ScrollProgressRail() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block fixed top-0 right-0 z-40 h-screen w-[3px] bg-neutral-200/60"
    >
      <div className="w-full bg-orange" style={{ height: `${progress}%` }} />
    </div>
  );
}
