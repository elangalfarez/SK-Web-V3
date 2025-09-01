// src/lib/supabase.ts
// Modified: use tenant_directory view and update Tenant types
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Updated Tenant interface to match tenant_directory view
export interface Tenant {
  // Required from tenant_directory view
  id: string;
  tenant_code: string;
  name: string;
  description?: string | null;
  operating_hours?: any;
  phone?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_tenant: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  category_id?: string | null;
  category?: string | null;
  category_display?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  main_floor?: string | null;
  floor_name?: string | null;
  floor_number?: number | null;
  
  // Legacy/compat fields as optional (preserve backward compatibility)
  brand_name?: string;
  category_name?: string;
  email?: string | null;
  website?: string | null;
  total_locations?: number;
  services?: any;
  payment_methods?: any;
  price_range?: string | null;
  promotion_text?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  shopee_url?: string | null;
  tokopedia_url?: string | null;
  gallery_urls?: any;
  lease_status?: string;
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

export function parseJsonArray(data: any, defaultValue: any[] = []): any[] {
  if (!data) return defaultValue;
  if (Array.isArray(data)) return data;
  
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Fetch tenants from tenant_directory view with fallback to tenants table
 * Supports pagination, search, category, and floor filters
 */
export async function fetchTenants(params: TenantFetchParams = {}): Promise<TenantFetchResult> {
  const {
    page = 1,
    perPage = 50,
    categoryId,
    search,
    floorFilter
  } = params;

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    // Try tenant_directory view first
    let query = supabase
      .from('tenant_directory')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,tenant_code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category_display.ilike.%${searchTerm}%`);
    }

    if (floorFilter) {
      query = query.eq('main_floor', floorFilter.toUpperCase());
    }

    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const transformedData: Tenant[] = (data || []).map(tenant => ({
      ...tenant,
      // Add backward compatibility aliases
      brand_name: tenant.name, // Map name to brand_name for compatibility
      category_name: tenant.category_display || tenant.category,
      services: parseJsonArray(tenant.metadata?.services, []),
      payment_methods: parseJsonArray(tenant.metadata?.payment_methods, []),
      gallery_urls: parseJsonArray(tenant.metadata?.gallery_urls, []),
      lease_status: 'active', // Assume active since is_active=true
    }));

    const total = count || 0;
    const hasMore = (from + (data?.length || 0)) < total;

    return { data: transformedData, total, hasMore };

  } catch (error) {
    console.warn('tenant_directory unavailable, using tenants fallback', error);
    
    // Fallback to tenants table
    try {
      let fallbackQuery = supabase
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
            display_name,
            color,
            icon
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      if (categoryId && categoryId !== 'all') {
        fallbackQuery = fallbackQuery.eq('category_id', categoryId);
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        fallbackQuery = fallbackQuery.or(`name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (floorFilter) {
        fallbackQuery = fallbackQuery.eq('main_floor', floorFilter.toUpperCase());
      }

      const { data: fallbackData, error: fallbackError, count: fallbackCount } = await fallbackQuery
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })
        .range(from, to);

      if (fallbackError) {
        throw fallbackError;
      }

      const transformedFallbackData: Tenant[] = (fallbackData || []).map(tenant => ({
        ...tenant,
        category_display: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        category: tenant.tenant_categories?.name,
        category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        category_color: tenant.tenant_categories?.color,
        category_icon: tenant.tenant_categories?.icon,
        floor_name: tenant.main_floor, // Map main_floor to floor_name for compatibility
        services: parseJsonArray(tenant.services, []),
        payment_methods: parseJsonArray(tenant.payment_methods, []),
        gallery_urls: parseJsonArray(tenant.gallery_urls, []),
      }));

      const total = fallbackCount || 0;
      const hasMore = (from + (fallbackData?.length || 0)) < total;

      return { data: transformedFallbackData, total, hasMore };

    } catch (fallbackError) {
      console.error('Both tenant_directory and tenants table queries failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Fetch tenant categories (no change - still uses tenant_categories table)
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
 * Fetch featured tenants using tenant_directory view
 */
export async function fetchFeaturedTenants(limit: number = 12): Promise<Tenant[]> {
  try {
    // Try tenant_directory view first
    const { data, error } = await supabase
      .from('tenant_directory')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []).map(tenant => ({
      ...tenant,
      brand_name: tenant.name, // Map name to brand_name for compatibility
      category_name: tenant.category_display || tenant.category,
      services: parseJsonArray(tenant.metadata?.services, []),
      payment_methods: parseJsonArray(tenant.metadata?.payment_methods, []),
      gallery_urls: parseJsonArray(tenant.metadata?.gallery_urls, []),
      lease_status: 'active',
    }));

  } catch (error) {
    console.warn('tenant_directory unavailable for featured tenants, using fallback');
    
    // Fallback to tenants table
    try {
      const { data, error: fallbackError } = await supabase
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

      if (fallbackError) {
        throw fallbackError;
      }

      return (data || []).map(tenant => ({
        ...tenant,
        category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        category_display: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        services: parseJsonArray(tenant.services, []),
        payment_methods: parseJsonArray(tenant.payment_methods, []),
        gallery_urls: parseJsonArray(tenant.gallery_urls, []),
      }));
    } catch (fallbackError) {
      console.error('Featured tenants fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Fetch tenants by floor using tenant_directory view
 */
export async function fetchTenantsByFloor(floor: string): Promise<Tenant[]> {
  try {
    // Try tenant_directory view first
    const { data, error } = await supabase
      .from('tenant_directory')
      .select('*')
      .eq('main_floor', floor.toUpperCase())
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(tenant => ({
      ...tenant,
      brand_name: tenant.name, // Map name to brand_name for compatibility
      category_name: tenant.category_display || tenant.category,
      services: parseJsonArray(tenant.metadata?.services, []),
      payment_methods: parseJsonArray(tenant.metadata?.payment_methods, []),
      gallery_urls: parseJsonArray(tenant.metadata?.gallery_urls, []),
      lease_status: 'active',
    }));

  } catch (error) {
    console.warn('tenant_directory unavailable for floor query, using fallback');
    
    // Fallback to tenants table
    try {
      const { data, error: fallbackError } = await supabase
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

      if (fallbackError) {
        throw fallbackError;
      }

      return (data || []).map(tenant => ({
        ...tenant,
        category_name: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        category_display: tenant.tenant_categories?.display_name || tenant.tenant_categories?.name,
        services: parseJsonArray(tenant.services, []),
        payment_methods: parseJsonArray(tenant.payment_methods, []),
        gallery_urls: parseJsonArray(tenant.gallery_urls, []),
      }));
    } catch (fallbackError) {
      console.error('Floor tenants fallback failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Subscribe to tenant updates with fallback strategy
 * tenant_directory is a view - realtime on views is not guaranteed;
 * subscribe to underlying base tables for reliability
 */
export function subscribeTenantUpdates(
  callback: (payload: any) => void, 
  options: { enableViewSubscribe?: boolean } = {}
): () => void {
  const subscriptions: any[] = [];

  // Always subscribe to base tenants table for reliability
  const tenantSubscription = supabase
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
  subscriptions.push(tenantSubscription);

  // Also subscribe to tenant_locations_kiosk if it exists (for location changes)
  const locationSubscription = supabase
    .channel('tenant-location-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenant_locations_kiosk'
      },
      callback
    )
    .subscribe();
  subscriptions.push(locationSubscription);

  // Optionally try to subscribe to tenant_directory view if enabled
  if (options.enableViewSubscribe) {
    try {
      const viewSubscription = supabase
        .channel('tenant-directory-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tenant_directory'
          },
          callback
        )
        .subscribe();
      subscriptions.push(viewSubscription);
    } catch (error) {
      console.warn('Could not subscribe to tenant_directory view:', error);
    }
  }

  return () => {
    subscriptions.forEach(sub => sub.unsubscribe());
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

// All existing contact, VIP, and promotion functions remain unchanged
// Contact management functions
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
      .select('*', { count: 'exact' });

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

    const { data, error, count } = await query
      .order('submitted_date', { ascending: false })
      .range(from, to);

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

export async function submitContactForm(contactData: ContactInsert): Promise<Contact> {
  try {
    const submissionData = {
      ...contactData,
      submitted_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error submitting contact form:', error);
    throw error;
  }
}

export async function fetchContactStats() {
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

// Fallback data for VIP system
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

// VIP system functions
export async function fetchVipTiers(): Promise<VipTier[]> {
  try {
    const { data, error } = await supabase
      .from('vip_tiers')
      .select('*')
      .eq('is_active', true)
      .order('tier_level', { ascending: true });

    if (error) {
      console.error('Error fetching VIP tiers:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching VIP tiers:', error);
    throw error;
  }
}

/**
 * Fetch benefits for a specific VIP tier
 */
export async function fetchVipTierBenefits(tierId: string): Promise<VipBenefitWithNote[]> {
  try {
    const { data, error } = await supabase
      .from('vip_tier_benefits')
      .select(`
        benefit_note,
        display_order,
        vip_benefits (
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
      throw error;
    }

    const benefits: VipBenefitWithNote[] = (data || [])
      .filter(tb => tb.vip_benefits?.is_active)
      .map(tb => ({
        ...tb.vip_benefits,
        benefit_note: tb.benefit_note,
        display_order: tb.display_order
      }));

    return benefits;
  } catch (error) {
    console.error('Unexpected error fetching VIP tier benefits:', error);
    throw error;
  }
}

export async function fetchVipTierWithBenefits(tierId: string): Promise<VipTier & { benefits: VipBenefitWithNote[] }> {
  try {
    const { data: tier, error: tierError } = await supabase
      .from('vip_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('is_active', true)
      .single();

    if (tierError) {
      console.error('Error fetching VIP tier:', tierError);
      throw tierError;
    }

    const { data: tierBenefits, error: benefitsError } = await supabase
      .from('vip_tier_benefits')
      .select(`
        benefit_note,
        display_order,
        vip_benefits (
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

    if (benefitsError) {
      console.error('Error fetching VIP tier benefits:', benefitsError);
      throw benefitsError;
    }

    const benefits: VipBenefitWithNote[] = (tierBenefits || [])
      .filter(tb => tb.vip_benefits?.is_active)
      .map(tb => ({
        ...tb.vip_benefits,
        benefit_note: tb.benefit_note,
        display_order: tb.display_order
      }));

    return { ...tier, benefits };
  } catch (error) {
    console.error('Unexpected error fetching VIP tier with benefits:', error);
    throw error;
  }
}