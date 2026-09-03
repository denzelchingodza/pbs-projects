/**
 * Full Products page, a Server Component fetching the real product list.
 * The homepage has a shorter teaser version of this same grid
 * (components/home/ProductsOverview.tsx); this page is the full version
 * with more room per product and a direct link into the quote form.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import FrameCorners from "@/components/ui/FrameCorners";
import { getProducts, getProjects, getTestimonials } from "@/lib/api";
import { productSlugToCategory, coverPhotoForCategory, testimonialForCategory } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";

export const metadata: Metadata = {
  title: "Products & Services",
  description: "Windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets, made and fitted by PBS Projects in Harare.",
};

export default async function ProductsPage() {
  const [products, projects, testimonials] = await Promise.all([
    getProducts(),
    getProjects(),
    getTestimonials(),
  ]);

  return (
    <main>
      <section className="px-6 md:px-8 pt-16 pb-14 md:pt-20 bg-paper">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            What We Build
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            Our Products
          </h1>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            Six product lines, made to measure. Every job is quoted individually,
            so sizes, finishes, and materials are matched to your space, not sold
            off a shelf.
          </p>
          <p className="mt-5 max-w-md mx-auto text-sm font-medium text-dark bg-orange/10 border-l-2 border-orange rounded-r-md px-4 py-3 text-left">
            Have a specific color, finish, or material in mind? If it can be
            sourced, we&apos;ll build your job with it.
          </p>
        </div>
      </section>

      <Reveal>
        <section className="px-6 md:px-8 pb-20 bg-paper">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
            {products.map((p: { id: number; name: string; slug: string; description?: string }, i: number) => {
              const category = productSlugToCategory(p.slug);
              const cover = coverPhotoForCategory(projects, category);
              const testimonial = testimonialForCategory(testimonials, category);
              const badge = (
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange text-white text-xs font-bold shadow-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              );
              return (
                <div
                  key={p.id}
                  className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-orange/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {cover ? (
                    <div className="photo-frame shine-hover relative aspect-[16/10] bg-neutral-900">
                      <Image
                        src={mediaUrl(cover)}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 z-10">{badge}</div>
                      <FrameCorners />
                      {/* A small real testimonial, when one genuinely mentions this
                          product (see testimonialForCategory in lib/categories.ts),
                          sat right on the photo instead of buried further down the
                          page, so the proof and the product are seen together. */}
                      {testimonial && (
                        <div className="absolute inset-x-3 bottom-3 z-10">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3.5 py-3 shadow-md">
                            <div className="text-orange text-[10px] leading-none mb-1.5" aria-hidden="true">
                              {"★".repeat(testimonial.rating)}
                              <span className="text-neutral-300">
                                {"★".repeat(5 - testimonial.rating)}
                              </span>
                            </div>
                            <p className="text-dark text-xs leading-snug font-medium line-clamp-2">
                              &ldquo;{testimonial.quote}&rdquo;
                            </p>
                            <p className="text-neutral-500 text-[11px] mt-1">
                              {testimonial.client_name}
                              {testimonial.client_role ? `, ${testimonial.client_role}` : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-7 pb-0">{badge}</div>
                  )}
                  <div className="p-7">
                    <h2 className="text-lg font-bold text-dark">{p.name}</h2>
                    {p.description && (
                      <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.description}</p>
                    )}
                    <Link
                      href="/quote"
                      className="inline-block mt-5 text-sm font-semibold text-orange hover:text-dark transition-colors"
                    >
                      Request a quote for {p.name.toLowerCase()} &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="px-6 md:px-8 py-16 bg-neutral-50 text-center">
          <h2 className="text-2xl font-bold text-dark tracking-tight mb-3">
            Not sure which product fits your space?
          </h2>
          <p className="text-neutral-500 text-sm mb-7 max-w-md mx-auto">
            Send us a few details and photos of the space, we&apos;ll recommend the
            right option and give you a straight quote.
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
