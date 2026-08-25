import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialForm from "@/components/testimonials/TestimonialForm";

export const metadata: Metadata = {
  title: "Leave a Testimonial",
  description: "Had work done by PBS Projects? Share your experience.",
};

export default function TestimonialPage() {
  return (
    <main>
      <section className="relative px-6 md:px-8 py-20 bg-neutral-50 overflow-hidden">
        <div className="absolute inset-0 pane-grid -z-10" aria-hidden="true" />
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            eyebrow="Share Your Experience"
            title="Leave a Testimonial"
            intro="Had work done by PBS Projects? Tell us how it went, real feedback like yours is what helps the next customer decide."
          />
          <TestimonialForm />
        </div>
      </section>
    </main>
  );
}
