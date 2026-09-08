/**
 * A single oversized word sitting behind a section's heading, barely there
 * (3.5% opacity, the site's own dark color, not gray, so it stays on-brand
 * even that faint), the same "huge ghost type behind the real heading"
 * device used across the reference site Denzel sent ("what PBS should feel
 * like, not a toy app"). Purely decorative and purely typographic, no photo
 * behind it competing for attention, it's there to make a section feel
 * considered and designed rather than a plain stack of text, exactly the
 * kind of detail a template/toy site skips.
 *
 * `aria-hidden` since screen readers already get the real heading right
 * next to it, this is a visual layer only. The parent section needs
 * `relative overflow-hidden` (every place this is used already has that),
 * overflow-hidden clips the word's edges cleanly at the section boundary
 * instead of it spilling into neighboring sections.
 */
export default function Watermark({
  text,
  align = "center",
}: {
  text: string;
  align?: "center" | "left";
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-2 md:-top-2 ${
        align === "center" ? "inset-x-0 text-center" : "left-0 text-left px-6 md:px-8"
      } text-[16vw] md:text-[9vw] leading-none font-display font-bold text-dark/[0.035] whitespace-nowrap`}
    >
      {text}
    </span>
  );
}
