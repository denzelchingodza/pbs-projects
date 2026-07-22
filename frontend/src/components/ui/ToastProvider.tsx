"use client";

/**
 * A small in-app notification system for the admin panel. Before this,
 * confirming a delete used the browser's own native confirm() popup, a
 * plain, unstyled system dialog that looks nothing like the rest of the
 * app, and successful actions (saving an edit, uploading a photo,
 * approving a testimonial) often had no visible confirmation at all
 * beyond the page quietly refreshing. useToast() lets any admin component
 * push a real, styled message that appears inside the app itself, stacked
 * in the corner, and clears itself after a few seconds (or on click).
 */
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "success" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* aria-live announces new toasts to screen readers as they appear,
          without this, someone using a screen reader saving an edit or
          deleting a photo gets no confirmation at all, sighted admins see
          the toast, nobody else knows the action actually went through. */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2.5 items-end"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`max-w-xs text-left text-sm font-medium text-white px-4 py-3 rounded-lg shadow-lg animate-toast-in ${
              t.kind === "success" ? "bg-dark" : "bg-red-600"
            }`}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a ToastProvider");
  return ctx;
}
