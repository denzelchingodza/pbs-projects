/**
 * Floating WhatsApp button, shown on every page. Uses the wa.me link format,
 * which opens WhatsApp (app or web) with a pre-filled message — no WhatsApp
 * Business API integration needed for this, it's just a formatted link.
 */
import type { SiteSettings } from "@/types";

export default function WhatsAppFloat({ settings }: { settings: SiteSettings }) {
  const digits = settings.whatsapp_number.replace(/[^\d]/g, "");
  const message = encodeURIComponent("Hi PBS Projects, I'd like to ask about a quote.");

  return (
    <a
      href={`https://wa.me/${digits}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      💬
    </a>
  );
}
