/**
 * The PBS Projects wordmark, used in the Navbar, Footer, and admin panel.
 * The icon is a small rounded roof/arc shape in the brand orange, matching
 * the flyer's mark that sits above the "PBS" lettering, recreated here as a
 * plain inline SVG (no image file to load, so it's crisp at any size and
 * matches the site's orange exactly instead of drifting from a raster copy).
 */
export default function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
        <path
          d="M2 15.5 L13 3 L24 15.5"
          stroke="#E8622D"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-bold tracking-tight leading-none text-lg ${
          dark ? "text-white" : "text-dark"
        }`}
      >
        PBS <span className="text-orange">Projects</span>
      </span>
    </span>
  );
}
