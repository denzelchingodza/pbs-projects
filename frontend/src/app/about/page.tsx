/**
 * About page, a Server Component so it can fetch settings directly with
 * await, same pattern as the home page. Shows the company story, the real
 * founder bio (admin-editable), and the map, none of this is hardcoded
 * beyond the one-time company story paragraph below.
 */
import AboutFounder from "@/components/home/AboutFounder";
import LocationMap from "@/components/layout/LocationMap";
import { getSiteSettings } from "@/lib/api";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  return (
    <main>
      <section className="px-6 md:px-8 pt-16 pb-14 md:pt-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            About Us
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            Built on real trade experience, not just a business plan
          </h1>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            {settings.business_name} is a Harare based glass and aluminum specialist,
            {years !== null ? ` running for ${years}+ years, ` : " "}
            covering windows, doors, shower cubicles, shop fronts, suspended
            ceilings and cabinets for homes, shops, and offices across Zimbabwe.
          </p>
        </div>
      </section>

      <AboutFounder settings={settings} />

      <section className="px-6 md:px-8 py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
            Find Us
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight text-center mb-8">
            {settings.address}
          </h2>
          <LocationMap settings={settings} />
        </div>
      </section>
    </main>
  );
}
