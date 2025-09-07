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

// Updated Event interface - REPLACE the existing Event interface with this one
export interface Event {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  start_at: string;
  end_at: string | null;
  timezone: string | null;
  is_published: boolean;
  is_featured: boolean;
  venue: string | null;
  // REMOVED: location_lat, location_lng, accent_color, tickets_url
  images: EventImage[];
  tags: string[];
  summary: string | null; // Now properly optional with fallback support
  metadata: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface EventFetchParams {
  page?: number;
  perPage?: number;
  search?: string;
  upcomingOnly?: boolean;
  fromDate?: string;
  toDate?: string;
  isFeatured?: boolean;
  tags?: string[];
  isAdmin?: boolean;
}

export interface EventFetchResult {
  data: Event[];
  total: number;
  hasMore: boolean;
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
// Promotion types - enhanced with fetch parameters and results
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
  media_id?: string | null;
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
  media_id?: string | null;
  tenant_name: string;
  brand_name: string;
  tenant_category: string;
  tenant_category_display: string;
  tenant_category_id: string;
  category_color?: string;
  category_icon?: string;
  main_floor?: string | null;
}

export interface PromotionFetchParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  status?: 'staging' | 'published' | 'expired';
  onlyFeatured?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface PromotionFetchResult {
  data: PromotionWithTenant[];
  total: number;
  hasMore: boolean;
}

// Blog-related types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent_color: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body_html: string | null;
  category_id: string | null;
  category?: Pick<BlogCategory, 'id' | 'name' | 'slug' | 'accent_color'> | null;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  publish_at: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostFetchParams {
  search?: string;
  tags?: string[];
  categoryId?: string;
  isFeatured?: boolean;
  fromDate?: string;
  toDate?: string;
  isAdmin?: boolean;
  page?: number;
  perPage?: number;
}

export interface PostFetchResult {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
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
 * Helper function to safely parse JSON array values from database
 */
function safeParseJsonArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* EXPORTING FUNCTION OF EVENTS PAGE */
export function parseEventImages(images: any): EventImage[] {
  const parsed = parseJsonArray(images);
  return parsed.map(img => ({
    url: img.url || '',
    alt: img.alt || 'Event image',
    caption: img.caption || null
  }));
}

export function parseEventTags(tags: any): string[] {
  const parsed = parseJsonArray(tags);
  return parsed.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
}

// Generate URL-safe slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}


// ADD this new helper function for generating excerpts from body content
export function generateEventExcerpt(body: string | null, maxChars: number = 130): string {
  if (!body || typeof body !== 'string') {
    return '';
  }

  // Remove markdown headers, bold, italic, and other formatting
  const cleanText = body
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`(.*?)`/g, '$1') // Remove code formatting
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .trim();

  if (cleanText.length <= maxChars) {
    return cleanText;
  }

  // Find the last complete word before maxChars limit
  const truncated = cleanText.substring(0, maxChars);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxChars * 0.8) { // Only cut at word boundary if it's not too far back
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

// ADD this helper function to get event summary with fallback
export function getEventSummary(event: Event, maxChars: number = 130): string {
  // Use summary if available, otherwise generate excerpt from body
  if (event.summary && event.summary.trim()) {
    return event.summary.trim();
  }
  
  return generateEventExcerpt(event.body, maxChars);
}

/**
 * Fetch posts with optional filtering, pagination, and search
 * @param params - Filter and pagination parameters
 * @returns Promise resolving to posts with pagination metadata
 */
export async function fetchPosts(params: PostFetchParams = {}): Promise<PostFetchResult> {
  const {
    search,
    tags,
    categoryId,
    isFeatured,
    fromDate,
    toDate,
    isAdmin = false,
    page = 1,
    perPage = 12
  } = params;

  try {
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        summary,
        body_html,
        category_id,
        category:blog_categories(id,name,slug,accent_color),
        tags,
        is_published,
        is_featured,
        publish_at,
        image_url,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply published filter unless admin
    if (!isAdmin) {
      query = query
        .eq('is_published', true)
        .or('publish_at.is.null,publish_at.lte.' + new Date().toISOString());
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // Apply tag filter
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Apply featured filter
    if (isFeatured) {
      query = query.eq('is_featured', true);
    }

    // Apply date range filters
    if (fromDate) {
      query = query.gte('publish_at', fromDate);
    }
    if (toDate) {
      query = query.lte('publish_at', toDate);
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // Order by publish_at desc, then created_at desc
    query = query.order('publish_at', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      // Retry once on network error
      await new Promise(resolve => setTimeout(resolve, 500));
      const retryResult = await query;
      if (retryResult.error) {
        console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
        throw new Error(`Failed to fetch posts: ${retryResult.error.message}`);
      }
      return {
        posts: (retryResult.data || []).map(post => ({
          ...post,
          tags: safeParseJsonArray(post.tags)
        })),
        total: retryResult.count || 0,
        page,
        perPage,
        hasMore: (retryResult.count || 0) > to + 1
      };
    }

    const posts = (data || []).map(post => ({
      ...post,
      tags: safeParseJsonArray(post.tags)
    }));

    return {
      posts,
      total: count || 0,
      page,
      perPage,
      hasMore: (count || 0) > to + 1
    };

  } catch (error) {
    console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
    throw error;
  }
}

/**
 * Fetch a single post by slug
 * @param slug - Post slug identifier
 * @param options - Options including admin access
 * @returns Promise resolving to post or null if not found
 */
export async function fetchPostBySlug(
  slug: string, 
  options: { isAdmin?: boolean } = {}
): Promise<Post | null> {
  const { isAdmin = false } = options;

  try {
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        summary,
        body_html,
        category_id,
        category:blog_categories(id,name,slug,accent_color),
        tags,
        is_published,
        is_featured,
        publish_at,
        image_url,
        created_by,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .single();

    // Apply published filter unless admin
    if (!isAdmin) {
      query = query
        .eq('is_published', true)
        .or('publish_at.is.null,publish_at.lte.' + new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching post by slug:', error);
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 300));
      const retryResult = await query;
      if (retryResult.error) {
        console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
        return null;
      }
      return retryResult.data ? {
        ...retryResult.data,
        tags: safeParseJsonArray(retryResult.data.tags)
      } : null;
    }

    return data ? {
      ...data,
      tags: safeParseJsonArray(data.tags)
    } : null;

  } catch (error) {
    console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
    return null;
  }
}

/**
 * Fetch featured posts for display in hero sections
 * @param limit - Maximum number of posts to return
 * @returns Promise resolving to array of featured posts
 */
export async function fetchFeaturedPosts(limit: number = 6): Promise<Post[]> {
  try {
    const query = supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        summary,
        category_id,
        category:blog_categories(id,name,slug,accent_color),
        tags,
        is_published,
        is_featured,
        publish_at,
        image_url,
        created_at
      `)
      .eq('is_published', true)
      .eq('is_featured', true)
      .or('publish_at.is.null,publish_at.lte.' + new Date().toISOString())
      .order('publish_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching featured posts:', error);
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 300));
      const retryResult = await query;
      if (retryResult.error) {
        console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
        throw new Error(`Failed to fetch featured posts: ${retryResult.error.message}`);
      }
      return (retryResult.data || []).map(post => ({
        ...post,
        tags: safeParseJsonArray(post.tags)
      }));
    }

    return (data || []).map(post => ({
      ...post,
      tags: safeParseJsonArray(post.tags)
    }));

  } catch (error) {
    console.warn('WARN: posts query failed or returned no rows — using seeded posts fallback. Action: run migrations/001_create_blog_tables.sql and confirm RLS policies and published rows.');
    throw error;
  }
}

/**
 * Search posts for autocomplete/typeahead functionality
 * @param query - Search query string
 * @param limit - Maximum number of results
 * @returns Promise resolving to minimal post data for search results
 */
export async function searchPosts(
  query: string, 
  limit: number = 10
): Promise<Pick<Post, 'id' | 'title' | 'slug' | 'image_url' | 'summary' | 'publish_at'>[]> {
  if (!query.trim()) return [];

  try {
    const searchQuery = supabase
      .from('posts')
      .select('id,title,slug,image_url,summary,publish_at')
      .eq('is_published', true)
      .or('publish_at.is.null,publish_at.lte.' + new Date().toISOString())
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('publish_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    const { data, error } = await searchQuery;

    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.warn('Search posts failed, returning empty results');
    return [];
  }
}

/* All function related to new Promotions Page 
* added a safe fallback in case of image_url not found which causes image error to load */
// Utility function for safe image URL processing
function sanitizeImageUrl(url: any): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Check for common invalid formats
  if (url.includes('private') || url.includes('.heic') || url.length > 2000) {
    return null; // Invalid or problematic URL
  }
  
  try {
    new URL(url); // Validate URL format
    return url;
  } catch {
    return null;
  }
}

// Utility function for safe JSON parsing of raw_json
function parsePromotionRawJson(rawJson: any): any {
  if (!rawJson) return {};
  if (typeof rawJson === 'object') return rawJson;
  
  try {
    return JSON.parse(rawJson);
  } catch {
    return {};
  }
}

// Utility function for exponential backoff retry
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('network')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Fetch promotions with comprehensive filtering, pagination, and robust fallback
 * Primary: try v_promotions_full view
 * Fallback: direct JOIN query on promotions + tenants + tenant_categories
 */
export async function fetchPromotions(params: PromotionFetchParams = {}): Promise<PromotionFetchResult> {
  const {
    page = 1,
    perPage = 12,
    search,
    categoryId,
    status = 'published',
    onlyFeatured,
    fromDate,
    toDate
  } = params;

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Primary approach: try v_promotions_full view
  async function tryViewQuery(): Promise<PromotionFetchResult> {
    let query = supabase
      .from('v_promotions_full')
      .select('*', { count: 'exact' })
      .eq('status', status);

    // Apply filters
    if (search) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,tenant_name.ilike.%${searchTerm}%,full_description.ilike.%${searchTerm}%`);
    }

    if (categoryId) {
      query = query.eq('tenant_category_id', categoryId);
    }

    if (onlyFeatured) {
      query = query.eq('tenant_is_active', true);
    }

    if (fromDate) {
      query = query.gte('published_at', fromDate);
    }

    if (toDate) {
      query = query.lte('published_at', toDate);
    }

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const promotions = (data || []).map(promo => ({
      ...promo,
      image_url: sanitizeImageUrl(promo.image_url),
      raw_json: parsePromotionRawJson(promo.raw_json)
    }));

    return {
      data: promotions,
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  }

  // Fallback approach: direct JOIN query
  async function tryFallbackQuery(): Promise<PromotionFetchResult> {
    let query = supabase
      .from('promotions')
      .select(`
        id,
        tenant_id,
        title,
        full_description,
        image_url,
        source_post,
        start_date,
        end_date,
        status,
        published_at,
        raw_json,
        created_at,
        media_id,
        tenants!left (
          id,
          name,
          category_id,
          main_floor,
          is_active,
          tenant_categories!left (
            id,
            display_name,
            color,
            icon
          )
        )
      `, { count: 'exact' })
      .eq('status', status);

    // Apply filters (similar to view query)
    if (search) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,full_description.ilike.%${searchTerm}%`);
    }

    if (categoryId) {
      query = query.eq('tenants.category_id', categoryId);
    }

    if (onlyFeatured) {
      query = query.eq('tenants.is_active', true);
    }

    if (fromDate) {
      query = query.gte('published_at', fromDate);
    }

    if (toDate) {
      query = query.lte('published_at', toDate);
    }

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform to match PromotionWithTenant interface
    const promotions: PromotionWithTenant[] = (data || []).map(promo => {
      const tenant = promo.tenants || {};
      const category = tenant.tenant_categories || {};
      
      return {
        id: promo.id,
        tenant_id: promo.tenant_id,
        title: promo.title,
        full_description: promo.full_description,
        image_url: sanitizeImageUrl(promo.image_url),
        source_post: promo.source_post,
        start_date: promo.start_date,
        end_date: promo.end_date,
        status: promo.status,
        published_at: promo.published_at,
        raw_json: parsePromotionRawJson(promo.raw_json),
        created_at: promo.created_at,
        media_id: promo.media_id,
        tenant_name: tenant.name || 'Supermal Karawaci',
        brand_name: tenant.name || 'Supermal Karawaci',
        tenant_category: category.display_name || 'General',
        tenant_category_display: category.display_name || 'General', 
        tenant_category_id: tenant.category_id || '',
        category_color: category.color,
        category_icon: category.icon,
        main_floor: tenant.main_floor
      };
    });

    return {
      data: promotions,
      total: count || 0,
      hasMore: (count || 0) > to + 1
    };
  }

  try {
    return await retryWithBackoff(tryViewQuery);
  } catch (viewError: any) {
    console.warn('v_promotions_full query failed or returned no rows; falling back to direct promotions join. Check that v_promotions_full exists and RLS policies allow public SELECT.', viewError);
    
    try {
      return await retryWithBackoff(tryFallbackQuery);
    } catch (fallbackError: any) {
      console.error('Both view and fallback queries failed:', fallbackError);
      throw new Error('Failed to load promotions');
    }
  }
}

/**
 * Fetch featured promotions for homepage/promotional display
 */
export async function fetchFeaturedPromotions(limit: number = 6): Promise<PromotionWithTenant[]> {
  async function tryViewQuery(): Promise<PromotionWithTenant[]> {
    const { data, error } = await supabase
      .from('v_promotions_full')
      .select('*')
      .eq('status', 'published')
      .eq('tenant_is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(promo => ({
      ...promo,
      image_url: sanitizeImageUrl(promo.image_url),
      raw_json: parsePromotionRawJson(promo.raw_json)
    }));
  }

  async function tryFallbackQuery(): Promise<PromotionWithTenant[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select(`
        id,
        tenant_id,
        title,
        full_description,
        image_url,
        source_post,
        start_date,
        end_date,
        status,
        published_at,
        raw_json,
        created_at,
        media_id,
        tenants!left (
          id,
          name,
          category_id,
          main_floor,
          is_active,
          tenant_categories!left (
            id,
            display_name,
            color,
            icon
          )
        )
      `)
      .eq('status', 'published')
      .eq('tenants.is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(promo => {
      const tenant = promo.tenants || {};
      const category = tenant.tenant_categories || {};
      
      return {
        id: promo.id,
        tenant_id: promo.tenant_id,
        title: promo.title,
        full_description: promo.full_description,
        image_url: sanitizeImageUrl(promo.image_url),
        source_post: promo.source_post,
        start_date: promo.start_date,
        end_date: promo.end_date,
        status: promo.status,
        published_at: promo.published_at,
        raw_json: parsePromotionRawJson(promo.raw_json),
        created_at: promo.created_at,
        media_id: promo.media_id,
        tenant_name: tenant.name || 'Supermal Karawaci',
        brand_name: tenant.name || 'Supermal Karawaci',
        tenant_category: category.display_name || 'General',
        tenant_category_display: category.display_name || 'General',
        tenant_category_id: tenant.category_id || '',
        category_color: category.color,
        category_icon: category.icon,
        main_floor: tenant.main_floor
      };
    });
  }

  try {
    return await retryWithBackoff(tryViewQuery);
  } catch (viewError: any) {
    console.warn('v_promotions_full query failed for featured promotions; falling back to direct promotions join.', viewError);
    
    try {
      return await retryWithBackoff(tryFallbackQuery);
    } catch (fallbackError: any) {
      console.error('Both view and fallback queries failed for featured promotions:', fallbackError);
      return []; // Return empty array instead of throwing for featured promotions
    }
  }
}

/**
 * Fetch single promotion by ID with tenant information
 */
export async function fetchPromotionById(id: string, includeTenant: boolean = true): Promise<PromotionWithTenant | null> {
  if (!includeTenant) {
    // Simple promotion fetch without tenant info
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      image_url: sanitizeImageUrl(data.image_url),
      raw_json: parsePromotionRawJson(data.raw_json),
      tenant_name: 'Supermal Karawaci',
      brand_name: 'Supermal Karawaci',
      tenant_category: 'General',
      tenant_category_display: 'General',
      tenant_category_id: ''
    };
  }

  async function tryViewQuery(): Promise<PromotionWithTenant | null> {
    const { data, error } = await supabase
      .from('v_promotions_full')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      image_url: sanitizeImageUrl(data.image_url),
      raw_json: parsePromotionRawJson(data.raw_json)
    };
  }

  async function tryFallbackQuery(): Promise<PromotionWithTenant | null> {
    const { data, error } = await supabase
      .from('promotions')
      .select(`
        id,
        tenant_id,
        title,
        full_description,
        image_url,
        source_post,
        start_date,
        end_date,
        status,
        published_at,
        raw_json,
        created_at,
        media_id,
        tenants!left (
          id,
          name,
          category_id,
          main_floor,
          is_active,
          tenant_categories!left (
            id,
            display_name,
            color,
            icon
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const tenant = data.tenants || {};
    const category = tenant.tenant_categories || {};
    
    return {
      id: data.id,
      tenant_id: data.tenant_id,
      title: data.title,
      full_description: data.full_description,
      image_url: sanitizeImageUrl(data.image_url),
      source_post: data.source_post,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      published_at: data.published_at,
      raw_json: parsePromotionRawJson(data.raw_json),
      created_at: data.created_at,
      media_id: data.media_id,
      tenant_name: tenant.name || 'Supermal Karawaci',
      brand_name: tenant.name || 'Supermal Karawaci',
      tenant_category: category.display_name || 'General',
      tenant_category_display: category.display_name || 'General',
      tenant_category_id: tenant.category_id || '',
      category_color: category.color,
      category_icon: category.icon,
      main_floor: tenant.main_floor
    };
  }

  try {
    return await retryWithBackoff(tryViewQuery);
  } catch (viewError: any) {
    console.warn('v_promotions_full query failed for promotion by ID; falling back to direct promotions join.', viewError);
    
    try {
      return await retryWithBackoff(tryFallbackQuery);
    } catch (fallbackError: any) {
      console.error('Both view and fallback queries failed for promotion by ID:', fallbackError);
      return null;
    }
  }
}

/**
 * Search promotions by query string for autocomplete
 */
export async function searchPromotions(query: string, limit: number = 10): Promise<Promotion[]> {
  if (!query.trim()) return [];

  const searchTerm = query.trim();

  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('id, title, image_url, published_at, tenant_id, status')
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,full_description.ilike.%${searchTerm}%`)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(promo => ({
      ...promo,
      image_url: sanitizeImageUrl(promo.image_url),
      full_description: null,
      source_post: null,
      start_date: null,
      end_date: null,
      raw_json: {},
      created_at: promo.published_at || new Date().toISOString(),
      media_id: null
    }));
  } catch (error) {
    console.error('Error searching promotions:', error);
    return [];
  }
}

/**
 * Fetch events with comprehensive filtering and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise resolving to events fetch result
 */
export async function fetchEvents(params: EventFetchParams = {}): Promise<EventFetchResult> {
  try {
    const {
      page = 1,
      perPage = 12,
      search,
      upcomingOnly = false,
      fromDate,
      toDate,
      isFeatured,
      tags = [],
      isAdmin = false
    } = params;

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });

    // Filter by published status unless admin
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    // Search functionality - title, body, and summary
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`);
    }

    // Filter by upcoming events only
    if (upcomingOnly) {
      query = query.gte('start_at', new Date().toISOString());
    }

    // Date range filtering
    if (fromDate) {
      query = query.gte('start_at', fromDate);
    }
    
    if (toDate) {
      query = query.lte('start_at', toDate);
    }

    // Featured filter
    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured);
    }

    // Tags filtering (if any tags match)
    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
      .order('start_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    // Transform data - parse JSON fields safely
    const transformedData: Event[] = (data || []).map(event => ({
    ...event,
    images: parseEventImages(event.images),
    tags: parseEventTags(event.tags)
    // Note: summary fallback is handled in UI components using getEventSummary()
    }));

    const total = count || 0;
    const hasMore = (from + (transformedData.length || 0)) < total;

    return { data: transformedData, total, hasMore };
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    throw error;
  }
}

/**
 * Fetch a single event by slug
 * @param slug - URL slug of the event
 * @param isAdmin - Whether to fetch unpublished events (admin access)
 * @returns Promise resolving to event or null if not found
 */
export async function fetchEventBySlug(slug: string, isAdmin: boolean = false): Promise<Event | null> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('slug', slug);

    // Filter by published status unless admin
    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching event by slug:', error);
      throw error;
    }

    // Transform data - parse JSON fields safely
    return {
      ...data,
      images: parseEventImages(data.images),
      tags: parseEventTags(data.tags)
    };
  } catch (error) {
    console.error('Unexpected error fetching event by slug:', error);
    throw error;
  }
}

/**
 * Fetch featured events for homepage/promotional use
 * @param limit - Maximum number of events to return (default 6)
 * @returns Promise resolving to array of featured events
 */
export async function fetchFeaturedEvents(limit: number = 6): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('start_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }

    // Transform data - parse JSON fields safely
    return (data || []).map(event => ({
      ...event,
      images: parseEventImages(event.images),
      tags: parseEventTags(event.tags)
    }));
  } catch (error) {
    console.error('Unexpected error fetching featured events:', error);
    throw error;
  }
}

/**
 * Search events by query string
 * @param query - Search term
 * @param limit - Maximum results to return (default 10)
 * @returns Promise resolving to array of matching events
 */
export async function searchEvents(query: string, limit: number = 10): Promise<Event[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const searchTerm = query.trim();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)
      .order('start_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching events:', error);
      throw error;
    }

    // Transform data - parse JSON fields safely
    return (data || []).map(event => ({
      ...event,
      images: parseEventImages(event.images),
      tags: parseEventTags(event.tags)
    }));
  } catch (error) {
    console.error('Unexpected error searching events:', error);
    throw error;
  }
}

/**
 * Create or update an event (admin function)
 * @param eventData - Event data to insert/update
 * @param eventId - ID for update, omit for insert
 * @returns Promise resolving to created/updated event
 */
export async function createOrUpdateEvent(
  eventData: Partial<Event>, 
  eventId?: string
): Promise<Event> {
  try {
    // Generate slug if title provided and no slug exists
    if (eventData.title && !eventData.slug) {
      eventData.slug = generateSlug(eventData.title);
    }

    // Ensure JSON fields are properly formatted
    const processedData = {
      ...eventData,
      images: JSON.stringify(eventData.images || []),
      tags: JSON.stringify(eventData.tags || []),
      metadata: JSON.stringify(eventData.metadata || {})
    };

    let query = supabase.from('events');
    
    if (eventId) {
      // Update existing event
      const { data, error } = await query
        .update(processedData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        images: parseEventImages(data.images),
        tags: parseEventTags(data.tags)
      };
    } else {
      // Create new event
      const { data, error } = await query
        .insert([processedData])
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        images: parseEventImages(data.images),
        tags: parseEventTags(data.tags)
      };
    }
  } catch (error) {
    console.error('Error creating/updating event:', error);
    throw error;
  }
}

/**
 * Get unique event tags for filtering
 * @returns Promise resolving to array of unique tags
 */
export async function fetchEventTags(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching event tags:', error);
      throw error;
    }

    // Extract and flatten all tags
    const allTags = (data || [])
      .map(event => parseEventTags(event.tags))
      .flat()
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Unique only
      .sort();

    return allTags;
  } catch (error) {
    console.error('Unexpected error fetching event tags:', error);
    throw error;
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