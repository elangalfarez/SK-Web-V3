// src/components/ui/event-faq.tsx
// Fixed: added 'as const' type assertions to ease properties in Framer Motion transition objects
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Globe, X } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from '@/components/ui/button';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  language?: 'en' | 'id';
}

interface EventFAQProps {
  faqs: FAQ[];
  title?: string;
  searchable?: boolean;
  languageSwitch?: boolean;
  defaultLanguage?: 'en' | 'id';
  className?: string;
}

// Default FAQs for events
const DEFAULT_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I get tickets for events?',
    answer: 'Most events offer tickets through our online booking system. You can find the "Get Tickets" button on each event detail page. Some events are free and don\'t require tickets - just show up!',
    category: 'Tickets',
    language: 'en'
  },
  {
    id: '2',
    question: 'Bagaimana cara mendapatkan tiket untuk acara?',
    answer: 'Sebagian besar acara menyediakan tiket melalui sistem pemesanan online kami. Anda dapat menemukan tombol "Dapatkan Tiket" di setiap halaman detail acara. Beberapa acara gratis dan tidak memerlukan tiket - datang saja!',
    category: 'Tiket',
    language: 'id'
  },
  {
    id: '3',
    question: 'Can I bring children to events?',
    answer: 'Most events are family-friendly and welcome children. However, some events may have age restrictions (like our midnight movie marathons). Check the event details page for specific age requirements.',
    category: 'General',
    language: 'en'
  },
  {
    id: '4',
    question: 'Bisakah saya membawa anak-anak ke acara?',
    answer: 'Sebagian besar acara ramah keluarga dan menyambut anak-anak. Namun, beberapa acara mungkin memiliki batasan usia (seperti maraton film tengah malam kami). Periksa halaman detail acara untuk persyaratan usia spesifik.',
    category: 'Umum',
    language: 'id'
  },
  {
    id: '5',
    question: 'What happens if an event is cancelled?',
    answer: 'If an event is cancelled due to unforeseen circumstances, all ticket holders will be automatically refunded. We\'ll also notify you via email and SMS if you\'ve provided your contact information.',
    category: 'Tickets',
    language: 'en'
  },
  {
    id: '6',
    question: 'Apa yang terjadi jika acara dibatalkan?',
    answer: 'Jika acara dibatalkan karena keadaan yang tidak terduga, semua pemegang tiket akan mendapat pengembalian dana secara otomatis. Kami juga akan memberi tahu Anda melalui email dan SMS jika Anda telah memberikan informasi kontak.',
    category: 'Tiket',
    language: 'id'
  },
  {
    id: '7',
    question: 'Is parking available during events?',
    answer: 'Yes! Supermal Karawaci offers ample parking with over 3,000 spaces. Parking is free for the first 3 hours, and event attendees often receive extended free parking - check your event confirmation for details.',
    category: 'Parking',
    language: 'en'
  },
  {
    id: '8',
    question: 'Apakah tersedia parkir selama acara?',
    answer: 'Ya! Supermal Karawaci menyediakan parkir yang luas dengan lebih dari 3.000 tempat. Parkir gratis untuk 3 jam pertama, dan peserta acara sering mendapat perpanjangan parkir gratis - periksa konfirmasi acara Anda untuk detailnya.',
    category: 'Parkir',
    language: 'id'
  }
];

export const EventFAQ: React.FC<EventFAQProps> = ({
  faqs = DEFAULT_FAQS,
  title = 'Frequently Asked Questions',
  searchable = true,
  languageSwitch = true,
  defaultLanguage = 'en',
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'id'>(defaultLanguage);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Filter FAQs based on search and language
  const filteredFAQs = useMemo(() => {
    let filtered = faqs.filter(faq => faq.language === selectedLanguage);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [faqs, searchQuery, selectedLanguage]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    const groups: { [category: string]: FAQ[] } = {};
    
    filteredFAQs.forEach(faq => {
      const category = faq.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(faq);
    });

    return groups;
  }, [filteredFAQs]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Animation variants with proper type assertions for ease
  const accordionVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0,
      height: prefersReducedMotion ? 'auto' : 0
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeInOut' as const
      }
    },
    exit: { 
      opacity: prefersReducedMotion ? 1 : 0,
      height: prefersReducedMotion ? 'auto' : 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.2,
        ease: 'easeInOut' as const
      }
    }
  };

  if (filteredFAQs.length === 0 && !searchQuery) {
    return null;
  }

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
        {filteredFAQs.length > 0 && (
          <p className="text-text-secondary">
            {selectedLanguage === 'en' 
              ? `${filteredFAQs.length} frequently asked questions about our events`
              : `${filteredFAQs.length} pertanyaan yang sering diajukan tentang acara kami`}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        {searchable && (
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={selectedLanguage === 'en' ? 'Search FAQs...' : 'Cari FAQ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-surface border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text-primary placeholder-text-muted"
                aria-label={selectedLanguage === 'en' ? 'Search FAQs' : 'Cari FAQ'}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={selectedLanguage === 'en' ? 'Clear search' : 'Hapus pencarian'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Language Switcher */}
        {languageSwitch && (
          <div className="flex items-center gap-2 bg-surface-secondary rounded-lg p-1 border border-border-secondary">
            <Globe className="w-4 h-4 text-text-muted ml-2" />
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLanguage === 'en'
                    ? 'bg-accent text-text-inverse'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={selectedLanguage === 'en'}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('id')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLanguage === 'id'
                    ? 'bg-accent text-text-inverse'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-pressed={selectedLanguage === 'id'}
              >
                Bahasa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Content */}
      {filteredFAQs.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              {Object.keys(groupedFAQs).length > 1 && (
                <h3 className="text-xl font-semibold text-text-primary border-b border-border-secondary pb-2">
                  {category}
                </h3>
              )}

              {/* FAQ Items */}
              <div className="space-y-3">
                {categoryFAQs.map((faq) => (
                  <Collapsible.Root
                    key={faq.id}
                    open={openItems.includes(faq.id)}
                    onOpenChange={() => toggleItem(faq.id)}
                  >
                    <div className="bg-surface-secondary rounded-lg border border-border-secondary overflow-hidden">
                      <Collapsible.Trigger asChild>
                        <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset">
                          <span className="font-medium text-text-primary pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform ${
                              openItems.includes(faq.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </Collapsible.Trigger>

                      <AnimatePresence>
                        {openItems.includes(faq.id) && (
                          <Collapsible.Content forceMount asChild>
                            <motion.div
                              variants={accordionVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="px-6 pb-4 text-text-secondary leading-relaxed border-t border-border-muted">
                                <div className="pt-4">
                                  {faq.answer}
                                </div>
                              </div>
                            </motion.div>
                          </Collapsible.Content>
                        )}
                      </AnimatePresence>
                    </div>
                  </Collapsible.Root>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* No Results State */
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {selectedLanguage === 'en' ? 'No FAQs found' : 'FAQ tidak ditemukan'}
          </h3>
          <p className="text-text-secondary mb-4">
            {selectedLanguage === 'en' 
              ? 'Try adjusting your search terms or browse all FAQs.'
              : 'Coba sesuaikan kata kunci pencarian atau jelajahi semua FAQ.'}
          </p>
          <Button onClick={clearSearch} variant="outline">
            {selectedLanguage === 'en' ? 'Clear Search' : 'Hapus Pencarian'}
          </Button>
        </div>
      )}
    </section>
  );
};

export default EventFAQ;