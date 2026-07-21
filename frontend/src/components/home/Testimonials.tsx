/**
 * Redesign notes: swapped the orange left-border card for a plain neutral
 * card with a large quotation mark and an initials avatar circle — reads
 * calmer and more like a corporate testimonials section, saving the orange
 * accent for the star rating only.
 *
 * Always renders (unlike before, which hid the whole section when there
 * were zero testimonials), so the "leave a testimonial" link is always
 * reachable, real customers now submit their own through the site instead
 * of this only ever showing seeded content.
 */
import Link from "next/link";
import type { Testimonial } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Clients Say"
          intro="Had work done by us? Leave your own testimonial, real feedback helps the next customer decide."
        />

        {testimonials.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">No testimonials yet</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              Be the first to share how your job went.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 flex flex-col"
              >
                <div className="text-orange text-sm mb-3 tracking-wide">
                  {"★".repeat(t.rating)}
                  <span className="text-neutral-300">{"★".repeat(5 - t.rating)}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-dark text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {initials(t.client_name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-dark">{t.client_name}</div>
                    {t.client_role && (
                      <div className="text-xs text-neutral-500">{t.client_role}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/testimonial"
            className="inline-block border border-neutral-300 text-dark px-7 py-3.5 rounded-md font-semibold text-sm hover:border-orange hover:text-orange transition"
          >
            Share Your Experience
          </Link>
        </div>
      </div>
    </section>
  );
}
