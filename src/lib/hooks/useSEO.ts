// src/lib/hooks/useSEO.ts
// Zero-dependency SEO hook using direct DOM manipulation

import { useEffect, useRef } from 'react';
import type { SEOConfig, BreadcrumbItem } from '../seo/seo-types';
import { DEFAULT_SEO, SITE_NAME } from '../seo/seo-config';
import { generateBreadcrumbSchema } from '../seo/structured-data';

/**
 * useSEO - Comprehensive SEO hook for managing document head meta tags
 *
 * Features:
 * - Dynamic document.title updates
 * - Meta tags (description, robots, keywords, author)
 * - Open Graph tags for social media
 * - Twitter Card tags
 * - Canonical URL management
 * - JSON-LD structured data injection
 * - Automatic cleanup on unmount
 *
 * @param config - Partial SEO configuration (merged with defaults)
 * @param breadcrumbs - Optional breadcrumb items for BreadcrumbList schema
 *
 * @example
 * // Basic usage
 * useSEO({ title: 'Page Title', description: 'Page description' });
 *
 * @example
 * // With Open Graph and structured data
 * useSEO({
 *   title: 'Event Name',
 *   description: 'Event description',
 *   og: { type: 'event', image: eventImage },
 *   structuredData: { type: 'Event', data: eventSchema }
 * }, [{ name: 'Home', url: '/' }, { name: 'Events', url: '/event' }]);
 */
export function useSEO(
  config: Partial<SEOConfig>,
  breadcrumbs?: BreadcrumbItem[]
): void {
  const scriptTagsRef = useRef<HTMLScriptElement[]>([]);
  const createdTagsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Merge with defaults
    const fullConfig: SEOConfig = {
      ...DEFAULT_SEO,
      ...config,
      og: { ...DEFAULT_SEO.og, ...config.og },
      twitter: { ...DEFAULT_SEO.twitter, ...config.twitter },
    };

    // 1. Update document title
    const formattedTitle = fullConfig.title.includes(SITE_NAME)
      ? fullConfig.title
      : `${fullConfig.title} | ${SITE_NAME}`;
    document.title = formattedTitle;

    // 2. Update meta tags
    updateMetaTag('description', fullConfig.description);
    if (fullConfig.robots) updateMetaTag('robots', fullConfig.robots);
    if (fullConfig.keywords) updateMetaTag('keywords', fullConfig.keywords);
    if (fullConfig.author) updateMetaTag('author', fullConfig.author);

    // 3. Update Open Graph tags
    updateMetaTag(
      'og:title',
      fullConfig.og?.title || fullConfig.title,
      'property'
    );
    updateMetaTag(
      'og:description',
      fullConfig.og?.description || fullConfig.description,
      'property'
    );
    updateMetaTag('og:type', fullConfig.og?.type || 'website', 'property');
    updateMetaTag(
      'og:url',
      fullConfig.og?.url || fullConfig.canonical || window.location.href,
      'property'
    );
    updateMetaTag(
      'og:site_name',
      fullConfig.og?.siteName || SITE_NAME,
      'property'
    );
    updateMetaTag('og:locale', fullConfig.og?.locale || 'id_ID', 'property');
    if (fullConfig.og?.image) {
      updateMetaTag('og:image', fullConfig.og.image, 'property');
      updateMetaTag(
        'og:image:alt',
        fullConfig.og?.title || fullConfig.title,
        'property'
      );
    }

    // 4. Update Twitter Card tags
    updateMetaTag(
      'twitter:card',
      fullConfig.twitter?.card || 'summary_large_image'
    );
    updateMetaTag(
      'twitter:title',
      fullConfig.twitter?.title || fullConfig.title
    );
    updateMetaTag(
      'twitter:description',
      fullConfig.twitter?.description || fullConfig.description
    );
    if (fullConfig.twitter?.site) {
      updateMetaTag('twitter:site', fullConfig.twitter.site);
    }
    if (fullConfig.twitter?.image) {
      updateMetaTag('twitter:image', fullConfig.twitter.image);
    }

    // 5. Update canonical URL
    updateCanonicalLink(fullConfig.canonical || window.location.href);

    // 6. Clean up existing structured data scripts
    cleanupStructuredData();

    // 7. Add breadcrumb schema if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
      injectStructuredData(breadcrumbSchema);
    }

    // 8. Add page-specific structured data
    if (fullConfig.structuredData) {
      const schemas = Array.isArray(fullConfig.structuredData)
        ? fullConfig.structuredData
        : [fullConfig.structuredData];

      schemas.forEach((schema) => {
        injectStructuredData(schema.data);
      });
    }

    // Cleanup function
    return () => {
      cleanupStructuredData();
    };
  }, [config, breadcrumbs]);

  /**
   * Update or create a meta tag
   */
  function updateMetaTag(
    name: string,
    content: string,
    attributeType: 'name' | 'property' = 'name'
  ): void {
    if (!content) return;

    const selector =
      attributeType === 'property'
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;

    let tag = document.querySelector(selector) as HTMLMetaElement | null;

    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attributeType, name);
      document.head.appendChild(tag);
      createdTagsRef.current.push(tag);
    }

    tag.setAttribute('content', content);
  }

  /**
   * Update or create canonical link
   */
  function updateCanonicalLink(url: string): void {
    let link = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
      createdTagsRef.current.push(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Inject JSON-LD structured data
   */
  function injectStructuredData(data: Record<string, unknown>): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    scriptTagsRef.current.push(script);
  }

  /**
   * Clean up structured data scripts
   */
  function cleanupStructuredData(): void {
    scriptTagsRef.current.forEach((script) => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    scriptTagsRef.current = [];
  }
}

export default useSEO;
