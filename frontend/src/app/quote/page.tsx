import type { Metadata } from "next";
import QuoteSection from "@/components/quote/QuoteSection";
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
    </main>
  );
}
