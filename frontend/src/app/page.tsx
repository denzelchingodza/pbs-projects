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
import FindUs from "@/components/home/FindUs";
import HowItWorks from "@/components/home/HowItWorks";
import QuoteSection from "@/components/quote/QuoteSection";
import Reveal from "@/components/ui/Reveal";
import SectionSeam from "@/components/ui/SectionSeam";
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
      {/* SectionSeam marks a few (not every) white/neutral-50 handoffs with a
          small tick-mark divider, styled after a sliding window's own
          track, instead of every section boundary just being an invisible
          background-color change. */}
      <SectionSeam tone="white" />
      <Reveal>
        <ProductsOverview products={products} projects={projects} />
      </Reveal>
      <Reveal>
        <FeaturedWork projects={projects} />
      </Reveal>
      <SectionSeam tone="white" />
      <Reveal>
        <Testimonials testimonials={testimonials} />
      </Reveal>
      <Reveal>
        <AboutIntro settings={settings} projects={projects} />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <Reveal>
        <TeamSection />
      </Reveal>
      {/* Where PBS actually is, brought back to the homepage (see
          FindUs.tsx's own doc comment for why it had gone missing). Same
          white as TeamSection above and HowItWorks below, so all three
          keep reading as one "here's who we are, where we are, and how
          this works" band right before the neutral-50 Quote section
          closes it out. */}
      <Reveal>
        <FindUs settings={settings} />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <SectionSeam tone="neutral" />
      <Reveal>
        <QuoteSection products={products} settings={settings} />
      </Reveal>
    </main>
  );
}
