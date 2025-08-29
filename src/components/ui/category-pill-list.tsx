// src/components/ui/category-pill-list.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { CategoryPill } from './category-pill';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

interface CategoryPillListProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onFilterClick?: () => void;
  maxVisibleMobile?: number;
  showFilterButton?: boolean;
  className?: string;
  pillSize?: 'sm' | 'md' | 'lg';
  showCounts?: boolean;
}

export const CategoryPillList: React.FC<CategoryPillListProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  onFilterClick,
  maxVisibleMobile = 6,
  showFilterButton = true,
  className,
  pillSize = 'md',
  showCounts = true
}) => {
  // Filter out invalid categories
  const validCategories = categories.filter(cat => cat?.id && cat?.name);
  
  // For mobile: show priority categories first, then limit
  const mobileCategories = validCategories
    .sort((a, b) => {
      // Prioritize commonly used categories for mobile
      const priority = ['Food & Beverages', 'Fashion & Accessories', 'Entertainment', 'Electronics'];
      const aIndex = priority.findIndex(p => a.name.includes(p.split(' ')[0]));
      const bIndex = priority.findIndex(p => b.name.includes(p.split(' ')[0]));
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    })
    .slice(0, maxVisibleMobile);

  const hasMoreCategories = validCategories.length > maxVisibleMobile;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex items-center gap-3">
          {/* Scrollable pill container */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-2 -mx-4 px-4">
            {mobileCategories.map((category) => (
              <CategoryPill
                key={category.id}
                id={category.id}
                name={category.name}
                count={category.count}
                icon={category.icon}
                isActive={activeCategory === category.id}
                onClick={onCategoryChange}
                size={pillSize}
                showCount={showCounts}
              />
            ))}
          </div>

          {/* Filter button for mobile */}
          {showFilterButton && hasMoreCategories && onFilterClick && (
            <motion.button
              onClick={onFilterClick}
              className={cn(
                'flex-shrink-0 flex items-center justify-center min-h-[44px] w-12',
                'bg-surface-secondary border border-border-primary rounded-full',
                'text-text-secondary hover:text-accent hover:border-accent',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Show all categories"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Desktop: Full Grid/Flex */}
      <div className="hidden md:flex flex-wrap gap-2">
        {validCategories.map((category) => (
          <CategoryPill
            key={category.id}
            id={category.id}
            name={category.name}
            count={category.count}
            icon={category.icon}
            isActive={activeCategory === category.id}
            onClick={onCategoryChange}
            size={pillSize}
            showCount={showCounts}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryPillList;