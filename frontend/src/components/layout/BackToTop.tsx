"use client";

/**
 * A small floating "back to top" button, appears once you've scrolled past
 * the hero, the same touch funema.co uses after its portfolio section.
 * Sits to the left of the WhatsApp float (bottom-6 right-24, not stacked
 * above it) so it never competes with WhatsApp's own popup chat bubble,
 * which already grows upward from that corner (see WhatsAppFloat.tsx).
 *
 * White with a thin border instead of solid orange, a floating button
 * that's visible on every page from partway down is exactly the kind of
 * small, constant surface where solid orange stacks up fastest, orange
 * shows up here only as the arrow's hover color.
 */
import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 500;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-24 z-50 w-12 h-12 rounded-full bg-white border border-neutral-200 text-dark shadow-md flex items-center justify-center hover:text-orange hover:border-orange transition-all ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
