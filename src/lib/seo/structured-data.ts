// src/lib/seo/structured-data.ts
// JSON-LD schema generators for structured data

import { SITE_URL, SITE_NAME } from './seo-config';
import type { BreadcrumbItem, EventSchemaData, BlogPostSchemaData } from './seo-types';

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Event schema for event detail pages
 */
export function generateEventSchema(
  event: EventSchemaData
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description:
      event.summary || event.body?.substring(0, 200) || event.title,
    startDate: event.start_at,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue || 'Supermal Karawaci',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Boulevard Diponegoro No. 105',
        addressLocality: 'Tangerang',
        addressRegion: 'Banten',
        postalCode: '15115',
        addressCountry: 'ID',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (event.end_at) {
    schema.endDate = event.end_at;
  }

  if (event.images?.[0]?.url) {
    schema.image = [event.images[0].url];
  }

  return schema;
}

/**
 * Generate BlogPosting schema for blog post detail pages
 */
export function generateBlogPostSchema(
  post: BlogPostSchemaData
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || post.title,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.publish_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  if (post.image_url) {
    schema.image = post.image_url;
  }

  if (post.category?.name) {
    schema.articleSection = post.category.name;
  }

  if (post.tags && post.tags.length > 0) {
    schema.keywords = post.tags.join(', ');
  }

  return schema;
}

/**
 * Item structure for ItemList schema
 */
interface ItemListItem {
  name: string;
  url: string;
  image?: string;
  description?: string;
}

/**
 * Generate ItemList schema for listing pages (directory, events, blog)
 */
export function generateItemListSchema(
  items: ItemListItem[],
  listName: string,
  listDescription: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    description: listDescription,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description }),
      },
    })),
  };
}

/**
 * FAQ item structure
 */
interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate ContactPage schema
 */
export function generateContactPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Supermal Karawaci',
    description: 'Get in touch with Supermal Karawaci customer service',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      telephone: '+62-21-5466666',
      email: 'info@supermalkarawaci.co.id',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Boulevard Diponegoro No. 105',
        addressLocality: 'Tangerang',
        addressRegion: 'Banten',
        postalCode: '15115',
        addressCountry: 'ID',
      },
    },
  };
}
