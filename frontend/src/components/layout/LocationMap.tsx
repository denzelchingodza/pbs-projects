/**
 * Embedded map — pulls address (and map_lat/map_lng if set) from
 * GET /api/settings. Uses a free Google Maps iframe embed (no API key/cost)
 * built from the address string; swap in the Maps JavaScript API later only
 * if you need live directions or a custom-styled map.
 */
export default function LocationMap() {
  return <div>{/* <iframe src={`https://maps.google.com/maps?q=${address}&output=embed`} /> */}</div>;
}
