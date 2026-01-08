// src/components/ui/event-filters.tsx
// Created: Comprehensive filtering UI with search, tags, date range, and accessibility features

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  RotateCcw, 
  ChevronDown,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  upcomingOnly: boolean;
  onUpcomingToggle: (upcoming: boolean) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  upcomingOnly,
  onUpcomingToggle,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearFilters,
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  // Check for active filters
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedTags.length > 0 ||
    upcomingOnly ||
    fromDate ||
    toDate
  );

  // Handle search input with debouncing built into parent component
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Clear search with button
  const clearSearch = () => {
    onSearchChange('');
  };

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-3 bg-surface border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary placeholder-text-muted"
              aria-label="Search events"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          {/* Upcoming Only Toggle */}
          <Button
            variant={upcomingOnly ? 'default' : 'outline'}
            onClick={() => onUpcomingToggle(!upcomingOnly)}
            size="default"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Upcoming Only
          </Button>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            size="default"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
            />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              size="default"
              className="flex items-center gap-2 text-text-muted hover:text-text-primary"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0, height: prefersReducedMotion ? 'auto' : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="bg-surface-secondary rounded-lg p-4 sm:p-6 space-y-6 border border-border-secondary"
          >
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from-date" className="block text-sm font-medium text-text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  From Date
                </label>
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  min={today}
                  onChange={(e) => onFromDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                />
              </div>
              <div>
                <label htmlFor="to-date" className="block text-sm font-medium text-text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  To Date
                </label>
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  min={fromDate || today}
                  onChange={(e) => onToDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary"
                />
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-primary">
                    Event Categories
                  </label>
                  <span className="text-xs text-text-muted">
                    {selectedTags.length} of {availableTags.length} selected
                  </span>
                </div>

                {/* Mobile: Dropdown for tags */}
                <div className="sm:hidden">
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                      className="w-full justify-between"
                    >
                      {selectedTags.length > 0 
                        ? `${selectedTags.length} categories selected`
                        : 'Select categories'
                      }
                      <ChevronDown className={`w-4 h-4 transition-transform ${showTagsDropdown ? 'rotate-180' : ''}`} />
                    </Button>

                    <AnimatePresence>
                      {showTagsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-primary rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                        >
                          <div className="p-2">
                            {availableTags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => onTagToggle(tag)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                  selectedTags.includes(tag)
                                    ? 'bg-accent text-text-inverse'
                                    : 'hover:bg-surface-tertiary text-text-primary'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Desktop: Tag chips */}
                <div className="hidden sm:block">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => onTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-muted">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button 
                onClick={clearSearch}
                className="ml-1 hover:bg-surface-tertiary rounded-full p-0.5"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {upcomingOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              Upcoming Only
              <button
                onClick={() => onUpcomingToggle(false)}
                className="ml-1 hover:bg-surface-tertiary rounded-full p-0.5"
                aria-label="Show all events"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              <button 
                onClick={() => onTagToggle(tag)}
                className="ml-1 hover:bg-surface-tertiary rounded-full p-0.5"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {(fromDate || toDate) && (
            <Badge variant="outline" className="flex items-center gap-1">
              {fromDate && toDate ? `${fromDate} to ${toDate}` : 
               fromDate ? `From ${fromDate}` : 
               `Until ${toDate}`}
              <button 
                onClick={() => {
                  onFromDateChange('');
                  onToDateChange('');
                }}
                className="ml-1 hover:bg-surface-tertiary rounded-full p-0.5"
                aria-label="Remove date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {showTagsDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTagsDropdown(false)}
        />
      )}
    </div>
  );
};

export default EventFilters;