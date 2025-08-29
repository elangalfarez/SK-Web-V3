// src/lib/hooks/useTenants.ts
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
          error: error instanceof Error ? error.message : 'Failed to load categories',
          // Provide fallback empty array so UI doesn't break
          categories: []
        }));
      }
    };

    loadCategories();
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async (
    page = 1, 
    append = false,
    currentSearch = debouncedSearch,
    currentCategoryId = filters.categoryId,
    currentFloorFilter = filters.floorFilter
  ) => {
    try {
      if (!append) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      } else {
        setLoadingMore(true);
      }

      const result = await fetchTenants({
        page,
        perPage,
        search: currentSearch || undefined,
        categoryId: currentCategoryId === 'all' ? undefined : currentCategoryId,
        floorFilter: currentFloorFilter
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tenants';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        // Don't clear existing data on error if appending
        tenants: append ? prev.tenants : [],
        total: append ? prev.total : 0,
        hasMore: false
      }));
    } finally {
      setLoadingMore(false);
    }
  }, [perPage, debouncedSearch, filters.categoryId, filters.floorFilter]);

  // Load initial data and reset on filter changes
  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeTenants = subscribeTenantUpdates(() => {
      fetchData(1, false); // Refresh on changes
    });

    const unsubscribeCategories = subscribeCategoryUpdates(async () => {
      try {
        const categoriesData = await fetchTenantCategories();
        setState(prev => ({
          ...prev,
          categories: categoriesData
        }));
      } catch (error) {
        console.error('Error refreshing categories:', error);
      }
    });

    return () => {
      unsubscribeTenants();
      unsubscribeCategories();
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
    
    const nextPage = state.currentPage + 1;
    await fetchData(nextPage, true);
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

// Usage examples:

/*
// Basic usage in a component
function MyComponent() {
  const {
    tenants,
    categories,
    loading,
    error,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    loadMore,
    hasMore
  } = useTenants();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tenants..."
      />
      
      <div>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={activeCategory === cat.id ? 'active' : ''}
          >
            {cat.display_name} ({cat.tenant_count})
          </button>
        ))}
      </div>

      <div>
        {tenants.map(tenant => (
          <div key={tenant.id}>{tenant.name}</div>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}

// Advanced usage with real-time updates and custom pagination
function AdvancedComponent() {
  const {
    tenants,
    categories,
    loading,
    error,
    search,
    setSearch,
    categoryId: activeCategory,
    setActiveCategory,
    loadMore,
    hasMore,
    refresh,
    clearFilters,
    total
  } = useTenants({
    perPage: 24,
    enableRealtime: true,
    debounceMs: 500,
    initialCategoryId: 'food-beverages'
  });

  return (
    <div>
      <h1>Mall Directory ({total} tenants)</h1>
      
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tenants..."
      />
      
      <button onClick={clearFilters}>Clear All Filters</button>
      <button onClick={refresh}>Refresh</button>
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <div>
        {tenants.map(tenant => (
          <div key={tenant.id}>
            <h3>{tenant.name}</h3>
            <p>{tenant.description}</p>
            <span>Floor: {tenant.main_floor}</span>
            {tenant.is_featured && <span>⭐ Featured</span>}
            {tenant.is_new_tenant && <span>🆕 New</span>}
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore}>Load More Tenants</button>
      )}
    </div>
  );
}
*/