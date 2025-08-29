// src/components/ui/category-filter-drawer.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { CategoryPill } from './category-pill';
import { Category } from './category-pill-list';
import { cn } from '@/lib/utils';

interface CategoryFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchPlaceholder?: string;
}

export const CategoryFilterDrawer: React.FC<CategoryFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
  searchPlaceholder = "Search categories..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
    setSearchQuery(''); // Reset search on selection
  };

  const handleClose = () => {
    onClose();
    setSearchQuery(''); // Reset search on close
  };

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-surface border-t border-border-primary',
              'rounded-t-2xl shadow-2xl',
              'max-h-[80vh] flex flex-col',
              'md:hidden' // Only show on mobile
            )}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-primary flex-shrink-0">
              <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">
                Filter by Category
              </h2>
              <motion.button
                onClick={handleClose}
                className={cn(
                  'p-2 rounded-full hover:bg-surface-secondary',
                  'text-text-secondary hover:text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close category filter"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="p-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border-primary rounded-xl',
                    'text-text-primary placeholder:text-text-muted',
                    'focus:outline-none focus:border-accent focus:bg-surface focus:shadow-sm',
                    'transition-all duration-200'
                  )}
                  autoFocus
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="flex-1 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                <div className="p-4 grid grid-cols-1 gap-2">
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full"
                    >
                      <CategoryPill
                        id={category.id}
                        name={category.name}
                        count={category.count}
                        icon={category.icon}
                        isActive={activeCategory === category.id}
                        onClick={handleCategorySelect}
                        size="lg"
                        showCount={true}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-text-muted">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">No categories found</p>
                    <p className="text-sm">
                      Try adjusting your search or browse all categories
                    </p>
                  </div>
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      className={cn(
                        'mt-4 px-4 py-2 bg-accent text-text-inverse rounded-lg',
                        'hover:bg-accent-hover transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clear search
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Show count of filtered results */}
            <div className="p-4 border-t border-border-primary flex-shrink-0 bg-surface-secondary">
              <p className="text-sm text-text-secondary text-center">
                {searchQuery ? (
                  <>
                    {filteredCategories.length} of {categories.length} categories
                    {filteredCategories.length > 0 && ' shown'}
                  </>
                ) : (
                  `${categories.length} categories available`
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoryFilterDrawer;