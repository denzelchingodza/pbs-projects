"use client";

/**
 * Floating WhatsApp button, shown on every public page. Uses the wa.me
 * link format, which opens WhatsApp (app or web) with a pre-filled
 * message, no WhatsApp Business API integration needed for this, it's
 * just a formatted link.
 *
 * Redesign notes: swapped the generic speech-bubble emoji for the real
 * WhatsApp glyph (inline SVG, so it's crisp and exactly on-brand green,
 * not font-dependent), and added a soft pulsing ring behind the button so
 * it reads as a live, tappable action rather than a static icon sitting
 * in the corner.
 *
 * Chat bubble notes: instead of only showing "Chat with us" on hover
 * (desktop only, easy to miss, invisible on touch devices), a real
 * speech bubble now pops open on its own a couple of seconds after the
 * page loads, like a real chat widget greeting a visitor, with a close
 * button so it does not linger forever. It only pops up once per visit.
 */
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/types";

const POPUP_DELAY_MS = 2500;

export default function WhatsAppFloat({ settings }: { settings: SiteSettings }) {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const digits = settings.whatsapp_number.replace(/[^\d]/g, "");
  const message = encodeURIComponent("Hi PBS Projects, I'd like to ask about a quote.");

  useEffect(() => {
    const timer = setTimeout(() => setBubbleOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {bubbleOpen && (
        <div className="relative max-w-[220px] bg-white text-dark text-sm rounded-2xl rounded-br-sm shadow-xl border border-neutral-100 px-4 py-3 animate-chat-pop">
          <button
            onClick={() => setBubbleOpen(false)}
            aria-label="Dismiss message"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 text-xs flex items-center justify-center hover:bg-neutral-300 transition-colors"
          >
            &times;
          </button>
          <p className="font-semibold mb-0.5">Need help with a project?</p>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Chat to us, or reach us here on WhatsApp, we usually reply fast.
          </p>
        </div>
      )}

      <a
        href={`https://wa.me/${digits}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366]/50 animate-ping" />
        <span className="relative w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm0 1.67c2.19 0 4.25.85 5.8 2.4a8.18 8.18 0 0 1 2.41 5.84c0 4.55-3.71 8.24-8.25 8.24a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.27-4.38c0-4.55 3.71-8.21 8.31-8.21zm-4.55 4.7c-.16 0-.43.06-.66.31-.22.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.13.16 1.7 2.7 4.19 3.68 2.07.82 2.49.66 2.94.62.45-.04 1.45-.6 1.65-1.17.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.28-.25-.13-1.45-.72-1.67-.8-.22-.08-.39-.13-.55.13-.16.25-.63.8-.78.96-.14.16-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.44-.06-.13-.55-1.36-.76-1.86-.2-.48-.4-.42-.55-.42h-.47z" />
          </svg>
        </span>
      </a>
    </div>
  );
}
