export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
}

export type MediaType = "image" | "video";

export interface Project {
  id: number;
  title: string;
  category: string;
  image_url: string;
  media_type: MediaType;
  before_image_url?: string;
  is_featured?: boolean;
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

export interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  quote: string;
  rating: number;
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
