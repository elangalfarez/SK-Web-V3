// src/components/ui/loading-spinner.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  label = 'Loading...'
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <motion.div
        className={cn(
          'border-2 border-border-primary border-t-accent rounded-full',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-text-muted animate-pulse">
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Page-level loading component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading promotions...' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <LoadingSpinner size="xl" label={message} />
    </div>
  );
};

// Inline loading for cards/components
export const InlineLoader: React.FC = () => {
  return (
    <div className="flex justify-center py-6">
      <LoadingSpinner size="md" label="" />
    </div>
  );
};