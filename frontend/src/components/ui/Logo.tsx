/**
 * The PBS Projects wordmark, used in the Navbar, Footer, and admin panel.
 * The icon is a small rounded roof/arc shape matching the flyer's mark that
 * sits above the "PBS" lettering, recreated here as a plain inline SVG (no
 * image file to load, so it's crisp at any size).
 *
 * Three ways it renders, depending on what's behind it:
 * - default: dark "PBS", orange "Projects", orange icon, for a white or
 *   light background (most of the site).
 * - dark: white "PBS", orange "Projects", orange icon, for the dark
 *   backgrounds (footer, mobile menu, admin sidebar).
 * - onOrange: white "PBS", dark "Projects", white icon, for the now-orange
 *   navbar, where orange-on-orange would simply disappear.
 */
export default function Logo({
  className = "",
  dark = false,
  onOrange = false,
}: {
  className?: string;
  dark?: boolean;
  onOrange?: boolean;
}) {
  const iconColor = onOrange ? "#FFFFFF" : "#E8622D";
  const pbsColorClass = onOrange || dark ? "text-white" : "text-dark";
  const projectsColorClass = onOrange ? "text-dark" : "text-orange";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
        <path
          d="M2 15.5 L13 3 L24 15.5"
          stroke={iconColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-bold tracking-tight leading-none text-lg ${pbsColorClass}`}>
        PBS <span className={projectsColorClass}>Projects</span>
      </span>
    </span>
  );
}
