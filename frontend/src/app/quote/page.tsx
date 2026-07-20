import QuoteSection from "@/components/quote/QuoteSection";
import { getSiteSettings, getProducts } from "@/lib/api";

export default async function QuotePage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);
  return (
    <main>
      <QuoteSection products={products} settings={settings} />
    </main>
  );
}
