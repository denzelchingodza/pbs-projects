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
 * A real project photo now sits above the contact details, the same
 * photo-plus-content pairing used across the rest of the homepage, this
 * was previously just text and a form with a faint pane-grid texture
 * behind it, the one closing section on the page that hadn't picked up
 * any of the site's "pair real work with the content" language yet.
 * Watermark replaces that old pane-grid texture for the same reason,
 * consistent with every other section's background treatment now.
 */
import Image from "next/image";
import type { Product, Project, SiteSettings } from "@/types";
import QuoteForm from "./QuoteForm";
import SectionHeading from "@/components/ui/SectionHeading";
import PaymentMethods from "@/components/ui/PaymentMethods";
import Watermark from "@/components/ui/Watermark";
import FrameCorners from "@/components/ui/FrameCorners";
import { mediaUrl } from "@/lib/media";
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
  const photo = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .find((p) => p.media[0]?.media_type === "image");

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

          {photo && (
            <div className="photo-frame shine-hover relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 mb-8">
              <Image
                src={mediaUrl(photo.media[0].image_url)}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
              <FrameCorners />
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
