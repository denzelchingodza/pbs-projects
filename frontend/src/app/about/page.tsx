/**
 * About page, a Server Component so it can fetch settings and real project
 * photos directly with await, same pattern as the home page. Shows the
 * company story, three honest reasons to hire PBS, a small strip of real
 * finished work, the real founder bio (admin-editable), and the map, none
 * of this is hardcoded beyond the one-time company story paragraph below.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AboutFounder from "@/components/home/AboutFounder";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LocationMap from "@/components/layout/LocationMap";
import T from "@/components/i18n/T";
import { getProjects, getSiteSettings } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";
import type { Project } from "@/types";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the team behind PBS Projects, and see why customers in Harare trust us with their windows, doors, and shop fronts.",
};

export default async function AboutPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  const workSample = [...(projects as Project[])]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 4)
    .filter((p) => p.media[0]);

  return (
    <main>
      <section className="px-6 md:px-8 pt-16 pb-14 md:pt-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <T k="about.eyebrow" />
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            <T k="about.title" />
          </h1>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            {years !== null ? (
              <T k="about.introWithYears" values={{ business: settings.business_name, years }} />
            ) : (
              <T k="about.introNoYears" values={{ business: settings.business_name }} />
            )}
          </p>
        </div>
      </section>

      <WhyChooseUs />

      <AboutFounder settings={settings} />

      {workSample.length > 0 && (
        <section className="px-6 md:px-8 py-20 bg-neutral-50">
          <div className="max-w-5xl mx-auto">
            <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
              <T k="about.realWorkEyebrow" />
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight text-center mb-10">
              <T k="about.realWorkTitle" />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {workSample.map((p) => (
                <Link
                  key={p.id}
                  href="/gallery"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={mediaUrl(p.media[0].image_url)}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2.5">
                    <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">
                      {categoryLabel(p.category)}
                    </span>
                    <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/gallery"
                className="inline-block bg-dark text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:bg-orange transition"
              >
                <T k="work.viewGallery" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={`px-6 md:px-8 py-20 ${workSample.length > 0 ? "bg-white" : "bg-neutral-50"}`}>
        <div className="max-w-5xl mx-auto">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
            <T k="about.findUs" />
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
