"use client";

/**
 * Posts directly to the backend's POST /api/quotes/. Includes the honeypot
 * field the backend checks for (see backend/app/schemas/quote.py) — a hidden
 * input named "website" that real visitors never see or fill in, but that
 * simple bots which auto-fill every field on a form will populate. If it's
 * non-empty, the backend silently rejects the submission as spam.
 */
import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { Product } from "@/types";

export default function QuoteForm({ products }: { products: Product[] }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check on the client too, so a filled-in trap field never even
    // reaches the network — the backend re-checks this regardless.
    if (data.get("website")) {
      setStatus("success"); // pretend success to the bot, don't tip it off
      return;
    }

    try {
      await apiPost("/quotes/", {
        full_name: data.get("full_name"),
        phone: data.get("phone"),
        product: data.get("product"),
        details: data.get("details"),
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong sending your request. Please try again, or WhatsApp us directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-orange text-white flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h3 className="font-semibold text-lg text-dark">Request Sent!</h3>
        <p className="text-sm text-neutral-500 mt-2">
          Thanks, we&apos;ll be in touch shortly to follow up on your quote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
      {/* Honeypot — visually hidden, but present in the DOM for bots to find */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <label className="block text-sm font-medium mb-1">Full Name</label>
      <input
        name="full_name"
        required
        placeholder="e.g. Tendai Moyo"
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone / WhatsApp</label>
          <input
            name="phone"
            required
            placeholder="+263 ..."
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            name="product"
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          >
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="block text-sm font-medium mb-1">Tell us about the job</label>
      <textarea
        name="details"
        rows={4}
        placeholder="Rough size, location, timeline..."
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      {status === "error" && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-orange text-white font-semibold py-3 rounded-md hover:brightness-95 transition disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send Request"}
      </button>
    </form>
  );
}
