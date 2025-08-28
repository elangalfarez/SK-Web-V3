// src/components/ui/promotion-card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromotionWithTenant } from '@/lib/supabase';

interface PromotionCardProps {
  promotion: PromotionWithTenant;
  isFeatured?: boolean;
  onClick?: (promotion: PromotionWithTenant) => void;
  className?: string;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  isFeatured = false,
  onClick,
  className
}) => {
  // Determine promotion status based on dates
  const getPromotionStatus = () => {
    const now = new Date();
    if (!promotion.start_date || !promotion.end_date) return 'active';
    
    const startDate = parseISO(promotion.start_date);
    const endDate = parseISO(promotion.end_date);
    
    if (isBefore(now, startDate)) return 'upcoming';
    if (isAfter(now, endDate)) return 'expired';
    return 'active';
  };

  const status = getPromotionStatus();
  
  // Format date range
  const formatDateRange = () => {
    if (!promotion.start_date || !promotion.end_date) return '';
    
    try {
      const start = format(parseISO(promotion.start_date), 'MMM dd');
      const end = format(parseISO(promotion.end_date), 'MMM dd, yyyy');
      return `${start} - ${end}`;
    } catch {
      return '';
    }
  };

  const dateRange = formatDateRange();

  // Status badge configuration
  const statusConfig = {
    active: { label: 'Active Now', variant: 'default' as const, color: 'text-success' },
    upcoming: { label: 'Coming Soon', variant: 'secondary' as const, color: 'text-info' },
    expired: { label: 'Expired', variant: 'outline' as const, color: 'text-text-muted' }
  };

  const currentStatus = statusConfig[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative card card-hover cursor-pointer overflow-hidden',
        'bg-surface-secondary border border-border-primary',
        isFeatured && 'lg:col-span-2 lg:row-span-2',
        className
      )}
      onClick={() => onClick?.(promotion)}
    >
      {/* Image Container */}
      <div className={cn(
        'relative overflow-hidden',
        isFeatured ? 'h-64 md:h-80' : 'h-48'
      )}>
        {promotion.image_url ? (
          <motion.img
            src={promotion.image_url}
            alt={promotion.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <span className="text-sm text-text-muted">No image available</span>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant={currentStatus.variant}
            className="shadow-lg backdrop-blur-sm"
          >
            <Clock className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>

        {/* Featured indicator */}
        {isFeatured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-accent hover:bg-accent-hover text-text-inverse shadow-lg">
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('p-4', isFeatured && 'p-6')}>
        {/* Tenant name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {promotion.tenant_name}
          </span>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs text-text-muted">
            {promotion.tenant_category}
          </span>
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-bold heading-primary mb-2 line-clamp-2',
          isFeatured ? 'text-xl md:text-2xl' : 'text-lg'
        )}>
          {promotion.title}
        </h3>

        {/* Description */}
        {promotion.full_description && (
          <p className={cn(
            'body-text-muted line-clamp-2 mb-3',
            isFeatured ? 'text-sm md:text-base' : 'text-sm'
          )}>
            {promotion.full_description}
          </p>
        )}

        {/* Date range */}
        {dateRange && (
          <div className="flex items-center gap-1 mb-4">
            <Calendar className="w-4 h-4 text-text-muted" />
            <span className={cn(
              'text-sm',
              currentStatus.color
            )}>
              {dateRange}
            </span>
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="outline"
          size={isFeatured ? 'default' : 'sm'}
          className="w-full group-hover:bg-accent group-hover:text-text-inverse group-hover:border-accent transition-all duration-200"
        >
          <span>View Details</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  );
};