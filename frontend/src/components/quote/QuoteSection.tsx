/**
 * Redesign notes: reuses SectionHeading now instead of its own one-off
 * eyebrow/heading markup, and the contact details below it use the same
 * neutral/orange-accent styling as the rest of the page instead of raw emoji.
 */
import type { Product, SiteSettings } from "@/types";
import QuoteForm from "./QuoteForm";
import SectionHeading from "@/components/ui/SectionHeading";

export default function QuoteSection({
  products,
  settings,
}: {
  products: Product[];
  settings: SiteSettings;
}) {
  return (
    <section id="quote" className="px-6 md:px-8 py-20 bg-neutral-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Get Started"
            title="Request a Free Quote"
            intro="Tell us what you need. No pricing pressure, we'll come back to you directly."
          />
          <div className="text-sm space-y-3 text-neutral-600">
            <p>{settings.address}</p>
            <p>
              <a
                href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
                className="font-semibold text-dark hover:text-orange transition-colors"
              >
                {settings.phone_primary}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-orange transition-colors"
              >
                {settings.email}
              </a>
            </p>
          </div>
        </div>
        <QuoteForm products={products} />
      </div>
    </section>
  );
}
