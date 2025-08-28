// src/components/ui/search-input.tsx
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
  placeholder = 'Search promotions...',
  debounceMs = 300,
  className,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  
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
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4"
          aria-hidden="true"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl',
            'bg-surface-secondary border border-border-primary',
            'text-text-primary placeholder-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'hover:border-border-secondary transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-sm md:text-base'
          )}
          aria-label="Search promotions"
        />
        {localValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            disabled={disabled}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'p-1 rounded-full hover:bg-surface-tertiary',
              'text-text-muted hover:text-text-primary',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-1 focus:ring-accent',
              'disabled:opacity-50'
            )}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};