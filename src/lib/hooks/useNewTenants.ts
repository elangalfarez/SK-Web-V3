// src/lib/hooks/useNewTenants.ts
// Created: React hook for fetching new tenants with loading states

import { useState, useEffect, useCallback } from 'react';
// Import the specific function and type - this will work once the function is added to supabase.ts
import { fetchNewTenants } from '../supabase';
import type { FeaturedTenant } from '../supabase';

interface UseNewTenantsParams {
  limit?: number;
  enabled?: boolean;
}

interface UseNewTenantsReturn {
  items: FeaturedTenant[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching new tenants with loading states and error handling
 * Default limit is 5 for homepage use, but configurable up to 10
 */
export const useNewTenants = ({ 
  limit = 5, 
  enabled = true 
}: UseNewTenantsParams = {}): UseNewTenantsReturn => {
  const [items, setItems] = useState<FeaturedTenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure limit stays within bounds
  const safeLimit = Math.min(Math.max(limit, 1), 10);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const newTenants = await fetchNewTenants({ limit: safeLimit });
      setItems(newTenants);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load new tenants';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, safeLimit]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial load - simplified effect with minimal dependencies
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    refetch,
  };
};