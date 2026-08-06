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
import AboutIntro from "@/components/home/AboutIntro";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TeamSection from "@/components/home/TeamSection";
import QuoteSection from "@/components/quote/QuoteSection";
import Reveal from "@/components/ui/Reveal";
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
      {/* Hero is the first thing anyone sees, it renders in fully rather
          than fading up like everything below it, nothing should look
          like it's still loading in the one spot that paints first. */}
      <Hero />
      <Reveal>
        <Stats settings={settings} />
      </Reveal>
      <Reveal>
        <ProductsOverview products={products} />
      </Reveal>
      <Reveal>
        <FeaturedWork projects={projects} />
      </Reveal>
      <Reveal>
        <Testimonials testimonials={testimonials} />
      </Reveal>
      <Reveal>
        <AboutIntro settings={settings} />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <Reveal>
        <TeamSection />
      </Reveal>
      <Reveal>
        <QuoteSection products={products} settings={settings} />
      </Reveal>
    </main>
  );
}
