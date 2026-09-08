"use client";

/**
 * Rebuilt around the "Our Recent / Aluminium Projects" card from the
 * reference site Denzel sent: a real project photo filling most of the
 * width, with a white card overlapping its edge holding a short, honest
 * checklist (the same three reasons this section already had, just
 * restyled) and a straight way into the full gallery. That overlap is
 * the one move a plain template never bothers with, a flat 3-column icon
 * strip (what this section used to be) reads as generic by comparison.
 *
 * Checklist markers are a plain thin dark checkmark now, not a small
 * orange dot, a repeated colored dot in front of every line read as a
 * decorative flourish rather than a real list marker.
 *
 * Backdrop is specifically the double storey home window installation,
 * Denzel picked this one directly, not the generic "second featured
 * project" heuristic this used before. That job was bulk-uploaded as
 * "Photo 45" (see upload_photos.py) and may or may not have been renamed
 * since, so it's matched by either title. Falls back to that old
 * "second-featured project" heuristic if neither title is in the loaded
 * project list for some reason, so this section never silently renders
 * with no photo at all.
 */
import Image from "next/image";
import type { Project } from "@/types";
import FrameCorners from "@/components/ui/FrameCorners";
import LineLabel from "@/components/ui/LineLabel";
import PillButton from "@/components/ui/PillButton";
import { mediaUrl } from "@/lib/media";
import { projectByTitle } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function WhyChooseUs({ projects = [] }: { projects?: Project[] }) {
  const { lang } = useLanguage();
  const withPhoto = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .filter((p) => p.media[0]?.media_type === "image");
  const doubleStorey = projectByTitle(withPhoto, ["Photo 45", "Window installation, double storey home"]);
  const photo = doubleStorey ?? withPhoto[1] ?? withPhoto[0];

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
              <li key={item.title} className="flex items-center gap-2.5 text-sm text-dark font-medium">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-dark/40 shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
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
