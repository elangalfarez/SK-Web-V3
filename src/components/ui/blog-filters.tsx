// src/components/ui/blog-filters.tsx
// Modified: fixed badge styling (solid/outlined styles, no glassmorphism), improved accessibility, token-driven colors

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { seededCategories } from '../../data/seeded-posts';

interface BlogFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    tags: string[];
    featuredOnly: boolean;
  }) => void;
  onClearFilters: () => void;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  featuredOnly: boolean;
  className?: string;
}

const COMMON_TAGS = [
  'dining', 'events', 'news', 'community', 'family', 'shopping',
  'food-court', 'celebration', 'art', 'festival', 'workshop'
];

export default function BlogFilters({
  onFiltersChange,
  onClearFilters,
  searchQuery,
  selectedCategory,
  selectedTags,
  featuredOnly,
  className = ''
}: BlogFiltersProps) {
  const shouldReduceMotion = useReducedMotion();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setShowCategoryDropdown(false);
      }
      
      if (tagsRef.current && !tagsRef.current.contains(target)) {
        setShowTagsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onFiltersChange({
      search: value,
      category: selectedCategory,
      tags: selectedTags,
      featuredOnly
    });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onFiltersChange({
      search: localSearch,
      category: categoryId,
      tags: selectedTags,
      featuredOnly
    });
    setShowCategoryDropdown(false);
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onFiltersChange({
      search: localSearch,
      category: selectedCategory,
      tags: newTags,
      featuredOnly
    });
  };

  // Handle featured toggle
  const handleFeaturedToggle = () => {
    onFiltersChange({
      search: localSearch,
      category: selectedCategory,
      tags: selectedTags,
      featuredOnly: !featuredOnly
    });
  };

  // Check if any filters are active
  const hasActiveFilters = localSearch || selectedCategory || selectedTags.length > 0 || featuredOnly;

  // Get selected category name
  const selectedCategoryName = selectedCategory 
    ? seededCategories.find(cat => cat.id === selectedCategory)?.name || 'Category'
    : '';

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      className={`bg-background border border-border rounded-lg p-6 space-y-6 ${className}`}
    >
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search posts..."
          value={localSearch}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-primary placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
          aria-label="Search blog posts"
        />
        {localSearch && (
          <button
            onClick={() => {
              setLocalSearch('');
              onFiltersChange({
                search: '',
                category: selectedCategory,
                tags: selectedTags,
                featuredOnly
              });
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div ref={categoryRef} className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              selectedCategory ? 'border-accent text-accent' : 'border-border text-muted-foreground'
            }`}
            aria-expanded={showCategoryDropdown}
            aria-haspopup="listbox"
            aria-label="Filter by category"
          >
            <Filter size={16} />
            <span className="text-sm">
              {selectedCategoryName || 'Category'}
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {showCategoryDropdown && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-10 py-2"
              role="listbox"
              aria-label="Category options"
            >
              <button
                onClick={() => handleCategorySelect('')}
                className="w-full px-4 py-2 text-left hover:bg-surface-secondary transition-colors text-sm text-primary"
                role="option"
                aria-selected={!selectedCategory}
              >
                All Categories
              </button>
              {seededCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="w-full px-4 py-2 text-left hover:bg-surface-secondary transition-colors text-sm text-primary"
                  role="option"
                  aria-selected={selectedCategory === category.id}
                >
                  {category.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Tags Dropdown */}
        <div ref={tagsRef} className="relative">
          <button
            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              selectedTags.length > 0 ? 'border-accent text-accent' : 'border-border text-muted-foreground'
            }`}
            aria-expanded={showTagsDropdown}
            aria-haspopup="listbox"
            aria-label="Filter by tags"
          >
            <span className="text-sm">
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showTagsDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {showTagsDropdown && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-10 p-4"
              role="listbox"
              aria-label="Tag options"
            >
              <div className="grid grid-cols-2 gap-2">
                {COMMON_TAGS.map(tag => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 p-2 hover:bg-surface-secondary rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                    />
                    <span className="text-sm text-primary">{tag}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Featured Only Toggle - solid style, no glassmorphism */}
        <button
          onClick={handleFeaturedToggle}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
            featuredOnly ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'
          }`}
          aria-pressed={featuredOnly}
          aria-label="Show only featured posts"
        >
          <Star size={16} className={featuredOnly ? 'fill-current' : ''} />
          <span className="text-sm">Featured Only</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary gap-1"
            aria-label="Clear all filters"
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display - solid badges, no glassmorphism */}
      {(selectedTags.length > 0 || selectedCategory || featuredOnly) && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {selectedCategory && (
            <Badge className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20">
              {selectedCategoryName}
              <button
                onClick={() => handleCategorySelect('')}
                className="ml-1 hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${selectedCategoryName} category filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          )}

          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              className="flex items-center gap-1 bg-background border border-border text-primary"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:bg-surface-secondary rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} tag filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}

          {featuredOnly && (
            <Badge className="flex items-center gap-1 bg-accent text-text-inverse border-0">
              <Star size={12} className="fill-current" />
              Featured
              <button
                onClick={handleFeaturedToggle}
                className="ml-1 hover:bg-accent/80 rounded-full p-0.5 transition-colors"
                aria-label="Remove featured filter"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}