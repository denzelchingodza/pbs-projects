/**
 * Standalone "leave a testimonial" page, now a Server Component (it fetches
 * real data before rendering) instead of a plain form dropped on an empty
 * background, direct feedback was that this page looked blank next to the
 * rest of the site. A real project photo and one real existing testimonial
 * now sit alongside the form, same two-column, photo-plus-content pattern
 * used across the homepage, so a visitor lands somewhere that already
 * looks like PBS's site instead of a generic contact form.
 *
 * The photo here deliberately skips "Photo 03" (see upload_photos.py):
 * that same project was showing up here AND on the Quote page, direct
 * feedback was to stop reusing the same photo across both, so this page
 * just falls back to the next real featured photo instead, the Quote page
 * gets its own two specific photos (see QuoteSection.tsx).
 */
import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Watermark from "@/components/ui/Watermark";
import FrameCorners from "@/components/ui/FrameCorners";
import TestimonialForm from "@/components/testimonials/TestimonialForm";
import { getProjects, getTestimonials } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { excludeByTitle } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Leave a Testimonial",
  description: "Had work done by PBS Projects? Share your experience.",
};

export default async function TestimonialPage() {
  const [projects, testimonials] = await Promise.all([getProjects(), getTestimonials()]);

  const eligible = excludeByTitle(projects, ["Photo 3", "Photo 03"]);
  const photo = [...eligible]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .find((p) => p.media[0]?.media_type === "image");
  const sample = testimonials[0];

  return (
    <main>
      <section className="relative px-6 md:px-8 py-20 bg-neutral-50 overflow-hidden">
        <Watermark text="Share Your Story" align="left" />
        <div className="max-w-5xl mx-auto relative grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Share Your Experience"
              title="Leave a Testimonial"
              intro="Had work done by PBS Projects? Tell us how it went, real feedback like yours is what helps the next customer decide."
            />

            {photo && (
              <div className="photo-frame shine-hover relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
                <Image
                  src={mediaUrl(photo.media[0].image_url)}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <FrameCorners />
              </div>
            )}

            {sample && (
              <div className="mt-6 bg-white border border-neutral-200/70 rounded-2xl p-6">
                <p className="text-dark text-sm leading-relaxed">&ldquo;{sample.quote}&rdquo;</p>
                <p className="text-neutral-500 text-xs mt-3">
                  {sample.client_name}
                  {sample.client_role ? `, ${sample.client_role}` : ""}
                </p>
              </div>
            )}
          </div>

          <TestimonialForm />
        </div>
      </section>
    </main>
  );
}
