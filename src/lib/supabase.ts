// src/lib/supabase.ts
// Modified: Added VIP tiers system functions and types
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Existing types (keeping all existing types)...
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
  services: any;
  payment_methods: any;
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
  gallery_urls: any;
  is_active: boolean;
  lease_status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  enquiry_type: 'General' | 'Leasing' | 'Marketing' | 'Legal' | 'Lost & Found' | 'Parking & Security';
  enquiry_details: string;
  submitted_date: string;
  created_at: string;
}

export interface ContactInsert {
  full_name: string;
  email: string;
  phone_number?: string | null;
  enquiry_type: 'General' | 'Leasing' | 'Marketing' | 'Legal' | 'Lost & Found' | 'Parking & Security';
  enquiry_details: string;
}

export interface ContactFetchResult {
  data: Contact[];
  total: number;
  hasMore: boolean;
}

export interface ContactFetchParams {
  page?: number;
  perPage?: number;
  enquiryType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// VIP system types - matching the SQL schema exactly
export interface VipTier {
  id: string;
  name: string;
  description: string;
  qualification_requirement: string;
  minimum_spend_amount: number;
  minimum_receipt_amount: number | null;
  tier_level: number;
  card_color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface VipBenefit {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface VipTierBenefit {
  id: string;
  tier_id: string;
  benefit_id: string;
  benefit_note: string | null;
  display_order: number;
  created_at: string;
}

export interface VipBenefitWithNote extends VipBenefit {
  benefit_note: string | null;
  display_order: number;
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

// Helper functions for safe JSON parsing (existing)
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

// VIP system functions - NEW ADDITIONS

/**
 * Fetch all active VIP tiers sorted by sort_order
 */
export async function fetchVipTiers(): Promise<VipTier[]> {
  try {
    const { data, error } = await supabase
      .from('vip_tiers')
      .select('id, name, description, qualification_requirement, minimum_spend_amount, minimum_receipt_amount, tier_level, card_color, sort_order, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching VIP tiers:', error);
      throw new Error(`Failed to fetch VIP tiers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching VIP tiers:', error);
    throw error;
  }
}

/**
 * Fetch all active VIP benefits
 */
export async function fetchVipBenefits(): Promise<VipBenefit[]> {
  try {
    const { data, error } = await supabase
      .from('vip_benefits')
      .select('id, name, description, icon, is_active, sort_order, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching VIP benefits:', error);
      throw new Error(`Failed to fetch VIP benefits: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching VIP benefits:', error);
    throw error;
  }
}

/**
 * Fetch benefits for a specific VIP tier with notes, ordered by display_order
 */
export async function fetchVipTierBenefits(tierId: string): Promise<VipBenefitWithNote[]> {
  try {
    const { data, error } = await supabase
      .from('vip_tier_benefits')
      .select(`
        id,
        tier_id,
        benefit_id,
        benefit_note,
        display_order,
        created_at,
        vip_benefits:benefit_id (
          id,
          name,
          description,
          icon,
          is_active,
          sort_order,
          created_at
        )
      `)
      .eq('tier_id', tierId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching VIP tier benefits:', error);
      throw new Error(`Failed to fetch VIP tier benefits: ${error.message}`);
    }

    // Transform the joined data
    const transformedData: VipBenefitWithNote[] = (data || []).map(item => {
      const benefit = item.vip_benefits as VipBenefit;
      return {
        ...benefit,
        benefit_note: item.benefit_note,
        display_order: item.display_order
      };
    }).filter(item => item.is_active);

    return transformedData;
  } catch (error) {
    console.error('Unexpected error fetching VIP tier benefits:', error);
    throw error;
  }
}

// Fallback data for offline/error scenarios
export const FALLBACK_VIP_TIERS: VipTier[] = [
  {
    id: 'fallback-1',
    name: 'Super VIP Flazz',
    description: 'Our most premium membership with full benefits including Flazz payment integration',
    qualification_requirement: 'Register at VIP Lounge and achieve minimum spend of Rp. 15 million in one month',
    minimum_spend_amount: 15000000,
    minimum_receipt_amount: null,
    tier_level: 1,
    card_color: '#8B5CF6',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-2',
    name: 'Super VIP',
    description: 'Premium membership with exclusive privileges and priority access',
    qualification_requirement: 'Register at VIP Lounge and achieve minimum spend of Rp. 10 million in one month',
    minimum_spend_amount: 10000000,
    minimum_receipt_amount: null,
    tier_level: 2,
    card_color: '#3B82F6',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-3',
    name: 'VIP Platinum',
    description: 'Platinum level membership with great benefits and privileges',
    qualification_requirement: 'Register at VIP Lounge and achieve minimum spend of Rp. 5 million in one month',
    minimum_spend_amount: 5000000,
    minimum_receipt_amount: null,
    tier_level: 3,
    card_color: '#6366F1',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-4',
    name: 'Shopping Card',
    description: 'Entry level VIP membership for frequent shoppers',
    qualification_requirement: 'Register at VIP Lounge with Rp. 500K in 1 shopping receipt on the same day',
    minimum_spend_amount: 0,
    minimum_receipt_amount: 500000,
    tier_level: 4,
    card_color: '#6B7280',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString()
  }
];

export const FALLBACK_VIP_BENEFITS: VipBenefit[] = [
  {
    id: 'fallback-benefit-1',
    name: 'Point Reward',
    description: 'Earn points on every purchase for exclusive rewards',
    icon: 'star',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-benefit-2',
    name: 'Discount Tenant',
    description: 'Special discounts at participating stores',
    icon: 'percent',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-benefit-3',
    name: 'Privilege Non-Tenant',
    description: 'Exclusive privileges and priority services',
    icon: 'crown',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-benefit-4',
    name: 'Premium Toilet',
    description: 'Access to premium restroom facilities',
    icon: 'door-open',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-benefit-5',
    name: 'Free Special Parking Area',
    description: 'Complimentary VIP parking access',
    icon: 'car',
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-benefit-6',
    name: 'Flazz Payment Integration',
    description: 'Use card for contactless payments at Flazz merchants',
    icon: 'credit-card',
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString()
  }
];

// Existing functions (keeping all existing functions unchanged)...

export async function submitContactForm(contactData: ContactInsert): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contacts')
      .insert([contactData]);

    if (error) {
      console.error('Contact form submission error:', error);
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error submitting contact form:', error);
    
    let errorMessage = 'Failed to submit contact form';
    
    if (error?.message?.includes('duplicate')) {
      errorMessage = 'This message has already been submitted recently';
    } else if (error?.message?.includes('network') || error?.code === 'PGRST301') {
      errorMessage = 'Network error. Please check your connection and try again';
    } else if (error?.message?.includes('validation')) {
      errorMessage = 'Please check your information and try again';
    } else if (error?.code === '23505') {
      errorMessage = 'A similar message was recently submitted';
    }

    return { success: false, error: errorMessage };
  }
}

export async function fetchContacts(params: ContactFetchParams = {}): Promise<ContactFetchResult> {
  try {
    const {
      page = 1,
      perPage = 50,
      enquiryType,
      search,
      dateFrom,
      dateTo
    } = params;

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('submitted_date', { ascending: false });

    if (enquiryType && enquiryType !== 'all') {
      query = query.eq('enquiry_type', enquiryType);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,enquiry_details.ilike.%${searchTerm}%`);
    }

    if (dateFrom) {
      query = query.gte('submitted_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('submitted_date', dateTo);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    const total = count || 0;
    const hasMore = (from + (data?.length || 0)) < total;

    return { data: data || [], total, hasMore };
  } catch (error) {
    console.error('Unexpected error fetching contacts:', error);
    throw error;
  }
}

export async function getContactStats(): Promise<{
  total: number;
  thisWeek: number;
  thisMonth: number;
  byEnquiryType: Record<string, number>;
}> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { count: total } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { count: thisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_date', weekAgo.toISOString());

    const { count: thisMonth } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_date', monthAgo.toISOString());

    const { data: typeBreakdown } = await supabase
      .from('contacts')
      .select('enquiry_type')
      .gte('submitted_date', monthAgo.toISOString());

    const byEnquiryType: Record<string, number> = {};
    typeBreakdown?.forEach(contact => {
      byEnquiryType[contact.enquiry_type] = (byEnquiryType[contact.enquiry_type] || 0) + 1;
    });

    return {
      total: total || 0,
      thisWeek: thisWeek || 0,
      thisMonth: thisMonth || 0,
      byEnquiryType
    };
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      byEnquiryType: {}
    };
  }
}

export function subscribeContactUpdates(callback: (payload: any) => void): () => void {
  const subscription = supabase
    .channel('contact-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts'
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

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

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }

    const transformedData: Tenant[] = (data || []).map(tenant => {
      try {
        return {
          ...tenant,
          category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
          services: tenant.services || [],
          payment_methods: tenant.payment_methods || [],
          gallery_urls: tenant.gallery_urls || [],
        };
      } catch (error) {
        console.error('Error transforming tenant data:', error, tenant);
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