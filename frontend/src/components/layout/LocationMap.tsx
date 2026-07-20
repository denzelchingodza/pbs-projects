/**
 * Embedded map, showing exactly where PBS is in Zimbabwe. Uses a free
 * Google Maps iframe embed (no API key or billing needed) built from the
 * real address in Site Settings; if map_lat/map_lng are ever set in the
 * admin panel, those are used instead for a more precise pin.
 */
import type { SiteSettings } from "@/types";

export default function LocationMap({ settings }: { settings: SiteSettings }) {
  const query =
    settings.map_lat != null && settings.map_lng != null
      ? `${settings.map_lat},${settings.map_lng}`
      : settings.address;

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 w-full aspect-[16/10] sm:aspect-[16/9]">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${settings.business_name}, ${settings.address}`}
      />
    </div>
  );
}
