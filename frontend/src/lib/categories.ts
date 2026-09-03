/**
 * The 5 real gallery categories (matches backend VALID_CATEGORIES in
 * app/routers/admin.py), used anywhere photos get grouped, filtered, or
 * uploaded: the public gallery filter bar, the admin category grouping,
 * and the admin upload form. Defined once here so the label for
 * "showercubicles" (or any future category) can't drift between those
 * three places, which is exactly the bug that was fixed in Stage 10 by
 * hand-editing three separate arrays.
 */
export const GALLERY_CATEGORIES = [
  { value: "windows", label: "Windows" },
  { value: "doors", label: "Doors" },
  { value: "showercubicles", label: "Shower Cubicles" },
  { value: "shopfronts", label: "Shop Fronts" },
  { value: "ceilings", label: "Suspended Ceilings" },
  { value: "cabinets", label: "Cabinets" },
] as const;

export function categoryLabel(value: string): string {
  return GALLERY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/**
 * A product's own `slug` (set once in backend/seed.py, e.g. "shower-cubicles")
 * doesn't quite match its matching gallery category `value` above (e.g.
 * "showercubicles", no hyphen, an older, separate naming decision). This
 * maps one to the other so a product card can show a real photo pulled
 * from its own category's actual gallery projects instead of a generic
 * icon or no photo at all. Falls back to the slug itself for any product
 * whose slug already matches a category exactly (windows, doors, cabinets
 * all do), so this only needs entries for the ones that don't.
 */
const PRODUCT_SLUG_TO_CATEGORY: Record<string, string> = {
  "shower-cubicles": "showercubicles",
  "shop-fronts": "shopfronts",
  "suspended-ceilings": "ceilings",
};

export function productSlugToCategory(slug: string): string {
  return PRODUCT_SLUG_TO_CATEGORY[slug] ?? slug;
}

/**
 * Picks one real photo to represent a product on the Products page and its
 * homepage teaser (see ProductsOverview.tsx and app/products/page.tsx),
 * instead of a plain numbered card with no image. Prefers a featured
 * project in that category (an admin's own pick of the best example),
 * falls back to the first one uploaded if none are featured yet, and
 * skips a photo entirely (the card falls back to its numbered badge) for
 * any category with no real project photos at all yet, never a stock or
 * placeholder image standing in for PBS's own work.
 */
export function coverPhotoForCategory(
  projects: { category: string; is_featured?: boolean; media: { image_url: string; media_type: string }[] }[],
  category: string
): string | undefined {
  const inCategory = projects.filter((p) => p.category === category && p.media[0]?.media_type === "image");
  const featured = inCategory.find((p) => p.is_featured);
  return (featured ?? inCategory[0])?.media[0]?.image_url;
}

/**
 * Picks a real testimonial to pair with a product's photo (see the small
 * quote card on each product image in app/products/page.tsx). There's no
 * "which product is this testimonial about" field on a Testimonial (it's
 * just a name, role, quote, and rating), so this matches on whether the
 * quote text itself actually mentions the product, plain keyword matching
 * rather than a schema change for something this small. Only shows up
 * where a real testimonial genuinely mentions that product, most
 * categories won't have a match yet, and that's the honest state: PBS has
 * three real testimonials submitted so far, not one for every product.
 */
const CATEGORY_TESTIMONIAL_KEYWORDS: Record<string, string[]> = {
  windows: ["window"],
  doors: ["door"],
  showercubicles: ["shower", "cubicle"],
  shopfronts: ["shop front", "shopfront", "storefront"],
  ceilings: ["ceiling"],
  cabinets: ["cabinet"],
};

export function testimonialForCategory<T extends { quote: string }>(
  testimonials: T[],
  category: string
): T | undefined {
  const keywords = CATEGORY_TESTIMONIAL_KEYWORDS[category] ?? [];
  return testimonials.find((t) => keywords.some((k) => t.quote.toLowerCase().includes(k)));
}
