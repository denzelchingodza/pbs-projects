/**
 * The opening block of the About content, folded into the homepage
 * (id="about") instead of living on its own page, so a visitor never has
 * to leave the homepage to learn who PBS Projects actually is. Sits right
 * after Testimonials and directly above WhyChooseUs and TeamSection below
 * it, all three share the same light gray band (bg-neutral-50).
 *
 * Rebuilt as a two-column block matching the reference site Denzel sent:
 * one real project photo on the left with its own caption underneath (not
 * a small mosaic grid, one considered photo reads more like a real
 * portfolio piece than four cropped-down thumbnails), and on the right a
 * small "— ESTABLISHED {year}" line label (LineLabel.tsx) above the
 * heading, the intro paragraph, and a pill CTA straight to a phone call,
 * the exact "Call Us Now" pattern from the reference.
 */
import Image from "next/image";
import T from "@/components/i18n/T";
import FrameCorners from "@/components/ui/FrameCorners";
import LineLabel from "@/components/ui/LineLabel";
import PillButton from "@/components/ui/PillButton";
import type { SiteSettings, Project } from "@/types";
import { mediaUrl } from "@/lib/media";

export default function AboutIntro({
  settings,
  projects,
}: {
  settings: SiteSettings;
  projects: Project[];
}) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  const photo = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .find((p) => p.media[0]?.media_type === "image");

  return (
    <section id="about" className="px-6 md:px-8 py-20 md:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {photo ? (
          <div>
            <div className="photo-frame shine-hover relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={mediaUrl(photo.media[0].image_url)}
                alt={photo.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <FrameCorners />
            </div>
            <p className="mt-3 text-xs text-neutral-500">{photo.title}</p>
          </div>
        ) : (
          <div />
        )}

        <div>
          <LineLabel>
            {settings.founded_year ? (
              <T k="about.established" values={{ year: settings.founded_year }} />
            ) : (
              <T k="about.eyebrow" />
            )}
          </LineLabel>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-dark">
            <T k="about.title" />
          </h2>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            {years !== null ? (
              <T k="about.introWithYears" values={{ business: settings.business_name, years }} />
            ) : (
              <T k="about.introNoYears" values={{ business: settings.business_name }} />
            )}
          </p>
          <div className="mt-8">
            <PillButton href={`tel:${settings.phone_primary.replace(/\s/g, "")}`} variant="outlineDark">
              <T k="about.callUsNow" />
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
