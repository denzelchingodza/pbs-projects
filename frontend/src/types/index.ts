export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
}

export type MediaType = "image" | "video";

export interface ProjectMedia {
  id: number;
  image_url: string;
  media_type: MediaType;
}

/**
 * A Project is a real job, it can have one photo or several (the same site
 * photographed more than once). `media` is every photo/video for that job,
 * in upload order, `media[0]` is treated as the project's cover photo
 * everywhere it's shown as a single card (homepage, gallery grid).
 */
export interface Project {
  id: number;
  title: string;
  category: string;
  before_image_url?: string;
  is_featured?: boolean;
  created_at?: string;
  media: ProjectMedia[];
}

export interface QuoteRequest {
  full_name: string;
  phone: string;
  product?: string;
  details?: string;
}

export interface SiteSettings {
  business_name: string;
  address: string;
  phone_primary: string;
  phone_secondary?: string;
  whatsapp_number: string;
  email: string;
  map_lat?: number;
  map_lng?: number;
  owner_name?: string;
  owner_role?: string;
  owner_bio?: string;
  owner_photo_url?: string;
  years_experience?: number;
  founded_year?: number;
}

export type TestimonialStatus = "pending" | "approved";

export interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  quote: string;
  rating: number;
  status?: TestimonialStatus;
}

export type QuoteStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface AdminQuote {
  id: number;
  full_name: string;
  phone: string;
  product?: string;
  details?: string;
  status: QuoteStatus;
  admin_notes?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}
