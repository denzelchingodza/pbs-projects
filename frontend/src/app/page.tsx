/**
 * Home page — a Server Component (no "use client"), so it can fetch all its
 * data directly with `await` before rendering, then pass it down as props to
 * each section component. This keeps every data-fetching call in one place
 * instead of scattered across child components.
 */
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import ProductsOverview from "@/components/home/ProductsOverview";
import FeaturedWork from "@/components/home/FeaturedWork";
import Testimonials from "@/components/home/Testimonials";
import QuoteSection from "@/components/quote/QuoteSection";
import { getSiteSettings, getProducts, getProjects, getTestimonials } from "@/lib/api";

export default async function HomePage() {
  const [settings, products, projects, testimonials] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getProjects(),
    getTestimonials(),
  ]);

  return (
    <main>
      <Hero />
      <Stats settings={settings} />
      <ProductsOverview products={products} />
      <FeaturedWork projects={projects} />
      <Testimonials testimonials={testimonials} />
      <QuoteSection products={products} settings={settings} />
    </main>
  );
}
