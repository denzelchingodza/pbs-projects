/**
 * Generates /robots.txt automatically. Lets every real page be crawled,
 * blocks the admin panel (nothing there for a search engine, and no
 * reason to point at it), and points crawlers at the sitemap above.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
