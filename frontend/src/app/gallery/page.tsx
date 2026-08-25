import type { Metadata } from "next";
import Link from "next/link";
import GalleryExplorer from "@/components/gallery/GalleryExplorer";
import BeforeAfterSlider from "@/components/gallery/BeforeAfterSlider";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { getProjects } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Project } from "@/types";

// This page had gone through Stage 49's glass/material redesign pass
// without picking up any of its own touches (see FilterBar.tsx,
// GalleryGrid.tsx, BeforeAfterSlider.tsx for the tile/section-header/slider
// fixes), the intro band and closing CTA below get the same catch-up: a
// short orange accent bar under the heading, and a pane-grid backdrop on
// the CTA band matching Footer.tsx and QuoteSection.tsx.

export const metadata: Metadata = {
  title: "Our Work",
  description: "Real finished jobs, windows, doors, shower cubicles, shop fronts, and more, from PBS Projects in Harare.",
};

export default async function GalleryPage() {
  const projects: Project[] = await getProjects();
  const beforeAfterExample = projects.find((p) => p.before_image_url && p.media[0]);
  const hasVideo = projects.some((p) => p.media.some((m) => m.media_type === "video"));
  const photoCount = projects.reduce((total, p) => total + p.media.length, 0);
  const categoryCount = new Set(projects.map((p) => p.category)).size;

  return (
    <main>
      <div className="px-6 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <span className="block w-14 h-1.5 bg-orange rounded-full mb-6" aria-hidden="true" />
          <SectionHeading
            align="left"
            eyebrow="Portfolio"
            title="The Full Gallery"
            intro={
              `Every photo we have from ${photoCount} completed installations, organized by category below. Filter to just one, tap any photo to view it full size, or start the slideshow.` +
              (hasVideo ? " Anything with a play icon is a short video walkthrough." : "")
            }
          />

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-12 -mt-6">
            <span className="text-sm text-neutral-500">
              <span className="font-display font-bold text-dark">{photoCount}</span> photos
            </span>
            <span className="text-sm text-neutral-500">
              <span className="font-display font-bold text-dark">{categoryCount}</span> categories
            </span>
            {hasVideo && (
              <span className="text-sm text-neutral-500">
                Includes <span className="font-display font-bold text-dark">video</span> walkthroughs
              </span>
            )}
          </div>

          <GalleryExplorer projects={projects} />

          {beforeAfterExample && (
            <Reveal className="mt-20">
              <SectionHeading eyebrow="Before and After" title="See the Difference" />
              <BeforeAfterSlider
                beforeSrc={mediaUrl(beforeAfterExample.before_image_url!)}
                afterSrc={mediaUrl(beforeAfterExample.media[0].image_url)}
              />
            </Reveal>
          )}
        </div>
      </div>

      <Reveal>
        <section className="relative px-6 md:px-8 py-16 bg-neutral-50 text-center overflow-hidden">
          <div className="absolute inset-0 pane-grid -z-10" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-dark tracking-tight mb-3">
            See something close to what you need?
          </h2>
          <p className="text-neutral-500 text-sm mb-7 max-w-md mx-auto">
            Send us a few details about your space and we&apos;ll put together a
            straight quote, no pressure.
          </p>
          <Link
            href="/quote"
            className="shine-hover font-display inline-block bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
          >
            Get a Free Quote
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
