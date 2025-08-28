// src/components/ui/empty-state.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Gift, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type?: 'search' | 'filter' | 'error' | 'no-data';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateConfigs = {
  search: {
    icon: Search,
    title: 'No promotions found',
    description: 'We couldn\'t find any promotions matching your search. Try different keywords or browse all promotions.',
    actionLabel: 'Clear Search',
    illustration: (
      <div className="relative">
        <div className="w-24 h-24 bg-accent-subtle rounded-full flex items-center justify-center mb-4">
          <Search className="w-12 h-12 text-accent" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertCircle className="w-4 h-4 text-white" />
        </motion.div>
      </div>
    )
  },
  filter: {
    icon: RefreshCw,
    title: 'No promotions in this category',
    description: 'There are currently no active promotions in the selected category. Try selecting a different category or check back later.',
    actionLabel: 'Clear Filters',
    illustration: (
      <div className="relative">
        <div className="w-24 h-24 bg-info/10 rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-12 h-12 text-info" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-info/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  },
  'no-data': {
    icon: Gift,
    title: 'No promotions available',
    description: 'There are currently no active promotions. Check back soon for exciting new deals and offers from our tenants!',
    actionLabel: 'Refresh Page',
    illustration: (
      <motion.div
        className="relative"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-24 h-24 bg-accent-subtle rounded-full flex items-center justify-center mb-4">
          <Gift className="w-12 h-12 text-accent" />
        </div>
        {/* Floating particles effect */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full"
            animate={{
              x: [0, 15, -15, 0],
              y: [0, -20, -10, 0],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
            style={{
              left: `${20 + i * 15}px`,
              top: `${10}px`
            }}
          />
        ))}
      </motion.div>
    )
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We couldn\'t load the promotions right now. Please try again or refresh the page.',
    actionLabel: 'Try Again',
    illustration: (
      <div className="relative">
        <motion.div
          className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4"
          animate={{ shake: [0, -2, 2, -2, 2, 0] }}
          transition={{ duration: 0.5, repeat: 2, delay: 1 }}
        >
          <AlertCircle className="w-12 h-12 text-error" />
        </motion.div>
      </div>
    )
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  const config = emptyStateConfigs[type];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionLabel = actionLabel || config.actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        'max-w-lg mx-auto',
        className
      )}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        {config.illustration}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-xl md:text-2xl font-bold heading-primary">
          {finalTitle}
        </h3>
        
        <p className="text-sm md:text-base body-text max-w-md">
          {finalDescription}
        </p>

        {/* Action button */}
        {onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <Button 
              onClick={onAction}
              variant="outline"
              className="px-6"
            >
              {finalActionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent/20 rounded-full"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, -40, 0],
              opacity: [0, 0.5, 0.2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut'
            }}
            style={{
              left: `${10 + i * 20}%`,
              top: '50%'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};