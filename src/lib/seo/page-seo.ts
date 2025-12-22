// src/lib/seo/page-seo.ts
// Page-specific SEO configurations

import type { SEOConfig } from './seo-types';
import { SITE_URL, DEFAULT_OG_IMAGE } from './seo-config';

/**
 * Static page SEO configurations
 */
export const PAGE_SEO: Record<string, SEOConfig> = {
  // Homepage (/)
  home: {
    title:
      'Supermal Karawaci - Premier Shopping & Entertainment Destination in Tangerang',
    description:
      'Discover 300+ premium stores, restaurants, cinema, and exclusive VIP experiences at Supermal Karawaci. Your premier shopping destination in Tangerang, Banten with ample parking and daily events.',
    canonical: SITE_URL,
    og: {
      title: 'Supermal Karawaci - Premier Shopping Destination',
      description:
        "Experience world-class shopping, dining, and entertainment at Tangerang's largest mall.",
      image: DEFAULT_OG_IMAGE,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Supermal Karawaci - Premier Shopping Destination',
      description:
        "Experience world-class shopping, dining, and entertainment at Tangerang's largest mall.",
      image: DEFAULT_OG_IMAGE,
    },
  },

  // Mall Directory (/directory)
  directory: {
    title: 'Mall Directory - Find Stores & Restaurants | Supermal Karawaci',
    description:
      'Browse our complete directory of 300+ stores, restaurants, and services at Supermal Karawaci. Find your favorite brands by category, floor, or name.',
    canonical: `${SITE_URL}/directory`,
    og: {
      title: 'Mall Directory | Supermal Karawaci',
      description:
        'Find stores, restaurants, and services in our comprehensive mall directory.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mall Directory | Supermal Karawaci',
      description:
        'Find stores, restaurants, and services in our comprehensive mall directory.',
    },
  },

  // Promotions (/promotions)
  promotions: {
    title: 'Promotions & Special Offers | Supermal Karawaci',
    description:
      'Discover the latest promotions, discounts, and special offers from stores at Supermal Karawaci. Save on fashion, dining, electronics, and more.',
    canonical: `${SITE_URL}/promotions`,
    og: {
      title: 'Hot Promotions | Supermal Karawaci',
      description:
        "Don't miss out on exclusive deals and discounts from our tenants.",
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hot Promotions | Supermal Karawaci',
      description:
        "Don't miss out on exclusive deals and discounts from our tenants.",
    },
  },

  // Contact (/contact)
  contact: {
    title: 'Contact Us - Customer Service | Supermal Karawaci',
    description:
      "Get in touch with Supermal Karawaci. Contact us for general inquiries, leasing, marketing partnerships, lost & found, or parking assistance. We're here to help.",
    canonical: `${SITE_URL}/contact`,
    og: {
      title: 'Contact Supermal Karawaci',
      description:
        'Reach our customer service team for any inquiries or assistance.',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Contact Supermal Karawaci',
      description:
        'Reach our customer service team for any inquiries or assistance.',
    },
  },

  // VIP Cards (/vip-cards)
  vipCards: {
    title: 'VIP Membership Cards - Exclusive Benefits | Supermal Karawaci',
    description:
      'Join our VIP membership program and unlock exclusive privileges. Choose from VIP Platinum, Super VIP, or Super VIP Flazz tiers for premium shopping benefits.',
    canonical: `${SITE_URL}/vip-cards`,
    og: {
      title: 'VIP Membership | Supermal Karawaci',
      description:
        'Unlock exclusive VIP benefits and privileges with our membership program.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'VIP Membership | Supermal Karawaci',
      description:
        'Unlock exclusive VIP benefits and privileges with our membership program.',
    },
  },

  // Events Listing (/event)
  events: {
    title: 'Events & Activities | Supermal Karawaci',
    description:
      'Discover exciting events, workshops, exhibitions, and activities happening at Supermal Karawaci. Family-friendly entertainment for everyone.',
    canonical: `${SITE_URL}/event`,
    og: {
      title: 'Upcoming Events | Supermal Karawaci',
      description:
        'Join exciting events, workshops, and activities at the mall.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Upcoming Events | Supermal Karawaci',
      description:
        'Join exciting events, workshops, and activities at the mall.',
    },
  },

  // Blog Listing (/blog)
  blog: {
    title: 'Blog - News, Tips & Lifestyle | Supermal Karawaci',
    description:
      'Read the latest news, shopping tips, lifestyle articles, and updates from Supermal Karawaci. Stay informed about fashion trends, dining guides, and mall events.',
    canonical: `${SITE_URL}/blog`,
    og: {
      title: 'Blog | Supermal Karawaci',
      description:
        'News, tips, and lifestyle content from Supermal Karawaci.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Supermal Karawaci',
      description:
        'News, tips, and lifestyle content from Supermal Karawaci.',
    },
  },

  // Movies (/movies)
  movies: {
    title: 'Cinema XXI Showtimes | Supermal Karawaci',
    description:
      'Check the latest movie showtimes at Cinema XXI Supermal Karawaci. Book tickets online for blockbusters, new releases, and family films.',
    canonical: `${SITE_URL}/movies`,
    og: {
      title: 'Cinema XXI Showtimes | Supermal Karawaci',
      description: 'View current movies and showtimes at Cinema XXI.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cinema XXI Showtimes | Supermal Karawaci',
      description: 'View current movies and showtimes at Cinema XXI.',
    },
  },
};

/**
 * Generate SEO config for event detail pages
 */
export function getEventDetailSEO(event: {
  title: string;
  summary?: string | null;
  slug: string;
  images?: Array<{ url: string }>;
}): SEOConfig {
  const description =
    event.summary ||
    `Join us for ${event.title} at Supermal Karawaci. Don't miss this exciting event!`;
  const image = event.images?.[0]?.url || DEFAULT_OG_IMAGE;

  return {
    title: `${event.title} | Events | Supermal Karawaci`,
    description,
    canonical: `${SITE_URL}/event/${event.slug}`,
    og: {
      title: event.title,
      description,
      image,
      type: 'event',
      url: `${SITE_URL}/event/${event.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      image,
    },
  };
}

/**
 * Generate SEO config for blog post detail pages
 */
export function getBlogPostSEO(post: {
  title: string;
  summary?: string | null;
  slug: string;
  image_url?: string | null;
  category?: { name: string } | null;
}): SEOConfig {
  const categoryName = post.category?.name || 'Blog';
  const description =
    post.summary ||
    `Read about ${post.title} on the Supermal Karawaci blog.`;
  const image = post.image_url || DEFAULT_OG_IMAGE;

  return {
    title: `${post.title} | ${categoryName} | Supermal Karawaci`,
    description,
    canonical: `${SITE_URL}/blog/${post.slug}`,
    og: {
      title: post.title,
      description,
      image,
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      image,
    },
  };
}
