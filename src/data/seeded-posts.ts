// src/data/seeded-posts.ts
// Created: Fallback blog data for offline scenarios when Supabase is unreachable

import type { Post, BlogCategory } from '../lib/supabase';

export const seededCategories: BlogCategory[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'News',
    slug: 'news',
    description: 'Latest news and updates from Supermal Karawaci',
    accent_color: '#3B82F6',
    is_active: true,
    sort_order: 1,
    created_at: '2025-09-01T08:00:00+07:00',
    updated_at: '2025-09-01T08:00:00+07:00'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Events',
    slug: 'events',
    description: 'Upcoming and past events at our mall',
    accent_color: '#10B981',
    is_active: true,
    sort_order: 2,
    created_at: '2025-09-01T08:00:00+07:00',
    updated_at: '2025-09-01T08:00:00+07:00'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Stories',
    slug: 'stories',
    description: 'Customer stories and community highlights',
    accent_color: '#F59E0B',
    is_active: true,
    sort_order: 3,
    created_at: '2025-09-01T08:00:00+07:00',
    updated_at: '2025-09-01T08:00:00+07:00'
  }
];

export const seededPosts: Post[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440101',
    title: 'New Dining Options Coming This September',
    slug: 'new-dining-options-september-2025',
    summary: 'Exciting new restaurants and cafes are opening their doors at Supermal Karawaci this month, bringing diverse flavors and experiences to our food court.',
    body_html: '<p>We\'re thrilled to announce that <strong>three new dining establishments</strong> will be joining our food court this September. From authentic Indonesian cuisine to international favorites, these additions will enhance your dining experience at Supermal Karawaci.</p><p>The new restaurants include a modern take on traditional Padang cuisine, a Korean BBQ spot, and a specialty coffee roastery. Each brings unique flavors and atmospheres to complement our existing diverse dining options.</p><p>Stay tuned for grand opening announcements and special introductory offers!</p>',
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'News',
      slug: 'news',
      accent_color: '#3B82F6'
    },
    tags: ['dining', 'food-court', 'september', 'new-openings'],
    is_published: true,
    is_featured: true,
    publish_at: '2025-09-01T08:00:00+07:00',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    created_by: null,
    created_at: '2025-09-01T08:00:00+07:00',
    updated_at: '2025-09-01T08:00:00+07:00'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440102',
    title: 'Mid-Autumn Festival Celebration 2025',
    slug: 'mid-autumn-festival-celebration-2025',
    summary: 'Join us for a spectacular Mid-Autumn Festival celebration featuring traditional performances, lantern displays, and special promotions throughout the mall.',
    body_html: '<p>Celebrate the <strong>Mid-Autumn Festival</strong> with us from September 15-17, 2025! Our three-day celebration will feature beautiful lantern displays, traditional lion dance performances, and special moon cake promotions from participating stores.</p><p>Highlights include:</p><ul><li>Traditional lion dance performances every 2 hours</li><li>Interactive lantern-making workshops for children</li><li>Special discounts at over 50 participating stores</li><li>Photo opportunities with giant illuminated moon displays</li></ul><p>Bring your family and friends to experience this beautiful cultural celebration right here at Supermal Karawaci.</p>',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Events',
      slug: 'events',
      accent_color: '#10B981'
    },
    tags: ['mid-autumn', 'festival', 'celebration', 'family', 'culture'],
    is_published: true,
    is_featured: false,
    publish_at: '2025-09-10T09:00:00+07:00',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    created_by: null,
    created_at: '2025-09-10T09:00:00+07:00',
    updated_at: '2025-09-10T09:00:00+07:00'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440103',
    title: 'Customer Spotlight: Local Artist Creates Beautiful Mall Mural',
    slug: 'customer-spotlight-local-artist-mural',
    summary: 'Meet Sarah Chen, a talented local artist who recently completed a stunning mural in our east wing corridor. Her work celebrates the diversity and vibrancy of our community.',
    body_html: '<p>We\'re proud to showcase the incredible talent of <strong>Sarah Chen</strong>, a local artist who has transformed our east wing corridor with a breathtaking mural celebrating community diversity.</p><p>Sarah, a resident of Karawaci for over 10 years, drew inspiration from the multicultural spirit of our neighborhood. Her colorful artwork depicts families from different backgrounds coming together, shopping, dining, and enjoying time at the mall.</p><p>"I wanted to capture the essence of what makes Supermal Karawaci special – it\'s not just a shopping center, it\'s a community gathering place where people from all walks of life come together," says Sarah.</p><p>The mural took three weeks to complete and has already become a popular photo spot for visitors.</p>',
    category_id: '550e8400-e29b-41d4-a716-446655440003',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Stories',
      slug: 'stories',
      accent_color: '#F59E0B'
    },
    tags: ['community', 'art', 'local-artist', 'mural', 'diversity'],
    is_published: true,
    is_featured: true,
    publish_at: '2025-08-25T10:30:00+07:00',
    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    created_by: null,
    created_at: '2025-08-25T10:30:00+07:00',
    updated_at: '2025-08-25T10:30:00+07:00'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440104',
    title: 'Weekend Family Workshop: Learn Basic Photography',
    slug: 'weekend-family-photography-workshop',
    summary: 'Join our weekend photography workshop designed for families. Learn the basics of composition, lighting, and storytelling through photos.',
    body_html: '<p>Capture beautiful memories with our <strong>Family Photography Workshop</strong> happening every Saturday this month! This hands-on session is perfect for families who want to improve their photography skills together.</p><p>What you\'ll learn:</p><ul><li>Basic composition rules and techniques</li><li>Understanding natural lighting</li><li>Storytelling through photographs</li><li>Tips for photographing children and family groups</li></ul><p>The workshop includes a fun photo walk around the mall where families can practice their new skills. All participants receive a printed photo collage of their best shots!</p><p><strong>When:</strong> Saturdays in September, 2:00 PM - 4:00 PM<br><strong>Where:</strong> Community Room, Level 2<br><strong>Cost:</strong> Free for families</p>',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Events',
      slug: 'events',
      accent_color: '#10B981'
    },
    tags: ['workshop', 'photography', 'family', 'weekend', 'learning'],
    is_published: true,
    is_featured: false,
    publish_at: '2025-08-30T14:00:00+07:00',
    image_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800',
    created_by: null,
    created_at: '2025-08-30T14:00:00+07:00',
    updated_at: '2025-08-30T14:00:00+07:00'
  }
];