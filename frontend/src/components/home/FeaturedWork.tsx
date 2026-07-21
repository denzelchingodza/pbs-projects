/**
 * Shows real, admin-uploaded project photos once they exist. Until then,
 * shows an honest "coming soon" placeholder instead of fake/stock photos —
 * we don't want to mislead a visitor into thinking these are PBS's own jobs.
 *
 * Redesign notes: the empty state is now styled as a deliberate card that
 * matches the rest of the new design system (rounded-xl, neutral border),
 * instead of a dashed "placeholder" box that reads like unfinished work.
 */
import type { Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import { categoryLabel } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="px-6 md:px-8 py-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Portfolio"
          title="Our Work"
          intro="A look at recent installations, updated directly by the PBS team as new jobs are completed."
        />

        {projects.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">Project photos coming soon</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              We&apos;re adding photos of our recent installations, check back shortly,
              or view examples of our product categories above.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Featured photos (picked in the admin panel) lead the teaser, so
                this stays a varied sample of the work instead of just
                whichever six photos happen to have been uploaded first. */}
            {[...projects]
              .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
              .slice(0, 6)
              .map((p) => {
                const cover = p.media[0];
                if (!cover) return null;
                return (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900">
                    {cover.media_type === "video" ? (
                      <video
                        src={mediaUrl(cover.image_url)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="aspect-[4/3] object-cover w-full"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(cover.image_url)}
                        alt={p.title}
                        className="aspect-[4/3] object-cover w-full"
                      />
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 text-dark text-xs font-semibold px-3 py-1 rounded-full">
                      {categoryLabel(p.category)}
                    </span>
                    {p.media.length > 1 && (
                      <span className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        +{p.media.length - 1} more
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
