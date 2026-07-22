/**
 * One place for the handful of values every page's SEO metadata needs:
 * the site's real public address, and a couple of settings-derived
 * fallbacks. SITE_URL is a placeholder until the site has a real domain,
 * update it in frontend/.env.local (or the real hosting provider's
 * environment settings) once one exists, everything else here (sitemap,
 * Open Graph tags, canonical links) is built from this one value, so
 * there's only one place to change later.
 */
export const SITE_URL = process.env.SITE_URL || "https://pbsprojects.co.zw";

export const SITE_NAME = "PBS Projects";

export const DEFAULT_DESCRIPTION =
  "Windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets, based in Harare, Zimbabwe. Request a free quote.";
