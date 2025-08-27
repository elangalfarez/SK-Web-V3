// src/lib/supabase-queries.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on your tenant data structure
export interface TenantData {
  id: string;
  tenant_code: string;
  name: string;
  brand_name: string;
  category_id: string;
  description: string;
  operating_hours: string;
  phone?: string;
  email?: string;
  website?: string;
  main_floor: string;
  total_locations: number;
  services: string;
  payment_methods: string;
  price_range?: string;
  is_featured: boolean;
  is_new_tenant: boolean;
  promotion_text?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  shopee_url?: string;
  tokopedia_url?: string;
  logo_url?: string;
  banner_url?: string;
  gallery_urls?: string;
  is_active: boolean;
  lease_status: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active: boolean;
}

// Fetch all active tenants with category information
export async function fetchTenants() {
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
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching tenants:', error);
    return { data: null, error };
  }
}

// Fetch tenants by category
export async function fetchTenantsByCategory(categoryId: string) {
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
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants by category:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching tenants by category:', error);
    return { data: null, error };
  }
}

// Search tenants by name, brand, or description
export async function searchTenants(query: string) {
  if (!query.trim()) {
    return fetchTenants();
  }

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
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .or(`name.ilike.%${query}%,brand_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching tenants:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error searching tenants:', error);
    return { data: null, error };
  }
}

// Fetch all categories with tenant counts
export async function fetchCategoriesWithCounts() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        icon,
        color,
        sort_order,
        is_active,
        tenants:tenants!category_id (
          count
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }

    // Transform data to include tenant counts
    const categoriesWithCounts = data?.map(category => ({
      ...category,
      tenant_count: category.tenants?.length || 0
    }));

    return { data: categoriesWithCounts, error: null };
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return { data: null, error };
  }
}

// Fetch featured tenants
export async function fetchFeaturedTenants() {
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
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true })
      .limit(12);

    if (error) {
      console.error('Error fetching featured tenants:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching featured tenants:', error);
    return { data: null, error };
  }
}

// Fetch tenants by floor
export async function fetchTenantsByFloor(floor: string) {
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
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('main_floor', floor.toUpperCase())
      .eq('is_active', true)
      .eq('lease_status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants by floor:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching tenants by floor:', error);
    return { data: null, error };
  }
}

// Real-time subscription for tenant updates
export function subscribeTenantUpdates(callback: (payload: any) => void) {
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

// Usage example with React hook
/*
import { useState, useEffect } from 'react';

export function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTenants = async () => {
      setLoading(true);
      const { data, error } = await fetchTenants();
      
      if (error) {
        setError(error);
      } else {
        setTenants(data || []);
      }
      
      setLoading(false);
    };

    loadTenants();

    // Subscribe to real-time updates
    const unsubscribe = subscribeTenantUpdates(() => {
      loadTenants(); // Reload data on updates
    });

    return unsubscribe;
  }, []);

  return { tenants, loading, error };
}
*/