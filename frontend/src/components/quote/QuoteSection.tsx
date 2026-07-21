"use client";

/**
 * Redesign notes: reuses SectionHeading now instead of its own one-off
 * eyebrow/heading markup, and the contact details below it use the same
 * neutral/orange-accent styling as the rest of the page instead of raw emoji.
 *
 * Now a Client Component so its heading follows the current language, the
 * actual QuoteForm below it (and its own field labels) is translated
 * separately, see QuoteForm.tsx.
 */
import type { Product, SiteSettings } from "@/types";
import QuoteForm from "./QuoteForm";
import SectionHeading from "@/components/ui/SectionHeading";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function QuoteSection({
  products,
  settings,
}: {
  products: Product[];
  settings: SiteSettings;
}) {
  const { lang } = useLanguage();
  return (
    <section id="quote" className="px-6 md:px-8 py-20 bg-neutral-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t("quote.eyebrow", lang)}
            title={t("quote.title", lang)}
            intro={t("quote.intro", lang)}
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
