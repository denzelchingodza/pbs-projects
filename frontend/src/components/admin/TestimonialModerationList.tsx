"use client";

/**
 * Real customers can submit their own testimonial from the site now (see
 * app/testimonial/page.tsx), it lands here as "pending" and stays off the
 * homepage until approved, so nothing unmoderated goes public automatically.
 *
 * Deleting one now goes through the shared ConfirmDialog instead of the
 * browser's native confirm() popup, and both approving and deleting show
 * a real toast message inside the app when they succeed.
 */
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { approveTestimonial, deleteTestimonial } from "@/lib/adminApi";
import type { Testimonial } from "@/types";

export default function TestimonialModerationList({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[];
  onChange: (updated: Testimonial) => void;
}) {
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [confirmTestimonial, setConfirmTestimonial] = useState<Testimonial | null>(null);

  async function handleApprove(t: Testimonial) {
    setBusyId(t.id);
    try {
      const updated = await approveTestimonial(t.id);
      onChange(updated);
      showToast("Testimonial approved, now showing on the homepage.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to approve.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!confirmTestimonial) return;
    setBusyId(confirmTestimonial.id);
    try {
      await deleteTestimonial(confirmTestimonial.id);
      setRemovedIds((prev) => new Set(prev).add(confirmTestimonial.id));
      showToast("Testimonial deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete.", "error");
    } finally {
      setBusyId(null);
      setConfirmTestimonial(null);
    }
  }

  const visible = testimonials.filter((t) => !removedIds.has(t.id));

  if (visible.length === 0) {
    return <p className="text-sm text-neutral-400">No testimonials yet.</p>;
  }

  return (
    <div>
      <div className="grid gap-4">
        {visible.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
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
                onClick={() => setConfirmTestimonial(t)}
                disabled={busyId === t.id}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
              >
                {busyId === t.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmTestimonial !== null}
        title="Delete this testimonial?"
        message={
          confirmTestimonial
            ? `The testimonial from ${confirmTestimonial.client_name} will be permanently deleted. This cannot be undone.`
            : ""
        }
        busy={confirmTestimonial !== null && busyId === confirmTestimonial.id}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTestimonial(null)}
      />
    </div>
  );
}
