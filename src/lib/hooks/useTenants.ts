// src/lib/hooks/useTenants.ts
// Modified: use updated fetchTenants and types from tenant_directory view
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchTenants, 
  fetchTenantCategories, 
  subscribeTenantUpdates, 
  subscribeCategoryUpdates,
  Tenant, 
  TenantCategory 
} from '@/lib/supabase';

interface UseTenantFilters {
  search: string;
  categoryId: string;
  floorFilter?: string;
}

interface UseTenantState {
  tenants: Tenant[];
  categories: TenantCategory[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  currentPage: number;
}

interface UseTenantActions {
  setSearch: (search: string) => void;
  setActiveCategory: (categoryId: string) => void;
  setFloorFilter: (floor: string | undefined) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearFilters: () => void;
}

interface UseTenantConfig {
  perPage?: number;
  enableRealtime?: boolean;
  debounceMs?: number;
  initialCategoryId?: string;
}

type UseTenantResult = UseTenantState & UseTenantActions & UseTenantFilters;

let debounceTimer: NodeJS.Timeout | null = null;

export function useTenants(config: UseTenantConfig = {}): UseTenantResult {
  const {
    perPage = 50,
    enableRealtime = false,
    debounceMs = 300,
    initialCategoryId = 'all'
  } = config;

  // State
  const [state, setState] = useState<UseTenantState>({
    tenants: [],
    categories: [],
    loading: true,
    error: null,
    total: 0,
    hasMore: false,
    currentPage: 1
  });

  const [filters, setFilters] = useState<UseTenantFilters>({
    search: '',
    categoryId: initialCategoryId,
    floorFilter: undefined
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, debounceMs);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [filters.search, debounceMs]);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchTenantCategories();
        setState(prev => ({
          ...prev,
          categories: categoriesData
        }));
      } catch (error) {
        console.error('Error loading categories:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load categories'
        }));
      }
    };

    loadCategories();
  }, []);

  // Fetch tenants data
  const fetchData = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const result = await fetchTenants({
        page,
        perPage,
        categoryId: filters.categoryId === 'all' ? undefined : filters.categoryId,
        search: debouncedSearch.trim() || undefined,
        floorFilter: filters.floorFilter
      });

      setState(prev => ({
        ...prev,
        tenants: append ? [...prev.tenants, ...result.data] : result.data,
        total: result.total,
        hasMore: result.hasMore,
        currentPage: page,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching tenants:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? 
          (error.message.includes('fallback') ? 'Showing cached data' : error.message) : 
          'Failed to load tenants',
        loading: false
      }));
    }
  }, [filters.categoryId, debouncedSearch, filters.floorFilter, perPage]);

  // Load data when filters change
  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return;

    let unsubscribeTenants: (() => void) | null = null;
    let unsubscribeCategories: (() => void) | null = null;

    try {
      // Subscribe to tenant updates with view subscription enabled if needed
      unsubscribeTenants = subscribeTenantUpdates((payload) => {
        console.log('Tenant update received:', payload);
        // Refresh data on any tenant change
        fetchData(1, false);
      }, { enableViewSubscribe: true });

      // Subscribe to category updates
      unsubscribeCategories = subscribeCategoryUpdates((payload) => {
        console.log('Category update received:', payload);
        // Reload categories
        fetchTenantCategories().then(categoriesData => {
          setState(prev => ({
            ...prev,
            categories: categoriesData
          }));
        }).catch(error => {
          console.error('Error refreshing categories:', error);
        });
      });
    } catch (error) {
      console.warn('Error setting up realtime subscriptions:', error);
    }

    return () => {
      if (unsubscribeTenants) {
        try {
          unsubscribeTenants();
        } catch (error) {
          console.warn('Error unsubscribing from tenant updates:', error);
        }
      }
      if (unsubscribeCategories) {
        try {
          unsubscribeCategories();
        } catch (error) {
          console.warn('Error unsubscribing from category updates:', error);
        }
      }
    };
  }, [enableRealtime, fetchData]);

  // Actions
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    // Reset pagination when search changes
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const setActiveCategory = useCallback((categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId }));
    // Reset pagination when category changes
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const setFloorFilter = useCallback((floorFilter: string | undefined) => {
    setFilters(prev => ({ ...prev, floorFilter }));
    // Reset pagination when floor filter changes
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || loadingMore || state.loading) return;
    
    setLoadingMore(true);
    const nextPage = state.currentPage + 1;
    await fetchData(nextPage, true);
    setLoadingMore(false);
  }, [state.hasMore, state.currentPage, loadingMore, state.loading, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(1, false);
  }, [fetchData]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      categoryId: 'all',
      floorFilter: undefined
    });
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Transform categories to include "All Categories" option with proper count
  const categoriesWithAll = useMemo(() => {
    const allCategory: TenantCategory = {
      id: 'all',
      name: 'All Categories',
      display_name: 'All Categories',
      tenant_count: state.total,
      icon: 'store',
      color: '#5A2E8A',
      description: 'View all tenants',
      sort_order: -1,
      created_at: new Date().toISOString()
    };

    // Safely filter and process categories
    const validCategories = (state.categories || []).filter(cat => 
      cat && cat.id && (cat.name || cat.display_name)
    );

    return [allCategory, ...validCategories];
  }, [state.categories, state.total]);

  return {
    // State
    tenants: state.tenants,
    categories: categoriesWithAll,
    loading: state.loading,
    error: state.error,
    total: state.total,
    hasMore: state.hasMore,
    currentPage: state.currentPage,

    // Filters
    search: filters.search,
    categoryId: filters.categoryId,
    floorFilter: filters.floorFilter,

    // Actions
    setSearch,
    setActiveCategory,
    setFloorFilter,
    loadMore,
    refresh,
    clearFilters
  };
}