// src/components/ui/BlogCategoryPill.tsx
// Modified: Fixed contrast issues, solid badges with proper selected state, no backdrop-blur

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BlogCategoryPillProps {
  name: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export default function BlogCategoryPill({
  name,
  count,
  selected = false,
  onClick,
  variant = 'secondary',
  size = 'md',
  className = '',
  icon
}: BlogCategoryPillProps) {
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2 gap-2', 
    lg: 'text-base px-6 py-3 gap-2'
  };

  // Fixed contrast issues - using only design tokens, solid backgrounds
  const getVariantStyles = () => {
    if (selected) {
      // Selected state: high contrast solid background
      return 'bg-accent text-text-inverse border-accent shadow-sm font-medium';
    }

    switch (variant) {
      case 'primary':
        return 'bg-accent text-text-inverse border-0 shadow-sm hover:bg-accent-hover font-medium transition-colors';
      case 'secondary':
        return 'bg-surface-secondary border border-border-primary text-text-secondary shadow-sm hover:bg-surface-tertiary hover:text-text-primary font-medium transition-colors';
      case 'outline':
      default:
        return 'bg-surface border border-border-primary text-text-primary shadow-sm hover:bg-surface-secondary font-medium transition-colors';
    }
  };

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const pillContent = (
    <>
      {icon && icon}
      <span className="truncate">{name}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant="secondary"
          className="min-w-[20px] h-5 px-1.5 text-xs bg-surface-tertiary text-text-secondary border-0"
        >
          {count}
        </Badge>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          sizeClasses[size],
          getVariantStyles(),
          className
        )}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Filter by ${name}${count ? ` (${count} posts)` : ''}`}
      >
        {pillContent}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        sizeClasses[size],
        getVariantStyles(),
        className
      )}
      aria-label={`Category: ${name}${count ? ` (${count} posts)` : ''}`}
    >
      {pillContent}
    </div>
  );
}