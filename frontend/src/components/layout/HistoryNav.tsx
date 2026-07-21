"use client";

/**
 * Small back/forward controls, plain browser history navigation, so
 * visitors always have an obvious, in-page way to retrace their steps
 * (especially on mobile, where a browser's own back gesture isn't always
 * obvious) instead of hunting for it or getting stuck deep in the site.
 */
export default function HistoryNav() {
  const buttonClass = "text-white/90 hover:bg-black/10";

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => window.history.back()}
        aria-label="Go back"
        title="Go back"
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none transition-colors ${buttonClass}`}
      >
        &#8249;
      </button>
      <button
        onClick={() => window.history.forward()}
        aria-label="Go forward"
        title="Go forward"
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none transition-colors ${buttonClass}`}
      >
        &#8250;
      </button>
    </div>
  );
}
