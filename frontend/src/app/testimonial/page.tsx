/**
 * Standalone "leave a testimonial" page, a Server Component (it fetches
 * real data before rendering) instead of a plain form dropped on an empty
 * background.
 *
 * No photo here on purpose (direct feedback: keep this page photo-free,
 * just make it look neat). Centered single-column layout instead of the
 * photo-plus-form two-column split this used to be, so the page still
 * feels considered without needing an image to balance against. One real
 * existing testimonial, styled the same "quote mark, stars, author" way
 * as the homepage's Testimonials section, sits above the form as a quiet
 * bit of social proof, so someone about to write their own sees an
 * example of what a real one looks like first.
 */
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import Watermark from "@/components/ui/Watermark";
import TestimonialForm from "@/components/testimonials/TestimonialForm";
import { getTestimonials } from "@/lib/api";

export const metadata: Metadata = {
  title: "Leave a Testimonial",
  description: "Had work done by PBS Projects? Share your experience.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-orange/80 text-xs tracking-wide" aria-hidden="true">
      {"★".repeat(rating)}
      <span className="text-neutral-200">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

export default async function TestimonialPage() {
  const testimonials = await getTestimonials();
  const sample = testimonials[0];

  return (
    <main>
      <section className="relative px-6 md:px-8 py-20 bg-neutral-50 overflow-hidden">
        <Watermark text="Share Your Story" />
        <div className="max-w-xl mx-auto relative">
          <SectionHeading
            eyebrow="Share Your Experience"
            title="Leave a Testimonial"
            intro="Had work done by PBS Projects? Tell us how it went, real feedback like yours is what helps the next customer decide."
          />

          {sample && (
            <div className="relative bg-white border border-neutral-200/70 rounded-2xl p-6 mb-8">
              <svg
                aria-hidden="true"
                width="34"
                height="26"
                viewBox="0 0 42 32"
                fill="currentColor"
                className="text-orange/10 mb-1"
              >
                <path d="M0 32V19.2C0 8.53 6.4 1.6 17.6 0l1.87 4.8C12.53 6.4 8.8 10.13 8.8 16h9.87v16H0Zm23.2 0V19.2c0-10.67 6.4-17.6 17.6-19.2l1.87 4.8c-6.94 1.6-10.67 5.33-10.67 11.2h9.87v16H23.2Z" />
              </svg>
              <Stars rating={sample.rating} />
              <p className="mt-2 text-dark text-sm leading-relaxed">&ldquo;{sample.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange/10 text-orange border border-orange/20 text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials(sample.client_name)}
                </div>
                <div>
                  <div className="font-semibold text-dark text-sm">{sample.client_name}</div>
                  {sample.client_role && (
                    <div className="text-xs text-neutral-500">{sample.client_role}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <TestimonialForm />
        </div>
      </section>
    </main>
  );
}
