// src/lib/hooks/useFeaturedEvents.ts
// Complete rewrite: Clean, efficient hook for fetching featured events

import { useState, useEffect, useCallback } from 'react';
import { fetchFeaturedEvents, Event } from '@/lib/supabase';

export interface UseFeaturedEventsOpts {
  limit?: number;
  autoRefresh?: boolean;
}

export interface UseFeaturedEventsResult {
  items: Event[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFeaturedEvents(opts: UseFeaturedEventsOpts = {}): UseFeaturedEventsResult {
  const { limit = 8, autoRefresh = false } = opts;
  
  // Cap limit to reasonable number
  const cappedLimit = Math.min(Math.max(limit, 1), 12);
  
  const [items, setItems] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const events = await fetchFeaturedEvents(cappedLimit);
      setItems(events);
    } catch (err) {
      console.error('Error fetching featured events:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(new Error(errorMessage));
      // Keep existing items on error to prevent flash of empty state
    } finally {
      setIsLoading(false);
    }
  }, [cappedLimit]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup (optional)
  useEffect(() => {
    if (!autoRefresh || cappedLimit === 0) return;

    const interval = setInterval(() => {
      // Only auto-refresh if not in loading state
      if (!isLoading) {
        fetchData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData, isLoading, cappedLimit]);

  return {
    items,
    isLoading,
    error,
    refetch,
  };
}