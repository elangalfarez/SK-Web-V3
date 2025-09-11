// src/lib/hooks/useWhatsOn.tsx
// Created: Hook for fetching What's On items with caching and fallback

import { useState, useEffect, useCallback } from 'react';
import { fetchWhatsOnItems, refreshWhatsOnItems, WhatsOnItem } from '@/lib/supabase';

// Fallback data - only used when network fails
const FALLBACK_WHATS_ON: WhatsOnItem[] = [
  {
    id: 'fallback-1',
    content_type: 'event',
    title: 'Pets Nation Festival Vol. 2',
    description: 'Join us for an amazing pet-themed event with activities for all ages',
    image_url: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800&h=600&fit=crop',
    link_url: '/events',
    date_text: '22 July - 10 August 2025',
    badge_text: 'Event',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'fallback-2',
    content_type: 'tenant',
    title: 'Shark & Ninja',
    description: 'New tenant opening soon - exciting new retail experience',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    link_url: '/directory',
    date_text: 'July 2025',
    badge_text: 'New Tenant',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'fallback-3',
    content_type: 'promotion',
    title: 'Birkenstock Grand Opening',
    description: 'Special opening promotion - exclusive discounts and offers',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    link_url: '/promotions',
    date_text: 'July 2025',
    badge_text: 'Promotion',
    sort_order: 3,
    is_active: true,
  },
];

interface UseWhatsOnOptions {
  limit?: number;
  staleTimeMs?: number;
}

interface UseWhatsOnResult {
  items: WhatsOnItem[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  refresh: () => Promise<void>;
}

// Simple cache implementation
interface CacheEntry {
  data: WhatsOnItem[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function useWhatsOn(options: UseWhatsOnOptions = {}): UseWhatsOnResult {
  const { limit = 6, staleTimeMs = 5 * 60 * 1000 } = options; // 5 minutes default
  
  const [items, setItems] = useState<WhatsOnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const cacheKey = `whats-on-${limit}`;

  const fetchData = useCallback(async (useCache = true) => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(undefined);

      // Check cache first if enabled
      if (useCache) {
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < staleTimeMs) {
          console.debug('Using cached What\'s On data');
          setItems(cached.data);
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh data
      console.debug('Fetching fresh What\'s On data');
      const freshData = await fetchWhatsOnItems(limit);
      
      // Update cache
      cache.set(cacheKey, {
        data: freshData,
        timestamp: Date.now(),
      });

      setItems(freshData);
      
    } catch (fetchError) {
      console.error('Error fetching What\'s On items:', fetchError);
      
      // Use fallback data on error
      console.debug('Using fallback What\'s On data');
      setItems(FALLBACK_WHATS_ON.slice(0, limit));
      setIsError(true);
      setError(fetchError instanceof Error ? fetchError : new Error('Failed to fetch What\'s On items'));
      
    } finally {
      setIsLoading(false);
    }
  }, [limit, staleTimeMs, cacheKey]);

  const refresh = useCallback(async () => {
    console.debug('Refreshing What\'s On data');
    
    try {
      // Clear cache and refresh
      cache.delete(cacheKey);
      await refreshWhatsOnItems();
      await fetchData(false);
    } catch (refreshError) {
      console.error('Error refreshing What\'s On items:', refreshError);
      // Don't throw - just log the error
    }
  }, [cacheKey, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    isError,
    error,
    refresh,
  };
}