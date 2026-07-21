/**
 * The homepage's main sales pitch: a small, hand-picked set of real jobs
 * (whatever the admin has marked "Feature this"), shown big and with a real
 * caption, not a wall of thumbnails, that's what the full gallery page is
 * for. One large lead project plus four supporting ones in a bento-style
 * grid, each captioned with its own title and a one-line note on what that
 * kind of work actually involves, then a clear way into the complete
 * gallery for anyone who wants to see everything.
 */
import Link from "next/link";
import type { Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import { categoryLabel } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";

const CATEGORY_BLURB: Record<string, string> = {
  windows: "Aluminum framed and built to size for the opening.",
  doors: "Fitted and sealed for smooth, everyday use.",
  showercubicles: "Frameless glass, sealed clean to the tile.",
  shopfronts: "Full glazing built to secure and to impress.",
  ceilings: "Clean grid finish with easy access above it.",
  cabinets: "Custom built in aluminum and glass.",
};

function Card({
  project,
  big = false,
}: {
  project: Project;
  big?: boolean;
}) {
  const cover = project.media[0];
  if (!cover) return null;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-[4/3] ${
        big ? "md:col-span-2 md:row-span-2 md:aspect-auto" : "md:aspect-auto"
      }`}
    >
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(cover.image_url)}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pt-12 pb-4">
        <span className="inline-block bg-white/90 text-dark text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
          {categoryLabel(project.category)}
        </span>
        <p className={`text-white font-semibold leading-snug ${big ? "text-lg" : "text-sm"}`}>
          {project.title}
        </p>
        {big && CATEGORY_BLURB[project.category] && (
          <p className="text-white/70 text-sm mt-1">{CATEGORY_BLURB[project.category]}</p>
        )}
      </div>
    </div>
  );
}

export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const highlights = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 5);

  return (
    <section id="work" className="px-6 md:px-8 py-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Portfolio"
          title="Our Work"
          intro="A look at real installations, straight from completed jobs, updated directly by the PBS team."
        />

        {highlights.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">Project photos coming soon</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              We&apos;re adding photos of our recent installations, check back shortly,
              or view examples of our product categories above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[560px]">
            {highlights.map((p, i) => (
              <Card key={p.id} project={p} big={i === 0} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-block bg-dark text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:bg-orange transition"
          >
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
