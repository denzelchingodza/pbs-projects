"use client";

/**
 * Testimonials carousel — one card at a time, slides every 6 seconds,
 * manual prev/next arrows and dot nav. Replaces the grid layout that
 * stacked into multiple rows as testimonials grew.
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Testimonial } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setCurrent(index);
      setTimeout(() => setAnimating(false), 400);
    },
    [animating, current]
  );

  const prev = useCallback(() => {
    goTo((current - 1 + testimonials.length) % testimonials.length);
  }, [current, goTo, testimonials.length]);

  const next = useCallback(() => {
    goTo((current + 1) % testimonials.length);
  }, [current, goTo, testimonials.length]);

  // Auto-advance
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, testimonials.length]);

  return (
    <section className="px-6 md:px-8 py-20 bg-paper">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("testimonials.eyebrow", lang)}
          title={t("testimonials.title", lang)}
          intro={t("testimonials.intro", lang)}
        />

        {testimonials.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">{t("testimonials.emptyTitle", lang)}</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              {t("testimonials.emptyBody", lang)}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Slide window */}
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {testimonials.map((item) => (
                  <div key={item.id} className="w-full shrink-0">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
                      {/* Stars */}
                      <div className="text-orange text-lg mb-5 tracking-wide">
                        {"★".repeat(item.rating)}
                        <span className="text-neutral-200">{"★".repeat(5 - item.rating)}</span>
                      </div>

                      {/* Quote */}
                      <p className="text-lg md:text-xl text-dark leading-relaxed font-medium">
                        &ldquo;{item.quote}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="mt-8 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-dark text-white text-sm font-semibold flex items-center justify-center shrink-0">
                          {initials(item.client_name)}
                        </div>
                        <div>
                          <div className="font-semibold text-dark">{item.client_name}</div>
                          {item.client_role && (
                            <div className="text-sm text-neutral-500">{item.client_role}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-orange hover:border-orange transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Next testimonial"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-orange hover:border-orange transition-colors"
                >
                  ›
                </button>
              </>
            )}

            {/* Dot nav */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 h-2 bg-orange"
                        : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/testimonial"
            className="font-display inline-block border border-neutral-300 text-dark px-7 py-3.5 rounded-md font-semibold text-sm hover:border-orange hover:text-orange transition"
          >
            {t("testimonials.shareLink", lang)}
          </Link>
        </div>
      </div>
    </section>
  );
}
