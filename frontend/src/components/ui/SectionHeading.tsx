/**
 * Small shared label + heading used at the top of every homepage section
 * (Products, Our Work, Testimonials, Get a Quote). Pulling this into one
 * component means the "eyebrow label / big heading / optional intro line"
 * pattern is defined once — change the spacing or type size here and every
 * section updates together, instead of four near-identical blocks of JSX
 * quietly drifting out of sync over time.
 *
 * The eyebrow label now carries `font-display` too, not just the big
 * heading below it. Every section on the site starts with one of these,
 * so this one small shared change is what actually makes the distinctive
 * typeface register while scrolling, rather than it only showing up in
 * the occasional big headline.
 *
 * Eyebrow is dark text with a small orange dot in front of it now, not a
 * full line of orange caps text. Every section on the site opens with one
 * of these, a solid block of orange repeated at the top of every single
 * section down the page is what actually added up to "so orange it's
 * exhausting", a small dot still marks it as the same accent without
 * repeating a full orange text block eight times down one page. The big
 * heading itself dropped from `font-extrabold` to `font-semibold`, a
 * lighter, thinner weight reads calmer at this size, still clearly a
 * heading, not shouting.
 */
export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  intro,
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
  intro?: string;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const dotAlignClass = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`max-w-xl mb-12 ${alignClass}`}>
      <p
        className={`font-display flex items-center gap-2 text-dark/70 text-xs font-medium uppercase tracking-[0.2em] mb-3 ${dotAlignClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-semibold text-dark tracking-tight">{title}</h2>
      {intro && <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">{intro}</p>}
    </div>
  );
}
