// src/components/NotFoundPage.tsx
// World-class 404 page for Supermal Karawaci with stunning animations

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  ShoppingBag,
  Store,
  Home,
  Compass,
  ArrowRight,
  Sparkles,
  Coffee,
  Gift,
  ShoppingCart,
  Heart,
} from 'lucide-react';

// Floating icons configuration
const floatingIcons = [
  { Icon: ShoppingBag, delay: 0, x: -120, y: -80, size: 32, rotation: 15 },
  { Icon: Store, delay: 0.5, x: 140, y: -60, size: 28, rotation: -10 },
  { Icon: Coffee, delay: 1, x: -160, y: 40, size: 24, rotation: 20 },
  { Icon: Gift, delay: 1.5, x: 180, y: 80, size: 30, rotation: -15 },
  { Icon: ShoppingCart, delay: 2, x: -80, y: 120, size: 26, rotation: 5 },
  { Icon: Heart, delay: 2.5, x: 100, y: -120, size: 22, rotation: -20 },
];

// Particle configuration for background sparkles
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

// Orbiting dots configuration
const orbitingDots = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i * 360) / 8,
  delay: i * 0.15,
  radius: 180,
}));

const NotFoundPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering404, setIsHovering404] = useState(false);

  // Track mouse position for parallax effect
  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const glowVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseRingVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 2.5],
      opacity: [0.6, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeOut',
      },
    },
  };

  const compassVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-secondary to-surface opacity-80" />

      {/* Animated mesh gradient background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, var(--color-accent) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, var(--color-purple-accent-dark) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, var(--color-accent-light) 0%, transparent 60%)
          `,
        }}
        animate={
          !shouldReduceMotion
            ? {
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }
            : undefined
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Particle field background */}
      {!shouldReduceMotion &&
        particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-accent"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main content container */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={
          !shouldReduceMotion
            ? {
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              }
            : undefined
        }
      >
        {/* Floating icons around the 404 */}
        {!shouldReduceMotion &&
          floatingIcons.map(({ Icon, delay, x, y, size, rotation }, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 text-accent/30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [0.8, 1, 0.8],
                x: [x - 10, x + 10, x - 10],
                y: [y - 10, y + 10, y - 10],
                rotate: [rotation - 5, rotation + 5, rotation - 5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
              }}
            >
              <Icon size={size} strokeWidth={1.5} />
            </motion.div>
          ))}

        {/* Central 404 display with glow effects */}
        <motion.div
          className="relative mb-8"
          variants={itemVariants}
          onMouseEnter={() => setIsHovering404(true)}
          onMouseLeave={() => setIsHovering404(false)}
        >
          {/* Multiple glow layers */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={glowVariants}
            initial="initial"
            animate={!shouldReduceMotion ? 'animate' : 'initial'}
          >
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-accent/20 blur-3xl" />
          </motion.div>

          {/* Pulse rings */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-accent/30"
                variants={pulseRingVariants}
                initial="initial"
                animate="animate"
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-accent/20"
                variants={pulseRingVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.8,
                }}
              />
            </>
          )}

          {/* Orbiting dots */}
          {!shouldReduceMotion &&
            orbitingDots.map((dot) => (
              <motion.div
                key={dot.id}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-accent"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: dot.delay,
                }}
                style={{
                  transformOrigin: `0 0`,
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent"
                  style={{
                    transform: `translate(${dot.radius}px, 0) rotate(-${dot.angle}deg)`,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: dot.delay,
                  }}
                />
              </motion.div>
            ))}

          {/* The 404 number */}
          <motion.div
            className="relative"
            animate={
              isHovering404 && !shouldReduceMotion
                ? { scale: 1.05 }
                : { scale: 1 }
            }
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent via-accent-light to-purple-accent-dark relative">
                4
                <motion.span
                  className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-accent-light via-accent to-purple-accent"
                  animate={
                    !shouldReduceMotion
                      ? {
                          opacity: [0, 0.5, 0],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  4
                </motion.span>
              </span>
              <span className="relative inline-block">
                {/* Compass icon in the zero */}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent via-accent-light to-purple-accent-dark">
                  0
                </span>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  variants={!shouldReduceMotion ? compassVariants : undefined}
                  animate={!shouldReduceMotion ? 'animate' : undefined}
                >
                  <Compass
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-accent-light/60"
                    strokeWidth={1}
                  />
                </motion.div>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent via-accent-light to-purple-accent-dark relative">
                4
                <motion.span
                  className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-purple-accent via-accent-light to-accent"
                  animate={
                    !shouldReduceMotion
                      ? {
                          opacity: [0, 0.5, 0],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  4
                </motion.span>
              </span>
            </h1>
          </motion.div>
        </motion.div>

        {/* "Lost in the Mall" text with animated icon */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={
                !shouldReduceMotion
                  ? {
                      y: [0, -4, 0],
                      rotate: [0, 5, -5, 0],
                    }
                  : undefined
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </motion.div>
            <h2 className="commissioner-hero-title text-2xl sm:text-3xl lg:text-4xl text-text-primary">
              Looks like you're{' '}
              <span className="text-gradient-animated">lost in the mall</span>
            </h2>
          </div>
          <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Don't worry, even the best shoppers take a wrong turn sometimes. This
            page doesn't exist, but we have plenty of amazing stores and
            experiences waiting for you.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={itemVariants}
        >
          {/* Primary CTA - Back to Homepage */}
          <Link to="/">
            <motion.button
              className="group relative px-8 py-4 rounded-xl bg-accent text-text-inverse font-semibold text-lg overflow-hidden"
              whileHover={!shouldReduceMotion ? { scale: 1.02, y: -2 } : undefined}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
            >
              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-light via-accent to-purple-accent-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={
                  !shouldReduceMotion
                    ? {
                        x: ['-100%', '100%'],
                      }
                    : undefined
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative flex items-center gap-2">
                <Home className="w-5 h-5" />
                Back to Homepage
                <motion.span
                  animate={
                    !shouldReduceMotion
                      ? {
                          x: [0, 4, 0],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
            </motion.button>
          </Link>

          {/* Secondary CTA - Explore Directory */}
          <Link to="/directory">
            <motion.button
              className="group relative px-8 py-4 rounded-xl bg-surface-secondary border-2 border-accent/30 text-text-primary font-semibold text-lg overflow-hidden hover:border-accent/60"
              whileHover={!shouldReduceMotion ? { scale: 1.02, y: -2 } : undefined}
              whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
            >
              {/* Hover background */}
              <motion.div
                className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <Store className="w-5 h-5 text-accent" />
                Explore Directory
                <Sparkles className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div
          className="mt-12 pt-8 border-t border-border-primary/30"
          variants={itemVariants}
        >
          <p className="text-text-muted text-sm mb-4">Or explore these popular sections:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Events', path: '/event' },
              { label: 'Promotions', path: '/promotions' },
              { label: 'Movies', path: '/movies' },
              { label: 'Contact', path: '/contact' },
            ].map((link, index) => (
              <Link key={link.path} to={link.path}>
                <motion.span
                  className="px-4 py-2 rounded-lg bg-surface-tertiary text-text-secondary text-sm hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
                >
                  {link.label}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-20 left-8 w-32 h-32 rounded-full bg-accent/5 blur-2xl"
        animate={
          !shouldReduceMotion
            ? {
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }
            : undefined
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-8 w-40 h-40 rounded-full bg-purple-accent/5 blur-2xl"
        animate={
          !shouldReduceMotion
            ? {
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 0.4, 0.6],
              }
            : undefined
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
};

export default NotFoundPage;
