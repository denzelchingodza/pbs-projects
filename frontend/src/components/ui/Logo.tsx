/**
 * The PBS Projects wordmark, used in the Navbar, Footer, and admin panel.
 * Matches the real company mark: an orange roof/chevron icon on top, "PBS"
 * large and bold underneath it, and "PROJECTS" smaller and letter-spaced on
 * its own line below that, plain inline SVG (no image file to load), so
 * it's crisp at any size.
 *
 * Three ways it renders, depending on what's behind it:
 * - default: dark "PBS", neutral gray "PROJECTS", orange icon, for a white
 *   or light background (most of the site).
 * - dark: white "PBS", white/70 "PROJECTS", orange icon, for the dark
 *   backgrounds (footer, mobile menu, admin sidebar).
 * - onOrange: white "PBS", white/80 "PROJECTS", white icon, for the orange
 *   navbar, where an orange icon or dark gray text would lose contrast.
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
  const projectsColorClass = onOrange ? "text-white/80" : dark ? "text-white/70" : "text-neutral-500";

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <svg width="30" height="18" viewBox="0 0 32 20" fill="none" aria-hidden="true" className="mb-1">
        <path
          d="M2 16 L16 3 L30 16"
          stroke={iconColor}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-extrabold tracking-tight text-lg whitespace-nowrap ${pbsColorClass}`}>
        PBS
      </span>
      <span className={`font-semibold text-[9px] tracking-[0.3em] whitespace-nowrap ${projectsColorClass}`}>
        PROJECTS
      </span>
    </span>
  );
}
