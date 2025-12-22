// src/components/VIPCardsPage.tsx
// Created: Main VIP Cards page with Hero, card layout, compare panel, eligibility checker, and FAQ
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Hero } from '@/components/ui/Hero';
import { VipCard } from '@/components/ui/vip-card';
import { EligibilityChecker } from '@/components/ui/eligibility-checker';
import { VipFaq } from '@/components/ui/vip-faq';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSEO } from '@/lib/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo/page-seo';
import { generateFAQSchema } from '@/lib/seo/structured-data';

import {
  fetchVipTiers,
  fetchVipTierBenefits,
  VipTier,
  VipBenefitWithNote,
  FALLBACK_VIP_TIERS
} from '@/lib/supabase';

const VIPCardsPage: React.FC = () => {
  // SEO with FAQ schema
  useSEO(
    {
      ...PAGE_SEO.vipCards,
      structuredData: {
        type: 'FAQPage',
        data: generateFAQSchema([
          {
            question: 'What are the VIP membership tiers?',
            answer: 'Supermal Karawaci offers three VIP tiers: VIP Platinum, Super VIP, and Super VIP Flazz, each with increasing benefits and privileges.',
          },
          {
            question: 'How do I apply for VIP membership?',
            answer: 'Visit our Customer Service desk on the Ground Floor with a valid ID and proof of purchase to apply for VIP membership.',
          },
          {
            question: 'What benefits do VIP members receive?',
            answer: 'VIP members enjoy exclusive discounts, priority parking, access to VIP lounge, special event invitations, and points earning on purchases.',
          },
        ]),
      },
    },
    [
      { name: 'Home', url: '/' },
      { name: 'VIP Cards', url: '/vip-cards' },
    ]
  );

  // Data state
  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [tierBenefits, setTierBenefits] = useState<Record<string, VipBenefitWithNote[]>>({});
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
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
        en: 'How do I register for VIP Membership?',
        id: 'Bagaimana cara mendaftar kartu VIP?'
      },
      answer: {
        en: 'Important: You must first register at the VIP Lounge. After that, submit/register your purchase receipts on the same day as each purchase during a single calendar month, according to the tier you wish to qualify for.',
        id: 'PENTING harus daftar terlebih dahulu ke VIP Lounge, lalu daftarkan struk belanja di hari yang sama dalam sebulan sesuai dengan tier yang diinginkan.'
      }
    },
    {
      question: {
        en: 'Can I collect receipts first and register them later within the month?',
        id: 'Apakah bisa mengumpulkan struk terlebih dahulu baru dalam sebulan lalu mendaftar sebagai VIP Member?'
      },
      answer: {
        en: 'No. Receipts must be registered on the day of purchase. Exception: If a customer makes a single qualifying purchase (for example, a mobile phone worth IDR 15,000,000) and registers for a VIP tier (e.g., Super VIP Flazz, the highest tier) on that same day, they may qualify immediately and will receive the Super VIP Flazz card and VIP membership activation right away.',
        id: 'Tidak bisa, karena struk harus didaftarkan di hari yang sama. Kecuali, customer telah membeli misal sebuah handphone senilai Rp 15 juta dan di hari yang sama memutuskan untuk daftar sebagai VIP Member Supermal Karawaci Super VIP Flazz (tier tertinggi), maka bisa qualify dan langsung mendapatkan kartu Super VIP Flazz serta aktif sebagai VIP Member Supermal Karawaci.'
      }
    },
    {
      question: {
        en: 'After I register and submit receipts, is my VIP card activated immediately?',
        id: 'Setelah saya registrasi dan mendaftarkan struk, apakah kartu VIP member saya langsung aktif?'
      },
      answer: {
        en: 'Yes. Once you have registered and met the minimum total spend required from the receipts you submitted for the chosen tier, your VIP membership will be activated immediately. You can then begin earning points and redeeming rewards and other member benefits.',
        id: 'Ya, setelah daftar dan memenuhi syarat minimal oembalanjaan dari seluruh struk yang telah didaftarkan sesuai dengan tier yang dipilih, maka VIP member akan langsung aktif, dan langsung bisa dipakai untuk mengumpulkan poin dan menukar hadiah serta benefit lainnya.'
      }
    },
    {
      question: {
        en: 'While I am in the process of submitting receipts to reach the required spend, do the points from those receipts remain?',
        id: 'Apakah dalam proses saya mendaftarkan struk hingga VIP member saya aktif, poin dari struk yang saya kumpulkan tetap ada?'
      },
      answer: {
        en: 'Yes. For example, if you aim to qualify for Super VIP Flazz and submit receipts of IDR 500,000 each day for 30 days to reach the minimum, you will receive the Super VIP Flazz card at the end of the month with the points accumulated from those registered receipts — and you may immediately redeem those points for available merchandise.',
        id: 'Ya, misal Anda ingin mendaftar sebagai Super VIP Flazz, Anda sedang dalam proses memenuhi minimal pembelanjaan dengan mendaftarkan struk senilai Rp 500k setiap hari selama sebulan (30 hari), di akhir bulan Anda akan menerima kartu Super VIP Flazz dengan poin dari struk belanja yang sudah Anda kumpulkan, dan bisa langsung ditukar untuk merchandise yang tersedia!.'
      }
    },
    {
      question: {
        en: 'What happens if I fail to reach the minimum spend within the month?',
        id: 'Bagaimana jika saya gagal mencapai minimal pembelanjaan dalam sebulan?'
      },
      answer: {
        en: 'If you have registered as a VIP applicant but do not reach the required minimum spend within the month, you will not receive the VIP card and the points from the collected receipts will be forfeited. You must re-register and submit receipts again (on the day of purchase) for 30 days in the following month to qualify and activate your VIP card.',
        id: 'Jika Anda sudah mendaftar sebagai VIP Member namun gagal mencapai minimal pembelanjaan dalam sebulan, Anda tidak akan mendapatkan kartu VIP Member serta poin dari struk yang dikumpulkan akan hangus. Anda harus mendaftar kembali dan mendaftarkan kembali struk pembelanjaan di hari yang sama selama 30 hari di bulan depannya untuk mendaftarkan dan mengaktifkan kartu VIP member Anda.'
      }
    },
    {
      question: {
        en: 'How long is the VIP membership valid?',
        id: 'Berapa lama masa berlaku VIP Member Supermal Karawaci?'
      },
      answer: {
        en: 'VIP Platinum and Super VIP: One (1) year from the card activation date. Super VIP Flazz: Two (2) years from the card activation date.',
        id: 'Satu tahun sejak kartu diaktifkan untuk VIP Platinum dan Super VIP. Dua tahun untuk Super VIP Flazz.'
      }
    },
    {
      question: {
        en: 'Do I need to meet the tier spending requirement again every year to renew my VIP membership?',
        id: 'Apakah untuk perpanjangan masa aktif VIP Member harus melakukan transaksi senilai tier yang dipilih dalam satu bulan kembali?'
      },
      answer: {
        en: 'No. To renew your VIP membership, you only need to continue shopping at Supermal Karawaci at any amount and register the transaction receipts on the same day regularly at our VIP Counter or Information Counter.',
        id: 'Tidak. Untuk perpanjangan masa aktif cukup dengan aktif berbelanja di Supermal Karawaci dalam nominal berapapun dan mendaftarkan struk transaksi tersebut di hari yang sama secara rutin di VIP Counter atau Information Counter kami.'
      }
    },
    {
      question: {
        en: 'How do I renew my VIP membership?',
        id: 'Bagaimana cara memperpanjang masa aktif VIP Member?'
      },
      answer: {
        en: 'Visit the VIP Lounge and submit your transaction receipts to process the renewal.',
        id: 'Kunjungi VIP Lounge dan serahkan struk transaksi Anda untuk memproses perpanjangan.'
      }
    },
    {
      question: {
        en: 'What happens if I do not submit transaction receipts for 6 months?',
        id: 'Apa yang terjadi jika saya tidak mengumpulkan struk transaksi selama 6 bulan?'
      },
      answer: {
        en: 'Any reward points you have accumulated will be forfeited.',
        id: 'Poin reward yang telah Anda kumpulkan akan hangus.'
      }
    },
    {
      question: {
        en: 'What happens if I do not submit transaction receipts for 12 months?',
        id: 'Apa yang terjadi jika saya tidak mengumpulkan struk transaksi selama 12 bulan?'
      },
      answer: {
        en: 'Your VIP card will be deactivated and you must reapply from the beginning.',
        id: 'Kartu VIP Anda akan dinonaktifkan dan Anda harus mendaftar kembali dari awal.'
      }
    },
    {
      question: {
        en: 'How can I upgrade my VIP tier?',
        id: 'Bagaimana cara meningkatkan tier VIP saya?'
      },
      answer: {
        en: 'You may redeem points to upgrade tiers: Redeem 200 points to upgrade from VIP Platinum → Super VIP, or Super VIP → Super VIP Flazz. Or redeem 250 points to upgrade directly from VIP Platinum → Super VIP Flazz.',
        id: 'Anda dapat menukarkan poin untuk meningkatkan tier: Tukarkan 200 poin untuk meningkatkan dari VIP Platinum → Super VIP, atau Super VIP → Super VIP Flazz. Atau tukarkan 250 poin untuk meningkatkan langsung dari VIP Platinum → Super VIP Flazz.'
      }
    },
    {
      question: {
        en: 'How long are my points valid?',
        id: 'Berapa lama poin saya berlaku?'
      },
      answer: {
        en: 'Your points are valid for 12 months from the date they are earned or from the date your card was issued',
        id: 'Poin Anda berlaku selama 12 bulan sejak tanggal diperoleh atau sejak tanggal kartu Anda diterbitkan.'
      }
    },
    {
      question: {
        en: 'What if my VIP card is lost?',
        id: 'Apa yang terjadi jika kartu VIP saya hilang?'
      },
      answer: {
        en: 'You can reissue the card at the VIP Lounge for a replacement fee: VIP Platinum and Super VIP: IDR 50,000. Super VIP Flazz: IDR 100,000.',
        id: 'Anda dapat menerbitkan kembali kartu di VIP Lounge dengan biaya penggantian: VIP Platinum dan Super VIP: IDR 50,000. Super VIP Flazz: IDR 100,000.'
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
      <section id="vip-cards" className="py-12 sm:py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Choose Your <span className="text-accent">VIP Experience</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover the perfect VIP membership tier for your shopping lifestyle
            </p>
          </motion.div>

          {/* Cards Layout - Responsive */}
          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
            <div className="md:hidden overflow-hidden">
              {/* Scroll indicator */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-sm text-text-muted">
                  Swipe to explore all {tiers.length} VIP tiers
                </p>
                <div className="flex space-x-1">
                  {tiers.map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-border-primary"
                    />
                  ))}
                </div>
              </div>

              {/* Scrollable container with proper mobile setup */}
              <div className="relative">
                <div 
                  className="flex gap-4 overflow-x-auto overscroll-x-contain scrollbar-hide px-4 pb-4 snap-x snap-mandatory -mx-4"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {tiers.map((tier, index) => (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1 
                      }}
                      className="flex-none w-[280px] sm:w-[300px] snap-start first:ml-0"
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
                  
                  {/* Scroll end spacer */}
                  <div className="flex-none w-4" />
                </div>
              </div>

              {/* Mobile scroll hint */}
              <div className="text-center mt-3">
                <p className="text-xs text-text-muted">
                  ← Swipe left and right to see all tiers →
                </p>
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
                src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/VIP%20Card/kartu-VIP-berlima-1-768x197.png"
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

      {/* Custom CSS for mobile scrolling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide scrollbars */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* Prevent horizontal overflow on main page */
          body, html {
            overflow-x: hidden;
          }

          /* Ensure smooth touch scrolling on mobile */
          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }

          /* Mobile scroll snap points */
          @media (max-width: 768px) {
            .snap-x {
              scroll-snap-type: x mandatory;
            }
            
            .snap-start {
              scroll-snap-align: start;
            }
          }

          /* Prevent any accidental horizontal scroll */
          .max-w-7xl {
            max-width: min(1280px, 100vw);
          }

          /* Fix mobile modal to be truly full screen */
          @media (max-width: 640px) {
            .modal-fullscreen {
              position: fixed !important;
              inset: 0 !important;
              margin: 0 !important;
              border-radius: 0 !important;
              max-height: 100vh !important;
              max-width: 100vw !important;
              width: 100vw !important;
              height: 100vh !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default VIPCardsPage;