// src/components/MallDirectory.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Sparkles } from 'lucide-react';
import { CategoryPill } from './ui/category-pill';
import { TenantCard } from './ui/tenant-card';

// Types
export interface Tenant {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category_name?: string;
  main_floor: string;
  logo_url?: string;
  is_featured: boolean;
  is_new_tenant: boolean;
  description?: string;
  operating_hours?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

interface MallDirectoryProps {
  tenants?: Tenant[];
  categories?: Category[];
  isLoading?: boolean;
}

// Mock data for demonstration - replace with real Supabase data
const mockCategories: Category[] = [
  { id: 'all', name: 'All', count: 156 },
  { id: '953734bb-2bba-42c5-9139-567e23e56640', name: 'Food & Beverages', count: 42 },
  { id: 'fashion-001', name: 'Fashion & Lifestyle', count: 38 },
  { id: '4bf1202c-ecc5-4c02-93d5-de78ca575237', name: 'Entertainment', count: 24 },
  { id: 'beauty-001', name: 'Beauty & Personal Care', count: 18 },
  { id: 'electronics-001', name: 'Electronics', count: 16 },
  { id: 'health-001', name: 'Health & Wellness', count: 14 },
  { id: 'services-001', name: 'Services', count: 12 }
];

const mockTenants: Tenant[] = [
  {
    id: '00d6c9e5-0038-417e-b128-735398dbca4a',
    name: 'Imperial Kitchen Dimsum',
    brand_name: 'Imperial Kitchen Dimsum',
    category_id: '953734bb-2bba-42c5-9139-567e23e56640',
    category_name: 'Food & Beverages',
    main_floor: 'FF',
    is_featured: false,
    is_new_tenant: false,
    description: 'Authentic dim sum experience with traditional recipes',
    operating_hours: '10:00-22:00'
  },
  {
    id: '01673c31-cc60-4574-9fe3-1e0442775168',
    name: 'Playtopia Sports',
    brand_name: 'Playtopia Sports',
    category_id: '4bf1202c-ecc5-4c02-93d5-de78ca575237',
    category_name: 'Entertainment',
    main_floor: 'FF',
    is_featured: true,
    is_new_tenant: true,
    description: 'Interactive sports and gaming zone for all ages',
    operating_hours: '10:00-22:00'
  },
  {
    id: '01955e9f-7101-460a-bfbd-321d34eeb40b',
    name: 'Hokkaido Baked Cheese Tart',
    brand_name: 'Hokkaido Baked Cheese Tart',
    category_id: '953734bb-2bba-42c5-9139-567e23e56640',
    category_name: 'Food & Beverages',
    main_floor: 'UG',
    is_featured: true,
    is_new_tenant: false,
    description: 'Famous Japanese cheese tarts made with premium Hokkaido ingredients',
    operating_hours: '10:00-22:00'
  }
];

const MallDirectory: React.FC<MallDirectoryProps> = ({ 
  tenants = mockTenants,
  categories = mockCategories,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter tenants based on search and category
  const filteredTenants = useMemo(() => {
    let filtered = tenants;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(tenant => tenant.category_id === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(query) ||
        tenant.brand_name.toLowerCase().includes(query) ||
        tenant.category_name?.toLowerCase().includes(query) ||
        tenant.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tenants, activeCategory, searchQuery]);

  // Update category counts based on current search
  const updatedCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    return categories.map(category => {
      if (category.id === 'all') {
        return { ...category, count: filteredTenants.length };
      }
      
      const categoryCount = tenants.filter(tenant => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = tenant.name.toLowerCase().includes(query) ||
                            tenant.brand_name.toLowerCase().includes(query) ||
                            tenant.category_name?.toLowerCase().includes(query) ||
                            tenant.description?.toLowerCase().includes(query);
        
        return matchesSearch && tenant.category_id === category.id;
      }).length;

      return { ...category, count: categoryCount };
    });
  }, [categories, tenants, searchQuery, filteredTenants.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-surface-secondary rounded-2xl"></div>
            <div className="flex gap-4 overflow-x-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-surface-secondary rounded-full flex-shrink-0"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-surface-secondary rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Mall <span className="text-accent">Directory</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover all the amazing brands and experiences waiting for you at Supermal Karawaci
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className={`relative transition-all duration-300 ${
            isSearchFocused ? 'transform scale-[1.02]' : ''
          }`}>
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                isSearchFocused ? 'text-accent' : 'text-text-muted'
              }`} />
            </div>
            <input
              type="text"
              placeholder="Search for stores, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-14 pr-6 py-4 bg-surface-secondary border-2 rounded-2xl text-lg
                placeholder:text-text-muted text-text-primary transition-all duration-200
                focus:outline-none focus:border-accent focus:bg-surface focus:shadow-lg
                ${isSearchFocused ? 'border-accent shadow-lg' : 'border-border-primary hover:border-border-secondary'}`}
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {updatedCategories.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-text-secondary">
            {filteredTenants.length > 0 ? (
              <>
                Showing <span className="font-semibold text-text-primary">{filteredTenants.length}</span> 
                {filteredTenants.length === 1 ? ' store' : ' stores'}
                {searchQuery && (
                  <span> for "<span className="font-semibold text-accent">{searchQuery}</span>"</span>
                )}
                {activeCategory !== 'all' && (
                  <span> in <span className="font-semibold text-accent">
                    {categories.find(c => c.id === activeCategory)?.name}
                  </span></span>
                )}
              </>
            ) : (
              'No results found'
            )}
          </p>
          
          {filteredTenants.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-text-muted text-sm">
              <Building2 className="h-4 w-4" />
              <span>Floor Guide Available</span>
            </div>
          )}
        </motion.div>

        {/* Tenant Grid */}
        <AnimatePresence mode="wait">
          {filteredTenants.length > 0 ? (
            <motion.div
              key="tenant-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  variants={itemVariants}
                  layout
                >
                  <TenantCard tenant={tenant} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 mx-auto bg-surface-tertiary rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-text-muted" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-1/2 transform translate-x-8 -translate-y-2"
                  >
                    <Sparkles className="h-6 w-6 text-accent opacity-60" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  No stores found
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  {searchQuery ? (
                    <>
                      We couldn't find any stores matching "<span className="font-semibold text-accent">{searchQuery}</span>".
                      <br />Try adjusting your search or browse by category.
                    </>
                  ) : (
                    'No stores available in this category at the moment.'
                  )}
                </p>
                {searchQuery && (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="inline-flex items-center px-6 py-3 bg-accent text-text-inverse rounded-xl
                        hover:bg-accent-hover transition-all duration-200 transform hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                    >
                      Clear search & show all stores
                    </button>
                    <div className="text-sm text-text-muted">
                      or try searching for: fashion, food, entertainment, electronics
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MallDirectory;