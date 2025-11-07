// src/lib/hooks/useFeaturedRestaurants.ts
// Purpose: React hook for fetching featured restaurants with tenant data enrichment
// Files scanned: lib/supabase.ts, featured_restaurants SQL schema

import { useState, useEffect, useCallback } from 'react';
import { fetchFeaturedRestaurants } from '@/lib/supabase';

export interface EnrichedFeaturedRestaurant {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageAlt: string;
  description: string;
  highlight: string;
  tenantId: string;
  sortOrder: number;
}

export interface UseFeaturedRestaurantsOptions {
  limit?: number;
  polling?: boolean;
}

export interface UseFeaturedRestaurantsResult {
  items: EnrichedFeaturedRestaurant[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFeaturedRestaurants(
  options: UseFeaturedRestaurantsOptions = {}
): UseFeaturedRestaurantsResult {
  const { limit = 6, polling = false } = options;
  
  // Enforce limit cap of 6 as specified in requirements
  const cappedLimit = Math.min(Math.max(limit, 1), 6);
  
  const [items, setItems] = useState<EnrichedFeaturedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Transform database rows to UI model expected by FeaturedRestaurantCard
  const transformItem = useCallback((item: Record<string, unknown>): EnrichedFeaturedRestaurant => ({
    id: String(item.id),
    title: String(item.tenant_name || 'Featured Restaurant'),
    subtitle: String(item.category_display || item.category || ''),
    imageUrl: (item.tenant_banner_url || item.tenant_logo_url || item.featured_image_url) as string | null,
    imageAlt: String(item.tenant_name || 'Restaurant image'),
    description: String(item.featured_description || item.tenant_description || ''),
    highlight: String(item.highlight_text || 'Featured'),
    tenantId: String(item.tenant_id),
    sortOrder: Number(item.sort_order || 0),
  }), []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const rawData = await fetchFeaturedRestaurants(cappedLimit);
      const transformedItems = rawData.map(transformItem);
      setItems(transformedItems);
    } catch (err) {
      console.error('Error fetching featured restaurants:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch featured restaurants'));
      
      // Fallback seed data for development only
      if (process.env.NODE_ENV !== 'production' && items.length === 0) {
        const seedData: EnrichedFeaturedRestaurant[] = [
          {
            id: 'seed-1',
            title: 'Sate Khas Senayan',
            subtitle: 'Indonesian Traditional',
            imageUrl: 'https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/SKS.png',
            imageAlt: 'Sate Khas Senayan',
            description: 'Authentic Indonesian satay and traditional dishes',
            highlight: 'Featured',
            tenantId: 'seed-tenant-1',
            sortOrder: 1,
          },
          {
            id: 'seed-2',
            title: 'Pizza Hut',
            subtitle: 'Italian Family Dining',
            imageUrl: 'https://supermalkarawaci.co.id/core/wp-content/uploads/2021/04/PIZZA-H-scaled.jpg',
            imageAlt: 'Pizza Hut',
            description: 'Family-friendly Italian dining with fresh pizza and pasta',
            highlight: 'Popular',
            tenantId: 'seed-tenant-2',
            sortOrder: 2,
          },
        ];
        setItems(seedData.slice(0, cappedLimit));
      }
    } finally {
      setIsLoading(false);
    }
  }, [cappedLimit, transformItem, items.length]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optional polling every 15 seconds (configurable)
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [polling, fetchData, isLoading]);

  return {
    items,
    isLoading,
    error,
    refetch,
  };
}