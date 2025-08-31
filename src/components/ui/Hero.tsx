// src/components/ui/Hero.tsx
// New: Unified, reusable hero component for page headers across the app
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the Hero component
 * @example
 * // Basic usage
 * <Hero title="Get in Touch" subtitle="We're here to help!" />
 * 
 * // With accent span and stats
 * <Hero 
 *   title={<>Get in <span className="text-accent">Touch</span></>}
 *   subtitle="We're here to help with any questions."
 *   stats={[
 *     { value: "300+", label: "Stores" },
 *     { value: "3000+", label: "Parking Spaces" },
 *     { value: "24/7", label: "Security" }
 *   ]}
 * />
 * 
 * // Compact variant with custom visual
 * <Hero 
 *   title="Mall Directory"
 *   subtitle="Discover amazing brands"
 *   variant="compact"
 *   visual={<CustomIllustration />}
 * />
 */
export interface HeroProps {
  /** Main heading - can be string or ReactNode for accent spans */
  title: ReactNode | string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional stats to display as chips below subtitle */
  stats?: Array<{ value: string; label: string }>;
  /** Optional slot for background illustration or decorative elements */
  visual?: ReactNode;
  /** Controls padding and typography scale */
  variant?: 'default' | 'compact' | 'lead';
  /** Background pattern style */
  bgPattern?: 'soft-circles' | 'diagonal' | 'none';
  /** Additional CSS classes */
  className?: string;
  /** Center-align content (default true) */
  center?: boolean;
  /** Heading level for accessibility (default 1) */
  headingLevel?: 1 | 2 | 3;
  /** Optional CTA or action elements */
  cta?: ReactNode;
}

// Helper function to check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation variants that respect motion preferences
const getAnimationVariants = () => {
  const reduced = prefersReducedMotion();
  
  return {
    container: {
      hidden: { opacity: reduced ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: reduced ? 0 : 0.6,
          staggerChildren: reduced ? 0 : 0.1
        }
      }
    },
    item: {
      hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: reduced ? 0 : 0.5 }
      }
    },
    stats: {
      hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: reduced ? 0 : 0.4 }
      }
    }
  };
};

// Background pattern components - much more subtle
const SoftCirclesPattern = () => (
  <>
    {/* Only very subtle corner accents, no center blob */}
    <div className="absolute top-0 left-0 w-32 h-32 bg-accent rounded-full -translate-x-16 -translate-y-16 opacity-[0.02]"></div>
    <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent rounded-full translate-x-16 translate-y-16 opacity-[0.02]"></div>
  </>
);

const DiagonalPattern = () => (
  <div className="absolute inset-0 opacity-[0.02]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diagonal" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
          <rect width="1" height="60" fill="currentColor" className="text-accent" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diagonal)" />
    </svg>
  </div>
);

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  stats,
  visual,
  variant = 'default',
  bgPattern = 'soft-circles',
  className = '',
  center = true,
  headingLevel = 1,
  cta
}) => {
  const animations = getAnimationVariants();
  
  // Variant-specific classes
  const variantClasses = {
    default: 'py-12 md:py-16',
    compact: 'py-8 md:py-12', 
    lead: 'py-16 md:py-24'
  };

  const titleSizeClasses = {
    default: 'text-4xl md:text-5xl lg:text-6xl',
    compact: 'text-3xl md:text-4xl lg:text-5xl',
    lead: 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
  };

  // Create heading element based on level
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  return (
    <section className={`relative bg-surface-tertiary overflow-hidden ${variantClasses[variant]} ${className}`}>
      {/* Background Pattern */}
      {bgPattern === 'soft-circles' && <SoftCirclesPattern />}
      {bgPattern === 'diagonal' && <DiagonalPattern />}
      
      {/* Visual Slot (background level) */}
      {visual && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {visual}
        </div>
      )}
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className={center ? 'text-center' : ''}
        >
          {/* Title */}
          <motion.div variants={animations.item}>
            <HeadingTag className={`font-bold mb-4 md:mb-6 text-text-primary leading-tight ${titleSizeClasses[variant]}`}>
              {title}
            </HeadingTag>
          </motion.div>

          {/* Subtitle */}
          {subtitle && (
            <motion.p 
              variants={animations.item}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <motion.div 
              variants={animations.stats}
              className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={animations.item}
                  className="flex flex-col items-center"
                  whileHover={!prefersReducedMotion() ? { scale: 1.05 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-2xl md:text-3xl font-bold text-accent">
                    {stat.value}
                  </span>
                  <span className="text-sm text-text-muted uppercase tracking-wide">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA Slot */}
          {cta && (
            <motion.div 
              variants={animations.item}
              className="mt-8"
            >
              {cta}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// Default export for convenience
export default Hero;