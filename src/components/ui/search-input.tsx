// src/components/ui/search-input.tsx
// Modified: updated for full-width usage while preserving animations and behaviors
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Debounce the onChange callback
  useEffect(() => {
    if (localValue === value) return;
    
    const timeoutId = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localValue, onChange, debounceMs, value]);

  // Update local value when prop changes (for external resets)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <motion.div 
      className={cn('relative w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className={cn(
        'relative transition-all duration-300',
        isSearchFocused && 'transform scale-[1.02]'
      )}>
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className={cn(
            'h-5 w-5 transition-colors duration-200',
            isSearchFocused ? 'text-accent' : 'text-text-muted'
          )} aria-hidden="true" />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-14 pr-12 py-4 bg-surface-secondary border-2 rounded-2xl text-lg',
            'placeholder:text-text-muted text-text-primary transition-all duration-200',
            'focus:outline-none focus:border-accent focus:bg-surface focus:shadow-lg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isSearchFocused 
              ? 'border-accent shadow-lg' 
              : 'border-border-primary hover:border-border-secondary'
          )}
          aria-label={placeholder}
        />
        {localValue && !disabled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className={cn(
              'absolute right-4 top-1/2 transform -translate-y-1/2',
              'p-2 rounded-full hover:bg-surface-tertiary',
              'text-text-muted hover:text-accent',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
            )}
            aria-label="Clear search"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};