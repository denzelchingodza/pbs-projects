"use client";

/**
 * Last-resort error boundary: catches an error thrown by the root layout
 * itself (very rare, e.g. if getSiteSettings() somehow threw uncaught),
 * a case regular error.tsx can't handle since it renders inside that same
 * layout. Next.js requires this one to render its own <html>/<body>, since
 * it fully replaces the layout that just failed, and deliberately avoids
 * importing Navbar/Footer/Watermark or anything else that fetches data,
 * since the whole point of this file is to still render something when
 * that kind of thing has already gone wrong. Plain inline styles only, no
 * Tailwind classes, in case the failure happened before the page's own
 * stylesheet loaded.
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PBS Projects: root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#F7F2E9",
          color: "#231F20",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "420px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#737373", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
            PBS Projects hit an unexpected error loading this page. Please
            try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#E8622D",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "14px 28px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
