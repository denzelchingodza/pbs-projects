"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import TestimonialModerationList from "@/components/admin/TestimonialModerationList";
import Reveal from "@/components/ui/Reveal";
import Spinner from "@/components/ui/Spinner";
import { getAdminTestimonials } from "@/lib/adminApi";
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminTestimonials()
      .then(setTestimonials)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load testimonials."));
  }, []);

  return (
    <Reveal>
    <div>
      <PageHeader
        title="Testimonials"
        description="Real customers can leave a testimonial from the site, pending ones stay off the homepage until you approve them."
      />
      <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-4 py-2.5 mb-8 inline-block">
        Pending testimonials are listed first. Approve to show it on the
        homepage, or delete it if it&apos;s spam or not something you want to show.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {testimonials === null ? (
        <div className="flex items-center gap-2.5 text-sm text-neutral-500">
          <Spinner />
          Loading testimonials...
        </div>
      ) : (
        <TestimonialModerationList
          testimonials={testimonials}
          onChange={(updated) =>
            setTestimonials((prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? null)
          }
        />
      )}
    </div>
    </Reveal>
  );
}
