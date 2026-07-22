"use client";

/**
 * A styled, in-app replacement for the browser's native confirm() popup.
 * confirm() shows a plain system dialog that looks nothing like the rest
 * of the app (no logo, no brand color, not even the same font), this
 * renders as a real card over a dimmed backdrop instead, matching the
 * admin panel's own design. Used anywhere a destructive action (deleting
 * a photo, a whole project, a quote, or a testimonial) needs a "are you
 * sure" step before it actually happens.
 *
 * role="dialog"/aria-modal tell a screen reader this is a modal, not just
 * another chunk of the page, and Escape closes it the same way clicking
 * the backdrop does, so a keyboard-only user isn't stuck once it's open.
 */
import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="font-bold text-dark text-lg mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-sm font-semibold text-neutral-500 px-4 py-2.5 rounded-md hover:bg-neutral-100 transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`text-sm font-semibold text-white px-4 py-2.5 rounded-md transition disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-orange hover:brightness-95"
            }`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
