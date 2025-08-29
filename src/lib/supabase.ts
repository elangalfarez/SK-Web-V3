// src/lib/supabase.ts
// Modified: consolidated client and queries, adapted types from actual DB schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on actual database schema
export interface Tenant {
  id: string;
  tenant_code: string;
  name: string;
  brand_name: string;
  category_id: string;
  description: string | null;
  operating_hours: any; // JSON object like {"mon-sun": "10:00-22:00"}
  phone: string | null;
  email: string | null;
  website: string | null;
  main_floor: string;
  total_locations: number;
  services: any; // Raw JSON from DB - will be parsed
  payment_methods: any; // Raw JSON from DB - will be parsed
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
  gallery_urls: any; // Raw JSON from DB - will be parsed
  is_active: boolean;
  lease_status: string;
  metadata: any; // JSON object
  created_at: string;
  updated_at: string;
  // Joined category data
  category_name?: string;
}

// Helper functions for safe JSON parsing
export function parseOperatingHours(hours: any): string {
  if (!hours) return 'See store for hours';
  
  try {
    if (typeof hours === 'string') {
      const parsed = JSON.parse(hours);
      return parsed['mon-sun'] || 'See store for hours';
    } else if (typeof hours === 'object' && hours['mon-sun']) {
      return hours['mon-sun'];
    }
    return 'See store for hours';
  } catch {
    return typeof hours === 'string' ? hours : 'See store for hours';
  }
}

export function parseJsonArray(jsonData: any): string[] {
  if (!jsonData) return [];
  
  try {
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') return JSON.parse(jsonData);
    return [];
  } catch {
    return [];
  }
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

export interface TenantFetchResult {
  data: Tenant[];
  total: number;
  hasMore: boolean;
}

export interface TenantFetchParams {
  page?: number;
  perPage?: number;
  categoryId?: string;
  search?: string;
  floorFilter?: string;
}

// Legacy types for existing PromotionsPage compatibility
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

/**
 * Fetch tenants with server-side pagination and filtering
 */
export async function fetchTenants(params: TenantFetchParams = {}): Promise<TenantFetchResult> {
  try {
    const {
      page = 1,
      perPage = 50,
      categoryId,
      search,
      floorFilter
    } = params;

    let query = supabase
      .from('tenants')
      .select(`
        id,
        tenant_code,
        name,
        brand_name,
        category_id,
        description,
        operating_hours,
        phone,
        email,
        website,
        main_floor,
        total_locations,
        services,
        payment_methods,
        price_range,
        is_featured,
        is_new_tenant,
        promotion_text,
        instagram,
        facebook,
        tiktok,
        shopee_url,
        tokopedia_url,
        logo_url,
        banner_url,
        gallery_urls,
        is_active,
        lease_status,
        metadata,
        created_at,
        updated_at,
        tenant_categories:category_id (
          name,
          display_name
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('lease_status', 'active');

    // Apply filters
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (floorFilter) {
      query = query.eq('main_floor', floorFilter.toUpperCase());
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Execute query with featured tenants first, then by name
    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }

    // Transform data to include category_name and parse JSON fields safely
    const transformedData: Tenant[] = (data || []).map(tenant => {
      try {
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
          // Ensure JSON fields are safely handled
          services: tenant.services || [],
          payment_methods: tenant.payment_methods || [],
          gallery_urls: tenant.gallery_urls || [],
          // Operating hours is handled by parseOperatingHours function
        };
      } catch (error) {
        console.error('Error transforming tenant data:', error, tenant);
        // Return a safe version of the tenant
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name || 'Unknown',
          services: [],
          payment_methods: [],
          gallery_urls: [],
        };
      }
    });

    const total = count || 0;
    const hasMore = (from + (data?.length || 0)) < total;

    return { data: transformedData, total, hasMore };
  } catch (error) {
    console.error('Unexpected error fetching tenants:', error);
    throw error;
  }
}

/**
 * Fetch all tenant categories ordered by sort_order
 */
export async function fetchTenantCategories(): Promise<TenantCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tenant_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tenant categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching tenant categories:', error);
    throw error;
  }
}

/**
 * Fetch featured tenants
 */
export async function fetchFeaturedTenants(limit: number = 12): Promise<Tenant[]> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        id,
        tenant_code,
        name,
        brand_name,
        category_id,
        description,
        operating_hours,
        main_floor,
        is_featured,
        is_new_tenant,
        logo_url,
        banner_url,
        is_active,
        lease_status,
        tenant_categories:category_id (
          name,
          display_name
        )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured tenants:', error);
      throw error;
    }

    // Transform data to include category_name and handle JSON fields safely
    return (data || []).map(tenant => {
      try {
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
          services: tenant.services || [],
          payment_methods: tenant.payment_methods || [],
          gallery_urls: tenant.gallery_urls || [],
        };
      } catch (error) {
        console.error('Error transforming featured tenant data:', error, tenant);
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name || 'Unknown',
          services: [],
          payment_methods: [],
          gallery_urls: [],
        };
      }
    });
  } catch (error) {
    console.error('Unexpected error fetching featured tenants:', error);
    throw error;
  }
}

/**
 * Fetch tenants by floor
 */
export async function fetchTenantsByFloor(floor: string): Promise<Tenant[]> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        id,
        tenant_code,
        name,
        brand_name,
        category_id,
        description,
        operating_hours,
        main_floor,
        is_featured,
        is_new_tenant,
        logo_url,
        is_active,
        tenant_categories:category_id (
          name,
          display_name
        )
      `)
      .eq('main_floor', floor.toUpperCase())
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants by floor:', error);
      throw error;
    }

    // Transform data to handle JSON fields safely
    return (data || []).map(tenant => {
      try {
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
          services: tenant.services || [],
          payment_methods: tenant.payment_methods || [],
          gallery_urls: tenant.gallery_urls || [],
        };
      } catch (error) {
        console.error('Error transforming floor tenant data:', error, tenant);
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name || 'Unknown',
          services: [],
          payment_methods: [],
          gallery_urls: [],
        };
      }
    });
  } catch (error) {
    console.error('Unexpected error fetching tenants by floor:', error);
    throw error;
  }
}

/**
 * Real-time subscription for tenant updates
 */
export function subscribeTenantUpdates(callback: (payload: any) => void): () => void {
  const subscription = supabase
    .channel('tenant-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenants',
        filter: 'is_active=eq.true'
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Real-time subscription for category updates
 */
export function subscribeCategoryUpdates(callback: (payload: any) => void): () => void {
  const subscription = supabase
    .channel('category-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenant_categories'
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}