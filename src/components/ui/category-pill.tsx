// src/components/ui/category-pill.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryPillProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  isActive,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20
        ${isActive 
          ? 'bg-accent text-text-inverse shadow-lg' 
          : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text-primary border border-border-primary hover:border-border-secondary'
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {category.name}
        <span className={`
          inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
          ${isActive 
            ? 'bg-white/20 text-text-inverse' 
            : 'bg-accent/10 text-accent'
          }
        `}>
          {category.count}
        </span>
      </span>
      
      {isActive && (
        <motion.div
          layoutId="category-pill-bg"
          className="absolute inset-0 bg-accent rounded-full"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.button>
  );
};