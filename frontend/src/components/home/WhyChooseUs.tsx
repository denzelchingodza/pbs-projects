"use client";

/**
 * Rebuilt around the "Our Recent / Aluminium Projects" card from the
 * reference site Denzel sent: a real project photo filling most of the
 * width, with a white card overlapping its edge holding a short, honest
 * bullet-dot checklist (the same three reasons this section already had,
 * just restyled) and a straight way into the full gallery. That overlap is
 * the one move a plain template never bothers with, a flat 3-column icon
 * strip (what this section used to be) reads as generic by comparison.
 *
 * Picks the second-featured real project as the backdrop (index 1 after
 * sorting featured-first), not the same photo already used in Hero's
 * floating card or About's intro photo just above this section, so
 * scrolling down the page keeps surfacing different real work instead of
 * repeating one photo.
 */
import Image from "next/image";
import type { Project } from "@/types";
import FrameCorners from "@/components/ui/FrameCorners";
import LineLabel from "@/components/ui/LineLabel";
import PillButton from "@/components/ui/PillButton";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function WhyChooseUs({ projects = [] }: { projects?: Project[] }) {
  const { lang } = useLanguage();
  const withPhoto = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .filter((p) => p.media[0]?.media_type === "image");
  const photo = withPhoto[1] ?? withPhoto[0];

  const items = [
    { title: t("whyChooseUs.title1", lang) },
    { title: t("whyChooseUs.title2", lang) },
    { title: t("whyChooseUs.title3", lang) },
  ];

  return (
    <section className="px-6 md:px-8 pt-8 pb-20 md:pb-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto relative">
        {photo && (
          <div className="photo-frame relative aspect-[16/10] md:aspect-[21/9] rounded-2xl overflow-hidden bg-neutral-900">
            <Image
              src={mediaUrl(photo.media[0].image_url)}
              alt={photo.title}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />
            <FrameCorners />
          </div>
        )}

        <div
          className={`bg-white rounded-2xl shadow-lg p-8 md:p-10 mx-2 md:mx-0 md:w-[420px] ${
            photo ? "-mt-10 md:absolute md:right-6 md:-bottom-10 md:mt-0" : ""
          }`}
        >
          <LineLabel>{t("whyChooseUs.eyebrow", lang)}</LineLabel>
          <h3 className="text-2xl font-semibold tracking-tight text-dark">
            {t("whyChooseUs.cardTitle", lang)}
          </h3>
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item.title} className="flex items-center gap-3 text-sm text-dark font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" aria-hidden="true" />
                {item.title}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <PillButton href="/gallery" variant="outlineDark">
              {t("whyChooseUs.viewGallery", lang)}
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
