/**
 * A small, dependency-free translation dictionary, not a full i18n library,
 * this site only needs two languages and a fixed set of strings, a heavier
 * framework would be more machinery than the job needs. Every key has an
 * English string, `sn` (Shona) is filled in as real translations come in
 * from Denzel, if a key has no Shona text yet, it just falls back to
 * English rather than showing blank or broken text, so the toggle is
 * always safe to use even while translations are still being added.
 *
 * Some strings use {placeholders} for values that get filled in at
 * render time (a business name, a year count), the Shona text for those
 * keys should keep the same {placeholder} names, just moved to wherever
 * they naturally fit in the Shona sentence.
 */
export type Lang = "en" | "sn";

type Entry = { en: string; sn?: string };

export const translations: Record<string, Entry> = {
  // Navigation
  "nav.home": { en: "Home" },
  "nav.ourWork": { en: "Our Work" },
  "nav.products": { en: "Products" },
  "nav.about": { en: "About" },
  "nav.getQuote": { en: "Get a Quote" },

  // Homepage hero
  "hero.title": { en: "Glass & aluminum work you can trust" },
  "hero.subtitle": {
    en: "Windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets, installed by a team that's been in the trade for years, not just in business for three.",
  },
  "hero.ctaQuote": { en: "Get a Free Quote" },
  "hero.ctaWork": { en: "View Our Work" },

  // Homepage stats strip
  "stats.years": { en: "Years in Business" },
  "stats.categories": { en: "Product Categories" },
  "stats.based": { en: "Based, Serving All Zimbabwe" },

  // Homepage products teaser
  "products.eyebrow": { en: "What We Build" },
  "products.title": { en: "Our Products" },
  "products.intro": {
    en: "Six core product lines, made to measure for homes, shops, and offices across Zimbabwe.",
  },

  // Homepage "Our Work" / featured projects
  "work.eyebrow": { en: "Portfolio" },
  "work.title": { en: "Our Work" },
  "work.intro": {
    en: "A look at real installations, straight from completed jobs, updated directly by the PBS team.",
  },
  "work.comingSoonTitle": { en: "Project photos coming soon" },
  "work.comingSoonBody": {
    en: "We're adding photos of our recent installations, check back shortly, or view examples of our product categories above.",
  },
  "work.viewGallery": { en: "View Full Gallery" },

  // Homepage testimonials
  "testimonials.eyebrow": { en: "Testimonials" },
  "testimonials.title": { en: "What Clients Say" },
  "testimonials.intro": {
    en: "Had work done by us? Leave your own testimonial, real feedback helps the next customer decide.",
  },
  "testimonials.emptyTitle": { en: "No testimonials yet" },
  "testimonials.emptyBody": { en: "Be the first to share how your job went." },
  "testimonials.shareLink": { en: "Share Your Experience" },

  // Homepage quote section
  "quote.eyebrow": { en: "Get Started" },
  "quote.title": { en: "Request a Free Quote" },
  "quote.intro": { en: "Tell us what you need. No pricing pressure, we'll come back to you directly." },

  // Quote form
  "quoteForm.fullName": { en: "Full Name" },
  "quoteForm.phone": { en: "Phone / WhatsApp" },
  "quoteForm.product": { en: "Product" },
  "quoteForm.details": { en: "Tell us about the job" },
  "quoteForm.detailsPlaceholder": { en: "Rough size, location, timeline..." },
  "quoteForm.send": { en: "Send Request" },
  "quoteForm.sending": { en: "Sending..." },
  "quoteForm.errorMsg": {
    en: "Something went wrong sending your request. Please try again, or WhatsApp us directly.",
  },
  "quoteForm.successTitle": { en: "Request Sent!" },
  "quoteForm.successBody": { en: "Thanks, we'll be in touch shortly to follow up on your quote." },

  // Testimonial form
  "testimonialForm.yourName": { en: "Your Name" },
  "testimonialForm.role": { en: "Role (optional)" },
  "testimonialForm.rolePlaceholder": { en: "e.g. Homeowner, Waterfalls" },
  "testimonialForm.rating": { en: "Rating" },
  "testimonialForm.experience": { en: "Your Experience" },
  "testimonialForm.experiencePlaceholder": { en: "Tell us how the job went..." },
  "testimonialForm.submit": { en: "Submit Testimonial" },
  "testimonialForm.sending": { en: "Sending..." },
  "testimonialForm.errorMsg": {
    en: "Something went wrong sending your testimonial. Please try again, or WhatsApp us directly.",
  },
  "testimonialForm.successTitle": { en: "Thank You!" },
  "testimonialForm.successBody": {
    en: "We appreciate you taking the time. It will show on the site once we've had a look, usually within a day or two.",
  },

  // About page
  "about.eyebrow": { en: "About Us" },
  "about.title": { en: "Built on real trade experience, not just a business plan" },
  "about.introWithYears": {
    en: "{business} is a Harare based glass and aluminum specialist, running for {years}+ years, covering windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets for homes, shops, and offices across Zimbabwe.",
  },
  "about.introNoYears": {
    en: "{business} is a Harare based glass and aluminum specialist, covering windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets for homes, shops, and offices across Zimbabwe.",
  },
  "about.realWorkEyebrow": { en: "Real Work" },
  "about.realWorkTitle": { en: "A few completed jobs" },
  "about.findUs": { en: "Find Us" },

  // Why Choose Us (About page)
  "whyChooseUs.title1": { en: "Real trade experience" },
  "whyChooseUs.body1": {
    en: "Years actually cutting, fitting, and sealing glass and aluminum, not just running a business that sells it.",
  },
  "whyChooseUs.title2": { en: "Measured and built to fit" },
  "whyChooseUs.body2": {
    en: "Every window, door, or cubicle is measured for its own opening and built to that size, not sold off a shelf.",
  },
  "whyChooseUs.title3": { en: "Local, based in Harare" },
  "whyChooseUs.body3": {
    en: "On the ground in Zimbabwe, available for a site visit, a straight quote, and support after the job is done.",
  },

  // Meet the Founder (About page)
  "aboutFounder.eyebrow": { en: "Meet the Founder" },
  "aboutFounder.fallbackBio": {
    en: "Full bio coming soon. In the meantime, get in touch directly, our team is happy to talk through any glass and aluminum project, big or small.",
  },
};

/** Fills in {placeholders} in a translated string with real values, e.g.
 * fillTemplate(t("about.introWithYears", lang), { business: "PBS Projects", years: 5 }). */
export function fillTemplate(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text
  );
}

export function t(key: string, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  if (lang === "en") return entry.en;
  return entry.sn ?? entry.en;
}
