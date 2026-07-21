/**
 * The PBS Projects wordmark, used in the Navbar, Footer, and admin panel.
 * The roof/arc icon sits stacked directly above the "PBS Projects" text,
 * matching the flyer's actual mark, rather than sitting beside it, plain
 * inline SVG (no image file to load), so it's crisp at any size.
 *
 * Three ways it renders, depending on what's behind it:
 * - default: dark "PBS", orange "Projects", orange icon, for a white or
 *   light background (most of the site).
 * - dark: white "PBS", orange "Projects", orange icon, for the dark
 *   backgrounds (footer, mobile menu, admin sidebar).
 * - onOrange: white "PBS", dark "Projects", white icon, for the orange
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
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <svg width="24" height="18" viewBox="0 0 26 20" fill="none" aria-hidden="true" className="mb-1">
        <path
          d="M2 15.5 L13 3 L24 15.5"
          stroke={iconColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-bold tracking-tight text-base whitespace-nowrap ${pbsColorClass}`}>
        PBS <span className={projectsColorClass}>Projects</span>
      </span>
    </span>
  );
}
