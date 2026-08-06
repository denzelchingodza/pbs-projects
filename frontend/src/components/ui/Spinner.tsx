/**
 * One small spinner, used everywhere something is loading, the admin
 * panel's "Loading quotes..." states and the public site's route-level
 * loading.tsx alike, instead of each spot inventing its own (a plain text
 * line in one place, nothing at all in another). A loading indicator is
 * functional, not decorative, so this intentionally ignores
 * prefers-reduced-motion, same convention most sites use, a static spinner
 * gives no signal that something is actually happening.
 */
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-orange ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
