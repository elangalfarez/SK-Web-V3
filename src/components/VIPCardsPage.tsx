// src/pages/VIPCardsPage.tsx
// Created: Main VIP Cards page with Hero, card layout, compare panel, eligibility checker, and FAQ
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Hero } from '@/components/ui/Hero';
import { VipCard } from '@/components/ui/vip-card';
import { EligibilityChecker } from '@/components/ui/eligibility-checker';
import { VipFaq } from '@/components/ui/vip-faq';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { 
  fetchVipTiers, 
  fetchVipTierBenefits, 
  VipTier, 
  VipBenefitWithNote, 
  FALLBACK_VIP_TIERS 
} from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Set document title on mount
if (typeof document !== 'undefined') {
  document.title = 'VIP Cards - Supermal Karawaci';
}

const VIPCardsPage: React.FC = () => {
  // Data state
  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [tierBenefits, setTierBenefits] = useState<Record<string, VipBenefitWithNote[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // UI state
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);

  // Load VIP tiers and benefits on mount
  useEffect(() => {
    loadVipData();
  }, []);

  const loadVipData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tiersData = await fetchVipTiers();
      
      if (!tiersData || tiersData.length === 0) {
        throw new Error('No VIP tiers available');
      }

      setTiers(tiersData);
      setUsingFallback(false);
      
      // Pre-load benefits for all tiers
      const benefitsPromises = tiersData.map(async (tier) => {
        try {
          const benefits = await fetchVipTierBenefits(tier.id);
          return { tierId: tier.id, benefits };
        } catch (error) {
          console.warn(`Failed to load benefits for tier ${tier.name}:`, error);
          return { tierId: tier.id, benefits: [] };
        }
      });

      const benefitsResults = await Promise.all(benefitsPromises);
      const benefitsMap: Record<string, VipBenefitWithNote[]> = {};
      
      benefitsResults.forEach(({ tierId, benefits }) => {
        benefitsMap[tierId] = benefits;
      });
      
      setTierBenefits(benefitsMap);

    } catch (err) {
      console.error('Error loading VIP data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load VIP data');
      
      // Use fallback data
      setTiers(FALLBACK_VIP_TIERS);
      setUsingFallback(true);
      
      toast.error('Showing cached VIP data', {
        duration: 4000,
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle card expand
  const handleCardExpand = (tierId: string) => {
    setExpandedTierId(expandedTierId === tierId ? null : tierId);
  };

  // Selected tiers for comparison - keeping for potential future use
  const selectedTiers = useMemo(() => {
    return [];
  }, []);

  // Hero stats
  const heroStats = useMemo(() => [
    { value: tiers.length.toString(), label: 'VIP Tiers' },
    { value: '15+', label: 'Exclusive Benefits' },
    { value: '24/7', label: 'VIP Support' }
  ], [tiers.length]);

  // FAQ data with language support
  const faqData = [
    {
      question: {
        en: 'How do I register for a VIP card?',
        id: 'Bagaimana cara mendaftar kartu VIP?'
      },
      answer: {
        en: 'Visit our VIP Lounge located on the Ground Floor near the Main Lobby. Bring a valid ID and proof of spending to qualify for your desired tier.',
        id: 'Kunjungi VIP Lounge kami yang terletak di Lantai Dasar dekat Main Lobby. Bawa KTP yang masih berlaku dan bukti belanja untuk kualifikasi tier yang diinginkan.'
      }
    },
    {
      question: {
        en: 'What are the spending requirements?',
        id: 'Berapa persyaratan belanja?'
      },
      answer: {
        en: 'Requirements vary by tier: Shopping Card needs Rp 500K in one receipt, VIP Platinum needs Rp 5M monthly spend, Super VIP needs Rp 10M monthly spend, and Super VIP Flazz needs Rp 15M monthly spend.',
        id: 'Persyaratan bervariasi per tier: Shopping Card butuh Rp 500K dalam satu struk, VIP Platinum butuh Rp 5M belanja bulanan, Super VIP butuh Rp 10M belanja bulanan, dan Super VIP Flazz butuh Rp 15M belanja bulanan.'
      }
    },
    {
      question: {
        en: 'How long is the VIP card valid?',
        id: 'Berapa lama masa berlaku kartu VIP?'
      },
      answer: {
        en: 'VIP cards are valid for 1 year from the issue date. You can renew by maintaining your spending tier or re-qualifying at the VIP Lounge.',
        id: 'Kartu VIP berlaku selama 1 tahun dari tanggal penerbitan. Anda bisa memperpanjang dengan mempertahankan tier belanja atau kualifikasi ulang di VIP Lounge.'
      }
    },
    {
      question: {
        en: 'Can I upgrade my VIP tier?',
        id: 'Bisakah saya upgrade tier VIP saya?'
      },
      answer: {
        en: 'Yes! Once you meet the spending requirements for a higher tier, visit the VIP Lounge to upgrade your card and unlock additional benefits.',
        id: 'Ya! Setelah Anda memenuhi persyaratan belanja untuk tier yang lebih tinggi, kunjungi VIP Lounge untuk upgrade kartu dan buka manfaat tambahan.'
      }
    },
    {
      question: {
        en: 'What is Flazz payment integration?',
        id: 'Apa itu integrasi pembayaran Flazz?'
      },
      answer: {
        en: 'Super VIP Flazz cards can be used for contactless payments at all Flazz-enabled merchants, combining your VIP benefits with convenient e-money functionality.',
        id: 'Kartu Super VIP Flazz dapat digunakan untuk pembayaran contactless di semua merchant yang mendukung Flazz, menggabungkan manfaat VIP dengan fungsionalitas e-money yang praktis.'
      }
    },
    {
      question: {
        en: 'Where can I use VIP parking?',
        id: 'Di mana saya bisa menggunakan parkir VIP?'
      },
      answer: {
        en: 'VIP parking is available on weekends and public holidays for Super VIP and Super VIP Flazz cardholders. Look for the designated VIP parking areas near mall entrances.',
        id: 'Parkir VIP tersedia saat weekend dan hari libur untuk pemegang kartu Super VIP dan Super VIP Flazz. Cari area parkir VIP yang ditandai dekat pintu masuk mall.'
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" label="Loading VIP tiers..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section - Using reusable Hero component for consistency */}
      <Hero
        title={<>VIP <span className="text-accent">Cards</span></>}
        subtitle="Unlock exclusive privileges and premium experiences with our VIP membership tiers. From special discounts to priority services, discover the perfect tier for your lifestyle."
        stats={heroStats}
        variant="default"
        bgPattern="soft-circles"
        cta={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                // Scroll to cards section
                document.getElementById('vip-cards')?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }}
            >
              <Star className="w-5 h-5 mr-2" />
              Explore VIP Tiers
            </Button>
          </motion.div>
        }
      />

      {/* Data Status Banner */}
      {usingFallback && (
        <div className="bg-warning/10 border-b border-warning/20 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Showing cached VIP data - some information may not be current
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadVipData}
                className="text-warning hover:text-warning-hover"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Cards Section */}
      <section id="vip-cards" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Choose Your <span className="text-accent">VIP Experience</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover the perfect VIP membership tier for your shopping lifestyle
            </p>
          </motion.div>

          {/* Cards Grid - Desktop: 4 cards in row, Mobile: horizontal scroll */}
          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut" 
                  }}
                  className="h-full"
                >
                  <VipCard
                    tier={tier}
                    benefits={tierBenefits[tier.id] || []}
                    isExpanded={expandedTierId === tier.id}
                    onExpand={() => handleCardExpand(tier.id)}
                    usingFallback={usingFallback}
                  />
                </motion.div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-4 -mx-4">
                {tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 
                    }}
                    className="flex-shrink-0 w-80"
                  >
                    <VipCard
                      tier={tier}
                      benefits={tierBenefits[tier.id] || []}
                      isExpanded={expandedTierId === tier.id}
                      onExpand={() => handleCardExpand(tier.id)}
                      usingFallback={usingFallback}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* All Cards Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="relative inline-block">
              <img
                src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/kartu-VIP-berlima-1-768x197.png"
                alt="All VIP Cards Collection"
                className="w-full max-w-4xl h-auto rounded-2xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
            <p className="mt-4 text-sm text-text-muted max-w-2xl mx-auto">
              Complete collection of Supermal Karawaci VIP cards - each tier designed to elevate your shopping experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Eligibility Checker Section */}
      <section className="py-16 md:py-20 bg-surface-tertiary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Check Your <span className="text-accent">Eligibility</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Enter your monthly spending amount to see which VIP tiers you qualify for
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EligibilityChecker tiers={tiers} />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Frequently Asked <span className="text-accent">Questions</span>
            </h2>
            <p className="text-lg text-text-secondary">
              Everything you need to know about our VIP membership program
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VipFaq faqs={faqData} />
          </motion.div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section className="py-16 md:py-20 bg-accent text-text-inverse overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <Gift className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Unlock VIP Benefits?
              </h2>
              <p className="text-lg text-text-inverse/90 max-w-2xl mx-auto">
                Visit our VIP Lounge today to register for your preferred tier and start enjoying exclusive privileges immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold bg-text-inverse text-accent hover:bg-text-inverse/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Star className="w-5 h-5 mr-2" />
                Register at VIP Lounge
              </Button>
              
              <div className="text-sm text-text-inverse/80">
                <p className="font-medium">VIP Lounge Location:</p>
                <p>Ground Floor, Main Lobby</p>
                <p>Daily: 10:00 AM - 10:00 PM</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-text-inverse rounded-full"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-text-inverse rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default VIPCardsPage;