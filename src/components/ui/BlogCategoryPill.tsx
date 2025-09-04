// src/components/ui/BlogCategoryPill.tsx
// Created: Token-driven solid category pill component with count badge

/*
Badge styling: solid token-based backgrounds, no glassmorphism
Primary: bg-accent text-text-inverse shadow-sm rounded-lg
Secondary: bg-surface-secondary border border-accent/20 text-accent shadow-sm rounded-lg
*/

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BlogCategoryPillProps {
  name: string;
  count?: number;
  selected?: boolean;
  accentColor?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BlogCategoryPill({
  name,
  count,
  selected = false,
  accentColor,
  onClick,
  variant = 'secondary',
  size = 'md',
  className = ''
}: BlogCategoryPillProps) {
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-2', 
    lg: 'text-base px-4 py-2 gap-2'
  };

  const variantClasses = {
    primary: 'bg-accent text-text-inverse border-0 shadow-sm hover:bg-accent/90',
    secondary: 'bg-surface-secondary border border-accent/20 text-accent shadow-sm hover:bg-surface',
    outline: 'bg-background border border-border text-primary shadow-sm hover:bg-surface-secondary'
  };

  const selectedClasses = selected ? 
    'bg-accent text-text-inverse border-accent shadow-md' : 
    variantClasses[variant];

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
      <span className="truncate">{name}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant="secondary"
          className="min-w-[20px] h-5 px-1.5 text-xs bg-background/80 text-muted-foreground border-0"
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
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          sizeClasses[size],
          selectedClasses,
          className
        )}
        style={{
          // [INFERENCE] Use category accent color for border when available
          ...(accentColor && !selected && variant !== 'primary' && {
            borderColor: `color-mix(in srgb, ${accentColor} 40%, var(--color-border))`
          })
        }}
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
        'inline-flex items-center justify-center rounded-lg font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={{
        // [INFERENCE] Use category accent color for border when available
        ...(accentColor && variant !== 'primary' && {
          borderColor: `color-mix(in srgb, ${accentColor} 40%, var(--color-border))`
        })
      }}
    >
      {pillContent}
    </div>
  );
}