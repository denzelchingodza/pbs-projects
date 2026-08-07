import type { Metadata } from "next";
import QuoteSection from "@/components/quote/QuoteSection";
import HowItWorks from "@/components/home/HowItWorks";
import Reveal from "@/components/ui/Reveal";
import { getSiteSettings, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description: "Tell us about your project and get a free, no obligation quote from PBS Projects in Harare.",
};

export default async function QuotePage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);
  return (
    <main>
      <QuoteSection products={products} settings={settings} />
      {/* Someone landing straight on this page (not scrolling down from the
          homepage) never sees the homepage's own HowItWorks section, so it
          repeats here too, right after the form instead of before it, this
          page's whole point is to be usable immediately, not to make the
          form wait behind an explainer first. */}
      <Reveal>
        <HowItWorks />
      </Reveal>
    </main>
  );
}
