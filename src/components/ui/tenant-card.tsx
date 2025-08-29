// src/components/ui/tenant-card.tsx
// Modified: fixed JSON object handling to prevent React rendering errors
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Sparkles } from 'lucide-react';
import { parseOperatingHours } from '@/lib/supabase';

interface Tenant {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category_name?: string;
  main_floor: string;
  logo_url?: string;
  is_featured: boolean;
  is_new_tenant: boolean;
  description?: string;
  operating_hours?: any; // Can be JSON object or string
}

interface TenantCardProps {
  tenant: Tenant;
  onClick?: () => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({ tenant, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatFloor = (floor: string): string => {
    switch (floor?.toUpperCase()) {
      case 'FF': return 'First Floor';
      case 'SF': return 'Second Floor';
      case 'TF': return 'Third Floor';
      case 'UG': return 'Underground';
      case 'GF': return 'Ground Floor';
      default: return floor || 'Floor TBD';
    }
  };

  // Use the safe parsing function from supabase client
  const operatingHours = parseOperatingHours(tenant.operating_hours);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-surface-secondary rounded-2xl overflow-hidden shadow-lg hover:shadow-xl
        transition-all duration-300 border border-border-primary
        hover:border-accent/20 group relative
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Header with Logo/Image */}
      <div className="relative h-32 bg-surface-tertiary overflow-hidden">
        {tenant.logo_url && !imageError ? (
          <div className="relative w-full h-full">
            <img
              src={tenant.logo_url}
              alt={tenant.name || 'Store logo'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`
                w-full h-full object-cover transition-all duration-500
                ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
                group-hover:scale-105
              `}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-surface-tertiary animate-pulse" />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-tertiary to-surface-secondary">
            <div className="text-4xl font-bold text-text-muted/30 group-hover:text-accent/40 transition-colors duration-300">
              {(tenant.name || tenant.brand_name || 'S').charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {tenant.is_new_tenant && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="bg-accent text-text-inverse px-2 py-1 rounded-full text-xs font-semibold
                flex items-center gap-1 shadow-lg"
            >
              <Sparkles className="h-3 w-3" />
              New
            </motion.div>
          )}
          
          {tenant.is_featured && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="bg-warning text-white px-2 py-1 rounded-full text-xs font-semibold
                flex items-center gap-1 shadow-lg"
            >
              <Star className="h-3 w-3 fill-current" />
              Featured
            </motion.div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 
          group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Store Name */}
        <div>
          <h3 className="font-bold text-lg text-text-primary leading-tight group-hover:text-accent transition-colors duration-200">
            {tenant.brand_name || tenant.name || 'Unnamed Store'}
          </h3>
          {tenant.brand_name && tenant.brand_name !== tenant.name && tenant.name && (
            <p className="text-sm text-text-muted mt-1">{tenant.name}</p>
          )}
        </div>

        {/* Category */}
        {tenant.category_name && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 
            text-accent rounded-lg text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            {tenant.category_name}
          </div>
        )}

        {/* Description */}
        {tenant.description && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            {tenant.description}
          </p>
        )}

        {/* Info Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border-muted">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-text-muted">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              {formatFloor(tenant.main_floor)}
            </span>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {operatingHours}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <motion.div
        initial={false}
        animate={{
          scale: 1,
          opacity: 0
        }}
        whileHover={{
          scale: 1.02,
          opacity: 1
        }}
        className="absolute inset-0 rounded-2xl border-2 border-accent pointer-events-none"
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};