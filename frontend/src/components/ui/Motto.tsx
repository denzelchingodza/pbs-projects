/**
 * The company motto, NDEZVEBASA, always split into its two real colors:
 * "NDE" in orange, "ZVEBASA" in the current text color. Kept as one small
 * shared component rather than typing the split spans out everywhere it
 * appears (navbar, footer, About page), so the exact styling can only ever
 * drift in one place, not slowly go out of sync across the site.
 */
export default function Motto({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-wide whitespace-nowrap ${className}`}>
      <span className="text-orange">NDE</span>
      <span>ZVEBASA</span>
    </span>
  );
}
