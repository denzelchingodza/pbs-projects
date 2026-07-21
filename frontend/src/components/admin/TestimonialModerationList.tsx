"use client";

/**
 * Real customers can submit their own testimonial from the site now (see
 * app/testimonial/page.tsx), it lands here as "pending" and stays off the
 * homepage until approved, so nothing unmoderated goes public automatically.
 */
import { useState } from "react";
import { approveTestimonial, deleteTestimonial } from "@/lib/adminApi";
import type { Testimonial } from "@/types";

export default function TestimonialModerationList({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[];
  onChange: (updated: Testimonial) => void;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  async function handleApprove(t: Testimonial) {
    setBusyId(t.id);
    setError("");
    try {
      const updated = await approveTestimonial(t.id);
      onChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(t: Testimonial) {
    if (!confirm("Delete this testimonial? This can't be undone.")) return;
    setBusyId(t.id);
    setError("");
    try {
      await deleteTestimonial(t.id);
      setRemovedIds((prev) => new Set(prev).add(t.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = testimonials.filter((t) => !removedIds.has(t.id));

  if (visible.length === 0) {
    return <p className="text-sm text-neutral-400">No testimonials yet.</p>;
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="grid gap-4">
        {visible.map((t) => (
          <div key={t.id} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-semibold text-dark">{t.client_name}</div>
                {t.client_role && <div className="text-sm text-neutral-500">{t.client_role}</div>}
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${
                  t.status === "pending" ? "bg-orange/10 text-orange" : "bg-green-50 text-green-700"
                }`}
              >
                {t.status}
              </span>
            </div>

            <div className="text-orange text-sm mb-2 tracking-wide">
              {"★".repeat(t.rating)}
              <span className="text-neutral-300">{"★".repeat(5 - t.rating)}</span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>

            <div className="flex gap-4">
              {t.status === "pending" && (
                <button
                  onClick={() => handleApprove(t)}
                  disabled={busyId === t.id}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 disabled:opacity-60"
                >
                  {busyId === t.id ? "Approving..." : "Approve"}
                </button>
              )}
              <button
                onClick={() => handleDelete(t)}
                disabled={busyId === t.id}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
              >
                {busyId === t.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
