"use client";

/**
 * Redesign notes: reuses SectionHeading instead of its own one-off eyebrow/
 * heading markup, and the contact details use the same neutral/orange-
 * accent styling as the rest of the page instead of raw emoji.
 *
 * Now a Client Component so its heading follows the current language, the
 * actual QuoteForm below it (and its own field labels) is translated
 * separately, see QuoteForm.tsx.
 *
 * Two real project photos now sit above the contact details, a main photo
 * with a second, smaller one overlapping its corner, the same "real photo
 * overlapping another surface" move used in Hero and WhyChooseUs, applied
 * here as two photos instead of a photo-and-card so this page reads as a
 * small showcase of real work rather than one lone image. Denzel picked
 * these two specifically ("Photo 52" and "Photo 75", see upload_photos.py)
 * rather than leaving it to whichever project happens to be featured, and
 * asked that neither page reuse the same photo as the Testimonial page, so
 * this deliberately does not fall back to that page's photo. Watermark
 * replaces the old flat pane-grid texture, consistent with every other
 * section's background treatment now.
 */
import Image from "next/image";
import type { Product, Project, SiteSettings } from "@/types";
import QuoteForm from "./QuoteForm";
import SectionHeading from "@/components/ui/SectionHeading";
import PaymentMethods from "@/components/ui/PaymentMethods";
import Watermark from "@/components/ui/Watermark";
import FrameCorners from "@/components/ui/FrameCorners";
import { mediaUrl } from "@/lib/media";
import { excludeByTitle, projectByTitle } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function QuoteSection({
  products,
  settings,
  projects = [],
}: {
  products: Product[];
  settings: SiteSettings;
  projects?: Project[];
}) {
  const { lang } = useLanguage();

  // Fallback pool: real featured-first photos, minus the one the
  // Testimonial page already shows, so if "Photo 52"/"Photo 75" ever get
  // renamed past recognition, this still shows two different real photos
  // rather than an empty box or a repeat of the Testimonial page's photo.
  const fallbackPool = excludeByTitle(projects, ["Photo 3", "Photo 03"])
    .filter((p) => p.media[0]?.media_type === "image")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  const photoA = projectByTitle(projects, ["Photo 52"]) ?? fallbackPool[0];
  const photoB =
    projectByTitle(projects, ["Photo 75"]) ??
    fallbackPool.find((p) => p.id !== photoA?.id);

  return (
    <section id="quote" className="relative overflow-hidden px-6 md:px-8 py-20 bg-neutral-50">
      <Watermark text="Get a Quote" align="left" />
      <div className="max-w-5xl mx-auto relative grid md:grid-cols-2 gap-14 items-start">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t("quote.eyebrow", lang)}
            title={t("quote.title", lang)}
            intro={t("quote.intro", lang)}
          />

          {photoA && (
            <div className="relative mb-16 sm:mb-14">
              <div className="photo-frame shine-hover relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
                <Image
                  src={mediaUrl(photoA.media[0].image_url)}
                  alt={photoA.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
                <FrameCorners />
              </div>
              {photoB && (
                <div className="photo-frame shine-hover ring-4 ring-neutral-50 absolute -bottom-10 -right-4 sm:-right-6 w-[48%] aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900">
                  <Image
                    src={mediaUrl(photoB.media[0].image_url)}
                    alt={photoB.title}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                  <FrameCorners />
                </div>
              )}
            </div>
          )}

          <div className="text-sm space-y-3 text-neutral-600">
            <p>{settings.address}</p>
            <p>
              <a
                href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
                className="font-semibold text-dark hover:text-orange transition-colors"
              >
                {settings.phone_primary}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-orange transition-colors"
              >
                {settings.email}
              </a>
            </p>
          </div>
          <PaymentMethods className="mt-8" />
        </div>
        <QuoteForm products={products} />
      </div>
    </section>
  );
}
