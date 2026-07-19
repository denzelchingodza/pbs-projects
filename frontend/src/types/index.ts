export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  image_url: string;
  before_image_url?: string;
}

export interface QuoteRequest {
  full_name: string;
  phone: string;
  product?: string;
  details?: string;
}
