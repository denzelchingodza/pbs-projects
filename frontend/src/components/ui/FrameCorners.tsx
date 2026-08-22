/**
 * Small L-shaped corner brackets overlaid on a photo, echoing how a real
 * aluminum window frame actually joins at its corners, an extrusion meeting
 * another extrusion at a clean right angle. Used on every real project
 * photo across the site (FeaturedWork, ProductsOverview, the Products page,
 * the About photo mosaic) so a "frame" isn't just a metaphor here, it's the
 * one visual detail borrowed directly from what PBS actually builds.
 *
 * Purely decorative (`aria-hidden`), sits as an absolutely positioned
 * overlay on top of an `Image`, the parent needs `relative` (every place
 * this is used already has that, for the `fill` image beneath it).
 */
export default function FrameCorners({
  color = "border-white/85",
  size = "w-5 h-5",
}: {
  color?: string;
  size?: string;
}) {
  const base = `absolute ${size} ${color}`;
  return (
    <div className="pointer-events-none absolute inset-3" aria-hidden="true">
      <span className={`${base} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${base} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}
