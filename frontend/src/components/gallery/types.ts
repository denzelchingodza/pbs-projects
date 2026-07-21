import type { MediaType } from "@/types";

/**
 * One individual photo or video, flattened out of a project for the full
 * gallery page's "see everything" browsing mode. A project with 3 photos
 * becomes 3 of these, each still carrying its project's title and category
 * so it can be filtered and captioned on its own.
 */
export interface PhotoItem {
  key: string;
  image_url: string;
  media_type: MediaType;
  title: string;
  category: string;
}
