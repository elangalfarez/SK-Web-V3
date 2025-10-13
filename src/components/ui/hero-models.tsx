// src/components/ui/hero-models.tsx
// Fixed: Scaled models to fit within constrained viewport (accounting for navbar)

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroModelsProps {
  className?: string;
}

export const HeroModels: React.FC<HeroModelsProps> = ({ className }) => {
  return (
    <>
      {/* Desktop Models - Reduced height to fit in calc(100vh - 5rem) */}
      <div className={cn(
        'absolute right-0 bottom-0 w-2/5 lg:w-1/2 xl:w-3/5 hidden lg:block overflow-visible',
        // Reduced from h-[82vh] to h-[75vh] to fit within available space
        'h-[75vh]',
        className
      )}>
        <div className="relative w-full h-full flex items-end justify-end">
          <img 
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Model%20Final%20Approved-min.png"
            alt="Supermal Karawaci Models"
            className="object-contain object-bottom transition-transform duration-700 ease-out hover:scale-105 lg:translate-x-12 xl:translate-x-16 2xl:translate-x-20 h-auto"
            style={{
              width: 'auto',
              transformOrigin: 'bottom center',
              maxWidth: 'none',
              maxHeight: '100%'
            }}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      {/* Mobile Models - Reduced height for better viewport fit */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center lg:hidden h-60 sm:h-64">
        {/* Reduced from h-80 sm:h-96 to h-60 sm:h-64 */}
        <img 
          src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Model%20Final%20Approved-min.png"
          alt="Supermal Karawaci Models"
          className="object-contain object-bottom transition-transform duration-700 ease-out hover:scale-105 max-w-full opacity-100"
          style={{
            height: '100%',
            width: 'auto',
            transformOrigin: 'bottom center',
            maxHeight: 'min(256px, 40vh)' // Cap at 40% viewport or 256px
          }}
          loading="lazy"
          draggable={false}
        />
      </div>
    </>
  );
};