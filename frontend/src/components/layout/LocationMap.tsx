/**
 * Embedded map, showing exactly where PBS is in Zimbabwe. Uses a free
 * Google Maps iframe embed (no API key or billing needed) built from the
 * real address in Site Settings; if map_lat/map_lng are ever set in the
 * admin panel, those are used instead for a more precise pin.
 *
 * "Waterfalls" on its own is a genuinely ambiguous place name (there's more
 * than one place in the world called that), without a country attached the
 * free embed's own geocoder was landing on the wrong one entirely and
 * falling back to a full world view instead of Harare, this only shows up
 * once you actually load the real address, not from reading the code.
 * Explicitly appending ", Zimbabwe" to the query (kept separate from
 * `settings.address` itself, that field is fine as-is for display, this
 * is only for the map lookup) is what actually fixes it.
 *
 * Grayscaled with a very light warm tint (the same duotone technique as
 * the homepage hero, see Hero.tsx, just far more subtle here, 12% instead
 * of a full wash) so the map reads as part of this site's own design
 * instead of a bare, default-blue Google widget dropped in, `photo-frame`
 * and `FrameCorners` match every other real photo surface on the site,
 * this is styled as one more of those, not a one-off exception.
 */
import type { SiteSettings } from "@/types";
import FrameCorners from "@/components/ui/FrameCorners";

export default function LocationMap({ settings }: { settings: SiteSettings }) {
  const query =
    settings.map_lat != null && settings.map_lng != null
      ? `${settings.map_lat},${settings.map_lng}`
      : `${settings.address}, Zimbabwe`;

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;

  return (
    <div className="photo-frame relative rounded-2xl overflow-hidden w-full aspect-[16/10] sm:aspect-[16/9]">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, filter: "grayscale(0.7) contrast(1.05)" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${settings.business_name}, ${settings.address}`}
      />
      {/* A very light warm wash, mix-blend-mode: color, tints the map's own
          grayscale values instead of sitting as a flat layer over them, the
          labels and roads underneath still read clearly. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-orange/10 mix-blend-color pointer-events-none"
      />
      <FrameCorners />
    </div>
  );
}
