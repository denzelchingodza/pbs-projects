"use client";

/**
 * The homepage's main sales pitch: a small, hand-picked set of real jobs
 * (whatever the admin has marked "Feature this"), shown big and with a real
 * caption, not a wall of thumbnails, that's what the full gallery page is
 * for. One large lead project plus four supporting ones in a bento-style
 * grid, each captioned with its own title and a one-line note on what that
 * kind of work actually involves, then a clear way into the complete
 * gallery for anyone who wants to see everything.
 *
 * Now a Client Component so the section heading, empty state, and button
 * can follow the current language (useLanguage()), the per-category blurb
 * lines and project titles themselves stay English for now, same as
 * product descriptions, those live as plain data rather than in the
 * translation dictionary.
 *
 * The lead project (the first, biggest card) now renders as a real
 * case-study card rather than just a bigger version of the same photo
 * tile: photo up top, then its own panel below with a vertical orange
 * accent bar, an eyebrow label, the job's title and blurb, and two real
 * chevron links out ("See the job" into the gallery, "Get a quote like
 * this" straight to the quote form), the same lead-story treatment
 * funema.co gives its top case study instead of a caption floating over a
 * darkened photo. The four supporting cards keep the original simple
 * photo-and-caption tile, that contrast is what makes the lead card read
 * as the one dominant story instead of five equal thumbnails.
 */
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import FrameCorners from "@/components/ui/FrameCorners";
import { categoryLabel } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const CATEGORY_BLURB: Record<string, string> = {
  windows: "Aluminum framed and built to size for the opening.",
  doors: "Fitted and sealed for smooth, everyday use.",
  showercubicles: "Frameless glass, sealed clean to the tile.",
  shopfronts: "Full glazing built to secure and to impress.",
  ceilings: "Clean grid finish with easy access above it.",
  cabinets: "Custom built in aluminum and glass.",
};

function ChevronIcon() {
  return (
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
      className="transition-transform group-hover/link:translate-x-0.5"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function LeadCard({ project }: { project: Project }) {
  const cover = project.media[0];
  if (!cover) return null;
  const blurb = CATEGORY_BLURB[project.category];

  return (
    <div className="md:col-span-2 md:row-span-2 flex flex-col rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
      <div className="shine-hover relative flex-1 min-h-[220px] overflow-hidden bg-neutral-900">
        {cover.media_type === "video" ? (
          <video
            src={mediaUrl(cover.image_url)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={mediaUrl(cover.image_url)}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
        <FrameCorners />
      </div>

      <div className="relative pl-6 pr-5 py-5 border-t border-neutral-100">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange" aria-hidden="true" />
        <span className="inline-block bg-orange/10 text-orange text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2">
          {categoryLabel(project.category)}
        </span>
        <p className="text-dark font-bold text-lg leading-snug">{project.title}</p>
        {blurb && <p className="text-neutral-500 text-sm mt-1.5">{blurb}</p>}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/gallery"
            className="group/link inline-flex items-center gap-1 text-sm font-semibold text-dark hover:text-orange transition"
          >
            See the job
            <ChevronIcon />
          </Link>
          <Link
            href="/#quote"
            className="group/link inline-flex items-center gap-1 text-sm font-semibold text-orange hover:text-dark transition"
          >
            Get a quote like this
            <ChevronIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({ project }: { project: Project }) {
  const cover = project.media[0];
  if (!cover) return null;

  return (
    <div className="group shine-hover relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-[4/3] md:aspect-auto shadow-sm hover:shadow-lg transition-shadow">
      {cover.media_type === "video" ? (
        <video
          src={mediaUrl(cover.image_url)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <Image
          src={mediaUrl(cover.image_url)}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pt-12 pb-4">
        <span className="inline-block bg-white/90 text-dark text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
          {categoryLabel(project.category)}
        </span>
        <p className="text-white font-semibold leading-snug text-sm">{project.title}</p>
      </div>
      <FrameCorners />
    </div>
  );
}

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const { lang } = useLanguage();
  const highlights = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 5);

  return (
    <section id="work" className="px-6 md:px-8 py-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("work.eyebrow", lang)}
          title={t("work.title", lang)}
          intro={t("work.intro", lang)}
        />

        {highlights.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">{t("work.comingSoonTitle", lang)}</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              {t("work.comingSoonBody", lang)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[560px]">
            {highlights.map((p, i) =>
              i === 0 ? <LeadCard key={p.id} project={p} /> : <Card key={p.id} project={p} />
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-block bg-dark text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:bg-orange transition"
          >
            {t("work.viewGallery", lang)}
          </Link>
        </div>
      </div>
    </section>
  );
}
