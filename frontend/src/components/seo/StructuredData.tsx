/**
 * Injects schema.org "LocalBusiness" structured data as plain JSON-LD.
 * This is what lets Google show PBS Projects with a knowledge panel,
 * map pin, and phone number in search results, rather than just a plain
 * blue link, real, current business info (from the admin-editable site
 * settings) rather than anything hardcoded, so it stays correct if the
 * address, phone number, or map pin ever changes.
 *
 * Only fields with real values are included, nothing here is invented,
 * fields like opening hours or a price range are left out entirely
 * until PBS actually has them recorded in site settings to draw from.
 */
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import type { SiteSettings } from "@/types";

export default function StructuredData({ settings }: { settings: SiteSettings }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: settings.business_name || SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/images/og-image.jpg`,
    telephone: settings.phone_primary,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Harare",
      addressCountry: "ZW",
    },
  };

  if (settings.map_lat && settings.map_lng) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: settings.map_lat,
      longitude: settings.map_lng,
    };
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
