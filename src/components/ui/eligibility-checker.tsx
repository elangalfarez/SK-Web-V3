// src/components/ui/eligibility-checker.tsx
// Created: VIP tier eligibility checker with spending input and animated progress feedback
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  CheckCircle2, 
  ArrowUp, 
  Target, 
  TrendingUp,
  Copy,
  Star,
  Sparkles,
  Crown,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VipTier } from '@/lib/supabase';

interface EligibilityCheckerProps {
  tiers: VipTier[];
}

// Format currency in Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format number input with thousands separators
const formatNumberInput = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Add thousands separators
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number back to number
const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/,/g, '') || '0');
};

// Get tier icon based on tier level
const getTierIcon = (tierLevel: number) => {
  switch (tierLevel) {
    case 1: return Crown;
    case 2: return Trophy;
    case 3: return Star;
    default: return Sparkles;
  }
};

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({ tiers }) => {
  const [spendingInput, setSpendingInput] = useState<string>('');
  const [isAnimatingCelebration, setIsAnimatingCelebration] = useState(false);
  
  const reducedMotion = prefersReducedMotion();
  const spendingAmount = parseFormattedNumber(spendingInput);

  // Sort tiers by spending requirement (highest first) for progression logic
  const sortedTiers = useMemo(() => {
    return [...tiers].sort((a, b) => {
      const aAmount = a.minimum_receipt_amount || a.minimum_spend_amount;
      const bAmount = b.minimum_receipt_amount || b.minimum_spend_amount;
      return bAmount - aAmount;
    });
  }, [tiers]);

  // Calculate user's eligibility status
  const eligibilityStatus = useMemo(() => {
    const qualifiedTiers = sortedTiers.filter(tier => {
      if (tier.minimum_receipt_amount) {
        // Shopping Card: single receipt requirement (different logic)
        return spendingAmount >= tier.minimum_receipt_amount;
      } else {
        // Monthly spending requirement
        return spendingAmount >= tier.minimum_spend_amount;
      }
    });

    const highestQualified = qualifiedTiers.length > 0 ? qualifiedTiers[0] : null;
    
    // Find next tier to work towards
    const nextTier = sortedTiers.find(tier => {
      if (tier.minimum_receipt_amount) {
        return spendingAmount < tier.minimum_receipt_amount;
      } else {
        return spendingAmount < tier.minimum_spend_amount;
      }
    });

    return {
      qualifiedTiers,
      highestQualified,
      nextTier,
      isTopTier: highestQualified && highestQualified.tier_level === 1,
    };
  }, [spendingAmount, sortedTiers]);

  // Handle input change with debounced formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumberInput(value);
    setSpendingInput(formatted);
  };

  // Copy eligibility message to clipboard
  const copyEligibilityMessage = useCallback(() => {
    if (!eligibilityStatus.highestQualified) return;
    
    const message = `I qualify for ${eligibilityStatus.highestQualified.name} at Supermal Karawaci! 🌟 Visit VIP Lounge to register.`;
    
    navigator.clipboard.writeText(message).then(() => {
      toast.success('Eligibility message copied to clipboard!', {
        icon: '📋',
        duration: 3000,
      });
    }).catch(() => {
      toast.error('Failed to copy message');
    });
  }, [eligibilityStatus.highestQualified]);

  // Celebration animation trigger
  useEffect(() => {
    if (eligibilityStatus.isTopTier && spendingAmount > 0 && !isAnimatingCelebration) {
      setIsAnimatingCelebration(true);
      
      // Reset celebration after animation
      setTimeout(() => {
        setIsAnimatingCelebration(false);
      }, 3000);

      // Show celebration toast
      toast.success('🎉 Congratulations! You qualify for our highest VIP tier!', {
        duration: 4000,
      });
    }
  }, [eligibilityStatus.isTopTier, spendingAmount, isAnimatingCelebration]);

  // Calculate progress to next tier
  const progressData = useMemo(() => {
    if (!eligibilityStatus.nextTier) return null;

    const targetAmount = eligibilityStatus.nextTier.minimum_receipt_amount || eligibilityStatus.nextTier.minimum_spend_amount;
    const currentAmount = spendingAmount;
    const progress = Math.min((currentAmount / targetAmount) * 100, 100);
    const remaining = Math.max(targetAmount - currentAmount, 0);

    return {
      progress,
      remaining,
      targetAmount,
      nextTier: eligibilityStatus.nextTier
    };
  }, [eligibilityStatus.nextTier, spendingAmount]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-secondary border border-border-primary rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full translate-y-16 -translate-x-16"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 text-accent rounded-2xl mb-4">
              <Calculator className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              VIP Eligibility Checker
            </h3>
            <p className="text-text-secondary">
              Enter your monthly spending or single receipt amount to see which VIP tier you qualify for
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <label htmlFor="spending-input" className="block text-sm font-medium text-text-primary mb-3">
              Your Spending Amount (IDR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-text-muted text-lg">Rp</span>
              </div>
              <input
                id="spending-input"
                type="text"
                value={spendingInput}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-4 bg-surface border-2 border-border-primary rounded-xl text-lg font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                aria-describedby="spending-input-help"
              />
            </div>
            <p id="spending-input-help" className="mt-2 text-sm text-text-muted">
              For Shopping Card: enter single receipt amount. For other tiers: enter monthly spending.
            </p>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {spendingAmount > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Current Qualification */}
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-accent" />
                    Your VIP Status
                  </h4>
                  
                  {eligibilityStatus.highestQualified ? (
                    <motion.div
                      initial={!reducedMotion ? { scale: 0.95 } : {}}
                      animate={{ 
                        scale: isAnimatingCelebration && eligibilityStatus.isTopTier ? [1, 1.05, 1] : 1 
                      }}
                      transition={{ duration: 0.6, repeat: isAnimatingCelebration ? 2 : 0 }}
                      className="p-4 bg-accent/10 border-2 border-accent/20 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-accent rounded-xl text-text-inverse">
                          {React.createElement(getTierIcon(eligibilityStatus.highestQualified.tier_level), {
                            className: "w-6 h-6"
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-xl font-bold text-text-primary">
                              {eligibilityStatus.highestQualified.name}
                            </h5>
                            {eligibilityStatus.isTopTier && (
                              <Badge variant="default" className="px-2 py-1">
                                <Crown className="w-3 h-3 mr-1" />
                                Highest Tier
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary">
                            {eligibilityStatus.highestQualified.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              onClick={copyEligibilityMessage}
                              className="px-3 py-1 h-auto text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Share Result
                            </Button>
                            <span className="text-xs text-accent font-medium">
                              ✓ Qualified for registration
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-4 bg-surface-tertiary border border-border-primary rounded-xl">
                      <p className="text-text-secondary mb-2">
                        You don't qualify for any VIP tier with this amount yet.
                      </p>
                      <p className="text-sm text-text-muted">
                        Increase your spending to unlock VIP benefits!
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress to Next Tier */}
                {progressData && (
                  <div>
                    <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                      Progress to Next Tier
                    </h4>
                    
                    <div className="p-4 bg-surface-tertiary rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-text-primary">
                          Progress to {progressData.nextTier.name}
                        </span>
                        <span className="text-sm text-accent font-bold">
                          {Math.round(progressData.progress)}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-border-primary rounded-full h-3 mb-4 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressData.progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          Current: {formatCurrency(spendingAmount)}
                        </span>
                        <span className="text-text-secondary">
                          Target: {formatCurrency(progressData.targetAmount)}
                        </span>
                      </div>
                      
                      {progressData.remaining > 0 && (
                        <div className="mt-3 p-3 bg-accent/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <ArrowUp className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-text-primary">
                              You need {formatCurrency(progressData.remaining)} more to qualify for {progressData.nextTier.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Qualified Tiers */}
                {eligibilityStatus.qualifiedTiers.length > 1 && (
                  <div>
                    <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-success" />
                      All Qualified Tiers
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-3">
                      {eligibilityStatus.qualifiedTiers.map((tier, index) => {
                        const TierIcon = getTierIcon(tier.tier_level);
                        return (
                          <motion.div
                            key={tier.id}
                            initial={!reducedMotion ? { opacity: 0, x: -20 } : {}}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-surface border border-border-primary rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center" 
                                style={{ backgroundColor: tier.card_color + '20', color: tier.card_color }}
                              >
                                <TierIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-text-primary text-sm truncate">
                                  {tier.name}
                                </h6>
                                <p className="text-xs text-text-muted">
                                  {tier.minimum_receipt_amount 
                                    ? `${formatCurrency(tier.minimum_receipt_amount)} receipt`
                                    : `${formatCurrency(tier.minimum_spend_amount)} monthly`
                                  }
                                </p>
                              </div>
                              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                {eligibilityStatus.highestQualified && (
                  <motion.div
                    initial={!reducedMotion ? { opacity: 0, y: 10 } : {}}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center pt-4 border-t border-border-primary"
                  >
                    <Button 
                      size="lg" 
                      className="px-8 py-3"
                      onClick={() => {
                        // Could trigger registration flow or scroll to registration section
                        console.log(`Register for ${eligibilityStatus.highestQualified?.name}`);
                      }}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Register at VIP Lounge
                    </Button>
                    <p className="mt-2 text-sm text-text-muted">
                      Ground Floor, Main Lobby • Daily: 10:00 AM - 10:00 PM
                    </p>
                  </motion.div>
                )}

                {/* Celebration Effects */}
                <AnimatePresence>
                  {isAnimatingCelebration && eligibilityStatus.isTopTier && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            opacity: 0,
                            scale: 0,
                            x: '50%',
                            y: '50%'
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: `${50 + (Math.random() - 0.5) * 200}%`,
                            y: `${50 + (Math.random() - 0.5) * 200}%`
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.2,
                            ease: "easeOut"
                          }}
                          className="absolute w-4 h-4"
                        >
                          <Sparkles className="w-full h-full text-accent" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-text-muted"
              >
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your spending amount to check VIP eligibility</p>
                <p className="text-sm mt-1">Start typing to see real-time results</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};