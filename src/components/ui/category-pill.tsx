// src/components/ui/category-pill.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPillProps {
  id: string;
  name: string;
  displayName: string;
  count: number;
  icon: string;
  color: string;
  isActive: boolean;
  isSpecial?: boolean; // For the special F&B pill
  onClick: (categoryId: string) => void;
  disabled?: boolean;
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
  };
  
  return iconMap[iconName] || Icons.Store;
};

export const CategoryPill: React.FC<CategoryPillProps> = ({
  id,
  name,
  displayName,
  count,
  icon,
  color,
  isActive,
  isSpecial = false,
  onClick,
  disabled = false
}) => {
  // Defensive programming - handle undefined/null values
  if (!id || !name || !displayName) {
    console.warn('CategoryPill received invalid props:', { id, name, displayName });
    return null;
  }

  const IconComponent = getIconComponent(icon);

  return (
    <motion.button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'text-sm font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
        'relative overflow-hidden',
        isActive
          ? 'bg-accent text-text-inverse shadow-lg'
          : 'bg-surface-secondary text-text-primary border border-border-primary hover:border-border-secondary',
        isSpecial && !isActive && 'border-2 border-accent/30 bg-accent-subtle',
        isSpecial && isActive && 'bg-gradient-to-r from-accent to-accent-hover'
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      aria-pressed={isActive}
      role="tab"
    >
      {/* Special glow effect for F&B pill */}
      {isSpecial && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
          animate={{ 
            x: [-100, 300],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      )}

      <IconComponent 
        className={cn(
          'w-4 h-4 flex-shrink-0',
          isActive ? 'text-text-inverse' : 'text-text-secondary'
        )}
        aria-hidden="true"
      />
      
      <span className="whitespace-nowrap">
        {displayName}
        {count > 0 && (
          <span 
            className={cn(
              'ml-1 text-xs',
              isActive 
                ? 'text-text-inverse/80' 
                : 'text-text-muted'
            )}
          >
            ({count})
          </span>
        )}
      </span>

      {isSpecial && (
        <motion.div
          className={cn(
            'w-2 h-2 rounded-full ml-1',
            isActive ? 'bg-text-inverse' : 'bg-accent'
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};