// src/components/ui/blog-filters.tsx
// Created: Blog search and filter components with debounced search and accessibility

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = localSearch || selectedCategory || selectedTags.length > 0 || featuredOnly;

  const selectedCategoryName = seededCategories.find(c => c.id === selectedCategory)?.name || '';

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      className={`bg-surface border border-border rounded-xl p-6 space-y-6 ${className}`}
    >
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="blog-search" className="sr-only">
          Search blog posts
        </label>
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            size={20} 
          />
          <input
            id="blog-search"
            ref={searchInputRef}
            type="text"
            placeholder="Search posts by title or content..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <div ref={categoryRef} className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${selectedCategory ? 'text-accent border-accent' : 'text-muted-foreground'}`}
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
              className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-10"
              role="listbox"
              aria-label="Category options"
            >
              <button
                onClick={() => handleCategorySelect('')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-secondary rounded-t-lg focus:outline-none focus:bg-surface-secondary"
                role="option"
                aria-selected={!selectedCategory}
              >
                All Categories
              </button>
              {seededCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-secondary focus:outline-none focus:bg-surface-secondary ${category === seededCategories[seededCategories.length - 1] ? 'rounded-b-lg' : ''}`}
                  role="option"
                  aria-selected={selectedCategory === category.id}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.accent_color || '#gray' }}
                      aria-hidden="true"
                    />
                    {category.name}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Tags Filter */}
        <div ref={tagsRef} className="relative">
          <button
            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
            className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${selectedTags.length > 0 ? 'text-accent border-accent' : 'text-muted-foreground'}`}
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

        {/* Featured Only Toggle */}
        <button
          onClick={handleFeaturedToggle}
          className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${featuredOnly ? 'text-accent border-accent bg-accent/10' : 'text-muted-foreground'}`}
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

      {/* Active Filters Display */}
      {(selectedTags.length > 0 || selectedCategory || featuredOnly) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              {selectedCategoryName}
              <button
                onClick={() => handleCategorySelect('')}
                className="ml-1 hover:bg-surface rounded-full p-0.5"
                aria-label={`Remove ${selectedCategoryName} category filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          )}

          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:bg-surface rounded-full p-0.5"
                aria-label={`Remove ${tag} tag filter`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}

          {featuredOnly && (
            <Badge 
              variant="primary" 
              className="flex items-center gap-1"
            >
              <Star size={12} className="fill-current" />
              Featured
              <button
                onClick={handleFeaturedToggle}
                className="ml-1 hover:bg-primary-foreground rounded-full p-0.5"
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