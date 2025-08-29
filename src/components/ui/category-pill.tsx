// src/components/ui/category-pill.tsx
// Modified: refactored for mobile-first design, removed special cases, semantic tokens only
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPillProps {
  id: string;
  name: string;
  count?: number;
  icon?: string;
  isActive: boolean;
  onClick: (categoryId: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

// Map icon names to actual Lucide icons
const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'utensils': Icons.Utensils,
    'shirt': Icons.Shirt,
    'smartphone': Icons.Smartphone,
    'briefcase': Icons.Briefcase,
    'heart': Icons.Heart,
    'gamepad2': Icons.Gamepad2,
    'baby': Icons.Baby,
    'watch': Icons.Watch,
    'home': Icons.Home,
    'glasses': Icons.Glasses,
    'scissors': Icons.Scissors,
    'dumbbell': Icons.Dumbbell,
    'shopping-cart': Icons.ShoppingCart,
    'car': Icons.Car,
    'book-open': Icons.BookOpen,
    'store': Icons.Store,
  };
  
  return iconMap[iconName] || Icons.Store;
};

export const CategoryPill: React.FC<CategoryPillProps> = ({
  id,
  name,
  count = 0,
  icon = 'store',
  isActive,
  onClick,
  disabled = false,
  size = 'md',
  showCount = true
}) => {
  // Defensive programming - handle undefined/null values
  if (!id || !name) {
    console.warn('CategoryPill received invalid props:', { id, name });
    return null;
  }

  const IconComponent = getIconComponent(icon);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={cn(
        // Base styles - mobile-first, min touch target 44px
        'inline-flex items-center min-h-[44px] rounded-full',
        'font-medium transition-all duration-200 flex-shrink-0',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
        // Semantic theme colors only
        isActive
          ? 'bg-accent text-text-inverse shadow-lg'
          : 'bg-surface-secondary text-text-primary border border-border-primary hover:border-border-secondary hover:bg-surface-tertiary',
        // Size variants
        sizeClasses[size]
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      aria-pressed={isActive}
      role="button"
      type="button"
    >
      <IconComponent 
        className={cn(
          'flex-shrink-0',
          iconSizes[size],
          isActive ? 'text-text-inverse' : 'text-text-secondary'
        )}
        aria-hidden="true"
      />
      
      <span className="whitespace-nowrap">
        {name}
        {showCount && count > 0 && (
          <span 
            className={cn(
              'ml-1',
              size === 'sm' ? 'text-xs' : 'text-xs',
              isActive 
                ? 'text-text-inverse/80' 
                : 'text-text-muted'
            )}
          >
            ({count})
          </span>
        )}
      </span>
    </motion.button>
  );
};

// Export default for backward compatibility
export default CategoryPill;