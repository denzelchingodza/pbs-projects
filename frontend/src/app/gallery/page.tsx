import Link from "next/link";
import GalleryExplorer from "@/components/gallery/GalleryExplorer";
import BeforeAfterSlider from "@/components/gallery/BeforeAfterSlider";
import SectionHeading from "@/components/ui/SectionHeading";
import { getProjects } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import type { Project } from "@/types";

export default async function GalleryPage() {
  const projects: Project[] = await getProjects();
  const beforeAfterExample = projects.find((p) => p.before_image_url);
  const hasVideo = projects.some((p) => p.media_type === "video");

  return (
    <main>
      <div className="px-6 md:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="Portfolio"
            title="Our Work"
            intro={
              hasVideo
                ? "Browse recent installations by category. Anything with a play icon is a short video walkthrough."
                : "Browse recent installations by category."
            }
          />

          <GalleryExplorer projects={projects} />

          {beforeAfterExample && (
            <div className="mt-20">
              <SectionHeading eyebrow="Before and After" title="See the Difference" />
              <BeforeAfterSlider
                beforeSrc={mediaUrl(beforeAfterExample.before_image_url!)}
                afterSrc={mediaUrl(beforeAfterExample.image_url)}
              />
            </div>
          )}
        </div>
      </div>

      <section className="px-6 md:px-8 py-16 bg-neutral-50 text-center">
        <h2 className="text-2xl font-bold text-dark tracking-tight mb-3">
          See something close to what you need?
        </h2>
        <p className="text-neutral-500 text-sm mb-7 max-w-md mx-auto">
          Send us a few details about your space and we&apos;ll put together a
          straight quote, no pressure.
        </p>
        <Link
          href="/quote"
          className="inline-block bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
        >
          Get a Free Quote
        </Link>
      </section>
    </main>
  );
}
