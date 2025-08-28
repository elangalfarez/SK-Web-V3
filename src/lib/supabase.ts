// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Promotion {
  id: string;
  tenant_id: string;
  title: string;
  full_description: string | null;
  image_url: string | null;
  source_post: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'staging' | 'published' | 'expired';
  published_at: string | null;
  raw_json: any;
  created_at: string;
}

export interface Tenant {
  id: string;
  tenant_code: string;
  name: string;
  brand_name: string;
  category_id: string;
  description: string | null;
  operating_hours: any;
  phone: string | null;
  email: string | null;
  website: string | null;
  main_floor: string;
  total_locations: number;
  services: string[];
  payment_methods: string[];
  price_range: string | null;
  is_featured: boolean;
  is_new_tenant: boolean;
  promotion_text: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  shopee_url: string | null;
  tokopedia_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  gallery_urls: string[] | null;
  is_active: boolean;
  lease_status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface TenantCategory {
  id: string;
  name: string;
  display_name: string;
  tenant_count: number;
  icon: string;
  color: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface PromotionWithTenant {
  id: string;
  tenant_id: string;
  title: string;
  full_description: string | null;
  image_url: string | null;
  source_post: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'staging' | 'published' | 'expired';
  published_at: string | null;
  raw_json: any;
  created_at: string;
  tenant_name: string;
  brand_name: string;
  tenant_category: string;
  tenant_category_id: string;
}