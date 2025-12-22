// src/lib/seo/seo-config.ts
// Site-wide SEO configuration and default schemas

import type { SEOConfig } from './seo-types';

// Base URL for the site
export const SITE_URL = 'https://supermalkarawaci.co.id';
export const SITE_NAME = 'Supermal Karawaci';

// Default OG image (recommended 1200x630px)
// Place your image at public/images/og-default.jpg
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

// Default SEO configuration used as fallback
export const DEFAULT_SEO: SEOConfig = {
  title: 'Supermal Karawaci',
  description:
    'Supermal Karawaci is the premier shopping and entertainment destination in Tangerang, Banten. Discover 300+ stores, restaurants, entertainment venues, and exclusive VIP experiences.',
  canonical: SITE_URL,
  og: {
    title: 'Supermal Karawaci - Premier Shopping Destination',
    description:
      "Discover 300+ stores, restaurants, and entertainment at Supermal Karawaci, Tangerang's leading shopping mall.",
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supermal Karawaci',
    description: 'Premier shopping and entertainment destination in Tangerang.',
    image: DEFAULT_OG_IMAGE,
  },
  robots: 'index, follow',
  author: 'Supermal Karawaci',
};

// Organization schema - company information for Google Knowledge Panel
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Supermal Karawaci',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    'https://www.facebook.com/supermalkarawaci',
    'https://www.instagram.com/supermalkarawaci',
    'https://www.tiktok.com/@supermalkarawaci',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-21-5466666',
    contactType: 'customer service',
    areaServed: 'ID',
    availableLanguage: ['Indonesian', 'English'],
  },
};

// Local Business / Shopping Center schema for local SEO
export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ShoppingCenter',
  name: 'Supermal Karawaci',
  image: DEFAULT_OG_IMAGE,
  '@id': SITE_URL,
  url: SITE_URL,
  telephone: '+62-21-5466666',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Boulevard Diponegoro No. 105',
    addressLocality: 'Tangerang',
    addressRegion: 'Banten',
    postalCode: '15115',
    addressCountry: 'ID',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -6.2269,
    longitude: 106.6071,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: '10:00',
    closes: '22:00',
  },
};

// Website schema with SearchAction for Google Sitelinks Search Box
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/directory?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
