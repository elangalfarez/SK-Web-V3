// src/components/ui/vip-compare-panel.tsx
// Fixed: Removed unused imports (AnimatePresence, Crown, Badge, cn) and unused function (getIconComponent)
import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, ArrowRight, CheckCircle2, Gift } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VipTier, VipBenefitWithNote } from '@/lib/supabase';

interface VipComparePanelProps {
  selectedTiers: VipTier[];
  tierBenefits: Record<string, VipBenefitWithNote[]>;
  onClearSelections: () => void;
  onRemoveTier: (tierId: string) => void;
}

// Format currency in Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  if (amount === 0) return 'Free';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Get requirement text
const getRequirement = (tier: VipTier): string => {
  return tier.minimum_receipt_amount 
    ? `${formatCurrency(tier.minimum_receipt_amount)} in one receipt`
    : `${formatCurrency(tier.minimum_spend_amount)} monthly spend`;
};

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const VipComparePanel: React.FC<VipComparePanelProps> = ({
  selectedTiers,
  tierBenefits,
  onClearSelections,
  onRemoveTier
}) => {
  const reducedMotion = prefersReducedMotion();

  if (selectedTiers.length === 0) return null;

  // Get all unique benefits across selected tiers
  const allBenefitIds = new Set<string>();
  selectedTiers.forEach(tier => {
    const benefits = tierBenefits[tier.id] || [];
    benefits.forEach(benefit => allBenefitIds.add(benefit.id));
  });

  const uniqueBenefits = Array.from(allBenefitIds).map(benefitId => {
    // Find the benefit from any tier (they should all have the same base data)
    let foundBenefit: VipBenefitWithNote | null = null;
    
    for (const tier of selectedTiers) {
      const tierBenefit = (tierBenefits[tier.id] || []).find(b => b.id === benefitId);
      if (tierBenefit) {
        foundBenefit = tierBenefit;
        break;
      }
    }
    
    return foundBenefit;
  }).filter(Boolean) as VipBenefitWithNote[];

  // Sort benefits by display order
  uniqueBenefits.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <>
      {/* Desktop: Floating Right Panel */}
      <motion.div
        key="desktop-panel"
        initial={!reducedMotion ? { x: 400, opacity: 0 } : { opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={!reducedMotion ? { x: 400, opacity: 0 } : { opacity: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40 w-96 max-h-[80vh] overflow-hidden"
      >
        <div className="bg-surface border-2 border-accent rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-border-primary bg-accent text-text-inverse">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Compare VIP Tiers
                </h3>
                <p className="text-text-inverse/80 text-sm mt-1">
                  {selectedTiers.length} tier{selectedTiers.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={onClearSelections}
                className="p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-text-inverse/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-inverse focus:ring-offset-2 focus:ring-offset-accent"
                aria-label="Close comparison panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {/* Selected Tiers */}
            <div className="p-4 space-y-3">
              {selectedTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={!reducedMotion ? { opacity: 0, y: 10 } : { opacity: 1 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary text-sm truncate">
                      {tier.name}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {getRequirement(tier)}
                    </p>
                    <div className="flex items-center mt-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: tier.card_color }}
                      />
                      <span className="text-xs text-text-muted">
                        {(tierBenefits[tier.id] || []).length} benefits
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveTier(tier.id)}
                    className="ml-2 p-1 text-text-muted hover:text-error hover:bg-error/10 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
                    aria-label={`Remove ${tier.name} from comparison`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Quick Comparison */}
            {selectedTiers.length > 1 && (
              <div className="p-4 border-t border-border-primary">
                <h4 className="font-semibold text-text-primary mb-3 text-sm flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-accent" />
                  Quick Comparison
                </h4>
                
                <div className="space-y-2">
                  {/* Spending Requirements */}
                  <div>
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Requirements
                    </span>
                    {selectedTiers.map(tier => (
                      <div key={tier.id} className="flex justify-between items-center text-xs mt-1">
                        <span className="text-text-secondary truncate mr-2">{tier.name}</span>
                        <span className="font-medium text-text-primary">
                          {tier.minimum_receipt_amount 
                            ? formatCurrency(tier.minimum_receipt_amount)
                            : formatCurrency(tier.minimum_spend_amount)
                          }
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Benefits Count */}
                  <div className="pt-2">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Benefits Count
                    </span>
                    {selectedTiers.map(tier => (
                      <div key={tier.id} className="flex justify-between items-center text-xs mt-1">
                        <span className="text-text-secondary truncate mr-2">{tier.name}</span>
                        <span className="font-medium text-accent">
                          {(tierBenefits[tier.id] || []).length} benefits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-primary space-y-3">
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => {
                // Could trigger registration or scroll to registration section
                console.log('Register at VIP Lounge clicked');
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              Register at VIP Lounge
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelections}
              className="w-full text-text-muted hover:text-accent"
            >
              Clear All Selections
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile: Bottom Sheet */}
      <motion.div
        key="mobile-panel"
        initial={!reducedMotion ? { y: '100%' } : { opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={!reducedMotion ? { y: '100%' } : { opacity: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-2 border-accent shadow-2xl max-h-[60vh]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-border-primary rounded-full"></div>
        </div>

        {/* Header */}
        <div className="p-4 border-b border-border-primary">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-accent" />
                Compare VIP Tiers
              </h3>
              <p className="text-text-muted text-sm">
                {selectedTiers.length} tier{selectedTiers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClearSelections}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Close comparison panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
          {/* Selected Tiers */}
          <div className="p-4 space-y-3">
            {selectedTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={!reducedMotion ? { opacity: 0, x: -20 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start p-3 bg-surface-secondary rounded-lg"
              >
                <div 
                  className="w-4 h-4 rounded-full mr-3 mt-0.5 flex-shrink-0" 
                  style={{ backgroundColor: tier.card_color }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-primary text-sm">
                    {tier.name}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {tier.minimum_receipt_amount 
                      ? `${formatCurrency(tier.minimum_receipt_amount)} receipt`
                      : `${formatCurrency(tier.minimum_spend_amount)} monthly`
                    }
                  </p>
                  <div className="text-xs text-accent font-medium">
                    {(tierBenefits[tier.id] || []).length} benefits
                  </div>
                </div>
                <button
                  onClick={() => onRemoveTier(tier.id)}
                  className="ml-2 p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error"
                  aria-label={`Remove ${tier.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <Button 
              className="w-full py-3"
              onClick={() => {
                console.log('Register at VIP Lounge clicked');
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              Register at VIP Lounge
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearSelections}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Could open detailed comparison modal
                  console.log('View detailed comparison');
                }}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Details
              </Button>
            </div>
          </div>
        </div>

        {/* Safe area for mobile devices */}
        <div className="h-4"></div>
      </motion.div>
    </>
  );
};