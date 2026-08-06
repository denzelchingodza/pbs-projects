"use client";

/**
 * Table of quote requests, each row's status is a real dropdown that calls
 * PATCH /api/admin/quotes/{id} on change, moving it through the lead
 * pipeline documented in docs/project-brief.md: new -> contacted -> quoted
 * -> won / lost. Renders as stacked cards on mobile instead of a squeezed
 * table, since this data has too many fields to fit a phone-width table.
 *
 * Delete notes: a lead can only be deleted once it has actually been
 * visited, contacted or further along, a brand new "New" lead can't be
 * removed by accident before anyone has followed up on it, the backend
 * enforces this too so it can't be bypassed from the browser. The
 * confirmation itself uses the shared ConfirmDialog rather than the
 * browser's own native confirm() popup, and both a status change and a
 * delete show a real toast message inside the app when they succeed.
 */
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { deleteQuote, updateQuoteStatus } from "@/lib/adminApi";
import type { AdminQuote, QuoteStatus } from "@/types";

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

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
  onDeleted,
}: {
  quotes: AdminQuote[];
  onChange: (updated: AdminQuote) => void;
  onDeleted: (id: number) => void;
}) {
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmQuote, setConfirmQuote] = useState<AdminQuote | null>(null);

  async function handleStatusChange(quote: AdminQuote, status: QuoteStatus) {
    setUpdatingId(quote.id);
    try {
      const updated = await updateQuoteStatus(quote.id, { status });
      onChange(updated);
      showToast("Status updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmQuote) return;
    setDeletingId(confirmQuote.id);
    try {
      await deleteQuote(confirmQuote.id);
      onDeleted(confirmQuote.id);
      showToast("Quote request deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete quote.", "error");
    } finally {
      setDeletingId(null);
      setConfirmQuote(null);
    }
  }

  if (quotes.length === 0) {
    return <p className="text-sm text-neutral-500">No quote requests yet.</p>;
  }

  return (
    <div>
      <div className="grid gap-4">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-bold text-dark text-base">{q.full_name}</div>
                <a
                  href={`tel:${q.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-orange mt-0.5 transition-colors"
                >
                  <PhoneIcon />
                  {q.phone}
                </a>
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[q.status]}`}
              >
                {q.status}
              </span>
            </div>

            {(q.product || q.details) && (
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 mb-4">
                {q.product && (
                  <p className="text-sm text-neutral-600 mb-1 last:mb-0">
                    <span className="font-medium text-dark">Product:</span> {q.product}
                  </p>
                )}
                {q.details && <p className="text-sm text-neutral-600 last:mb-0">{q.details}</p>}
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
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

              {q.status !== "new" && (
                <button
                  onClick={() => setConfirmQuote(q)}
                  disabled={deletingId === q.id}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  <TrashIcon />
                  {deletingId === q.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmQuote !== null}
        title="Delete this quote request?"
        message={
          confirmQuote
            ? `The quote request from ${confirmQuote.full_name} will be permanently deleted. This cannot be undone.`
            : ""
        }
        busy={confirmQuote !== null && deletingId === confirmQuote.id}
        onConfirm={handleDelete}
        onCancel={() => setConfirmQuote(null)}
      />
    </div>
  );
}
