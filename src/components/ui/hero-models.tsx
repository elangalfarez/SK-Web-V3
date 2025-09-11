// src/components/ui/hero-models.tsx
// Fixed: Matches original Hero.tsx positioning

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroModelsProps {
  className?: string;
}

export const HeroModels: React.FC<HeroModelsProps> = ({ className }) => {
  return (
    <>
      {/* Desktop Models */}
      <div className={cn(
        'absolute right-0 bottom-0 w-2/5 lg:w-1/2 xl:w-3/5 h-[90vh] hidden lg:block overflow-visible',
        className
      )}>
        <div className="relative w-full h-full flex items-end justify-end">
          <img 
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Model%202%20Rev1.png"
            alt="Supermal Karawaci Models"
            className="object-contain object-bottom transition-transform duration-700 ease-out hover:scale-105 lg:translate-x-12 xl:translate-x-16 2xl:translate-x-20 h-auto max-h-[60vh]"
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

      {/* Mobile Models - positioned at bottom like original */}
      <div className="absolute bottom-0 left-0 right-0 h-80 sm:h-96 flex items-end justify-center lg:hidden">
        <img 
          src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Model%202%20Rev1.png"
          alt="Supermal Karawaci Models"
          className="object-contain object-bottom transition-transform duration-700 ease-out hover:scale-105 max-w-full opacity-100"
          style={{
            height: '100%',
            width: 'auto',
            transformOrigin: 'bottom center'
          }}
          loading="lazy"
          draggable={false}
        />
      </div>
    </>
  );
};