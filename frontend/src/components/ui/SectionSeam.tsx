/**
 * A thin decorative divider between two homepage sections, tick marks along
 * a horizontal line, styled after the track a sliding window or door
 * actually rides in, used in place of a few of the plain white/neutral-50
 * color handoffs between sections (see app/page.tsx), so the page's own
 * section breaks carry a small piece of the same material language instead
 * of being invisible background-color changes.
 *
 * Purely decorative (`aria-hidden`), `tone` picks which section-background
 * color it sits on top of so it's never a visibly mismatched rectangle at
 * the seam itself.
 */
export default function SectionSeam({ tone = "white" }: { tone?: "white" | "neutral" }) {
  return (
    <div
      aria-hidden="true"
      className={`h-6 w-full overflow-hidden ${tone === "white" ? "bg-white" : "bg-neutral-50"}`}
    >
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="w-full h-full text-neutral-200">
        <line x1="0" y1="6" x2="200" y2="6" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 41 }).map((_, i) => (
          <line
            key={i}
            x1={i * 5}
            y1="2"
            x2={i * 5}
            y2="10"
            stroke="currentColor"
            strokeWidth="0.75"
          />
        ))}
      </svg>
    </div>
  );
}
