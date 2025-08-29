// src/components/ui/skeletons/tenant-card-skeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TenantCardSkeletonProps {
  className?: string;
}

export const TenantCardSkeleton: React.FC<TenantCardSkeletonProps> = ({ 
  className 
}) => {
  return (
    <div className={cn(
      'bg-surface-secondary rounded-2xl overflow-hidden border border-border-primary',
      'shadow-lg animate-pulse',
      className
    )}>
      {/* Header/Logo Area */}
      <div className="relative h-32 bg-surface-tertiary">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-tertiary to-border-muted" />
        
        {/* Placeholder icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-border-primary rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title area */}
        <div className="space-y-2">
          <div className="h-5 bg-border-primary rounded-lg w-3/4" />
          <div className="h-4 bg-border-muted rounded w-1/2" />
        </div>

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3 bg-border-muted rounded w-full" />
          <div className="h-3 bg-border-muted rounded w-4/5" />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-border-primary rounded" />
            <div className="h-3 bg-border-primary rounded w-16" />
          </div>
          <div className="flex space-x-2">
            <div className="w-12 h-5 bg-border-muted rounded-full" />
            <div className="w-12 h-5 bg-border-muted rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Grid skeleton for multiple cards
interface TenantGridSkeletonProps {
  count?: number;
  className?: string;
}

export const TenantGridSkeleton: React.FC<TenantGridSkeletonProps> = ({
  count = 12,
  className
}) => {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TenantCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

// Category pills skeleton
export const CategoryPillsSkeleton: React.FC<{ className?: string }> = ({ 
  className 
}) => {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 h-10 bg-border-primary rounded-full animate-pulse"
          style={{ width: `${Math.random() * 40 + 80}px` }}
        />
      ))}
    </div>
  );
};

// Search input skeleton
export const SearchInputSkeleton: React.FC<{ className?: string }> = ({ 
  className 
}) => {
  return (
    <div className={cn(
      'w-full h-12 bg-surface-secondary border border-border-primary rounded-2xl animate-pulse',
      className
    )} />
  );
};

// Complete page skeleton for MallDirectory
export const MallDirectorySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="h-12 bg-border-primary rounded-lg w-96 mx-auto animate-pulse" />
          <div className="h-6 bg-border-muted rounded w-[500px] mx-auto animate-pulse" />
        </div>

        {/* Search skeleton */}
        <SearchInputSkeleton className="max-w-2xl mx-auto" />

        {/* Category pills skeleton */}
        <CategoryPillsSkeleton />

        {/* Results count skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-border-primary rounded w-48 animate-pulse" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-4 h-4 bg-border-primary rounded animate-pulse" />
            <div className="h-4 bg-border-primary rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <TenantGridSkeleton count={12} />
      </div>
    </div>
  );
};

export default TenantCardSkeleton;