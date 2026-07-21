"use client";

/**
 * Posts directly to the backend's POST /api/testimonials/. Includes the same
 * honeypot pattern as the quote form (see components/quote/QuoteForm.tsx and
 * backend/app/schemas/testimonial.py): a hidden "website" field real visitors
 * never fill in, bots that auto-fill every field do, a non-empty value gets
 * silently rejected as spam.
 *
 * Submissions land as "pending" and don't show on the homepage until the
 * admin approves them (see routers/admin.py), the success message here says
 * so plainly rather than implying it's live right away.
 */
import { useState } from "react";
import { submitTestimonial } from "@/lib/api";

const RATINGS = [5, 4, 3, 2, 1];

export default function TestimonialForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("website")) {
      setStatus("success"); // pretend success to the bot, don't tip it off
      return;
    }

    try {
      await submitTestimonial({
        client_name: String(data.get("client_name") || ""),
        client_role: String(data.get("client_role") || "") || undefined,
        quote: String(data.get("quote") || ""),
        rating: Number(data.get("rating")) || 5,
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong sending your testimonial. Please try again, or WhatsApp us directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-orange text-white flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h3 className="font-semibold text-lg text-dark">Thank You!</h3>
        <p className="text-sm text-neutral-500 mt-2">
          We appreciate you taking the time. It will show on the site once
          we&apos;ve had a look, usually within a day or two.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
      {/* Honeypot, visually hidden, but present in the DOM for bots to find */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <label className="block text-sm font-medium mb-1">Your Name</label>
      <input
        name="client_name"
        required
        placeholder="e.g. Tendai Moyo"
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      <label className="block text-sm font-medium mb-1">Role (optional)</label>
      <input
        name="client_role"
        placeholder="e.g. Homeowner, Waterfalls"
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      <label className="block text-sm font-medium mb-1">Rating</label>
      <select
        name="rating"
        defaultValue={5}
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      >
        {RATINGS.map((r) => (
          <option key={r} value={r}>
            {"★".repeat(r)}
            {"☆".repeat(5 - r)} ({r} of 5)
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">Your Experience</label>
      <textarea
        name="quote"
        required
        rows={4}
        placeholder="Tell us how the job went..."
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      {status === "error" && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-orange text-white font-semibold py-3 rounded-md hover:brightness-95 transition disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Submit Testimonial"}
      </button>
    </form>
  );
}
