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
