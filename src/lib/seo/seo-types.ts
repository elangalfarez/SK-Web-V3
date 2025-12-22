// src/lib/seo/seo-types.ts
// TypeScript interfaces for SEO configuration

/**
 * Open Graph configuration for social media sharing
 */
export interface OpenGraphConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'place' | 'event';
  siteName?: string;
  locale?: string;
}

/**
 * Twitter Card configuration
 */
export interface TwitterCardConfig {
  card?: 'summary' | 'summary_large_image' | 'player';
  title?: string;
  description?: string;
  image?: string;
  site?: string;
}

/**
 * Structured data type identifiers for JSON-LD schemas
 */
export type StructuredDataType =
  | 'Organization'
  | 'WebSite'
  | 'LocalBusiness'
  | 'ShoppingCenter'
  | 'BreadcrumbList'
  | 'Event'
  | 'BlogPosting'
  | 'ItemList'
  | 'FAQPage'
  | 'Movie'
  | 'ContactPage';

/**
 * Structured data configuration for JSON-LD injection
 */
export interface StructuredDataConfig {
  type: StructuredDataType;
  data: Record<string, unknown>;
}

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Main SEO configuration interface
 */
export interface SEOConfig {
  // Basic meta tags
  title: string;
  description: string;
  canonical?: string;

  // Open Graph
  og?: OpenGraphConfig;

  // Twitter Cards
  twitter?: TwitterCardConfig;

  // Structured Data (JSON-LD)
  structuredData?: StructuredDataConfig | StructuredDataConfig[];

  // Additional meta tags
  robots?: string;
  keywords?: string;
  author?: string;
}

/**
 * Event data structure for schema generation
 */
export interface EventSchemaData {
  title: string;
  summary?: string | null;
  body?: string | null;
  slug: string;
  start_at: string;
  end_at?: string | null;
  venue?: string | null;
  images?: Array<{ url: string }>;
}

/**
 * Blog post data structure for schema generation
 */
export interface BlogPostSchemaData {
  title: string;
  summary?: string | null;
  slug: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  publish_at?: string | null;
  category?: { name: string } | null;
  tags?: string[];
}
