"use client";

/**
 * Table of quote requests, each row's status is a real dropdown that calls
 * PATCH /api/admin/quotes/{id} on change, moving it through the lead
 * pipeline documented in docs/project-brief.md: new -> contacted -> quoted
 * -> won / lost. Renders as stacked cards on mobile instead of a squeezed
 * table, since this data has too many fields to fit a phone-width table.
 */
import { useState } from "react";
import { updateQuoteStatus } from "@/lib/adminApi";
import type { AdminQuote, QuoteStatus } from "@/types";

const STATUSES: QuoteStatus[] = ["new", "contacted", "quoted", "won", "lost"];

const STATUS_STYLES: Record<QuoteStatus, string> = {
  new: "bg-orange/10 text-orange",
  contacted: "bg-blue-50 text-blue-700",
  quoted: "bg-amber-50 text-amber-700",
  won: "bg-green-50 text-green-700",
  lost: "bg-neutral-100 text-neutral-500",
};

export default function QuoteTable({
  quotes,
  onChange,
}: {
  quotes: AdminQuote[];
  onChange: (updated: AdminQuote) => void;
}) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleStatusChange(quote: AdminQuote, status: QuoteStatus) {
    setUpdatingId(quote.id);
    setError("");
    try {
      const updated = await updateQuoteStatus(quote.id, { status });
      onChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (quotes.length === 0) {
    return <p className="text-sm text-neutral-400">No quote requests yet.</p>;
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="grid gap-4">
        {quotes.map((q) => (
          <div key={q.id} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-semibold text-dark">{q.full_name}</div>
                <a href={`tel:${q.phone.replace(/\s/g, "")}`} className="text-sm text-neutral-500 hover:text-orange">
                  {q.phone}
                </a>
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[q.status]}`}
              >
                {q.status}
              </span>
            </div>

            {q.product && (
              <p className="text-sm text-neutral-600 mb-1">
                <span className="font-medium text-dark">Product:</span> {q.product}
              </p>
            )}
            {q.details && <p className="text-sm text-neutral-600 mb-3">{q.details}</p>}

            <label className="block text-xs font-medium text-neutral-500 mb-1">Update Status</label>
            <select
              value={q.status}
              disabled={updatingId === q.id}
              onChange={(e) => handleStatusChange(q, e.target.value as QuoteStatus)}
              className="border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow disabled:opacity-60"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
