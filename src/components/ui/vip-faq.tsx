// src/components/ui/vip-faq.tsx
// Created: Modular FAQ accordion with language switching, search, and accessibility
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Globe, 
  X, 
  MessageCircle, 
  HelpCircle,
  Languages
} from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: {
    en: string;
    id: string;
  };
  answer: {
    en: string;
    id: string;
  };
}

interface VipFaqProps {
  faqs: FaqItem[];
  defaultLanguage?: 'en' | 'id';
  searchable?: boolean;
  className?: string;
}

// Language display names
const LANGUAGE_NAMES = {
  en: 'English',
  id: 'Bahasa Indonesia'
};

// Language flags/emojis for visual distinction
const LANGUAGE_FLAGS = {
  en: '🇺🇸',
  id: '🇮🇩'
};

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const VipFaq: React.FC<VipFaqProps> = ({
  faqs,
  defaultLanguage = 'en',
  searchable = true,
  className
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'id'>(defaultLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const reducedMotion = prefersReducedMotion();

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter(faq => {
      const question = faq.question[activeLanguage].toLowerCase();
      const answer = faq.answer[activeLanguage].toLowerCase();
      return question.includes(query) || answer.includes(query);
    });
  }, [faqs, searchQuery, activeLanguage]);

  // Toggle expanded state for FAQ item
  const toggleExpanded = useCallback((index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  }, [expandedItems]);

  // Clear search and collapse all
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setExpandedItems(new Set());
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((language: 'en' | 'id') => {
    setActiveLanguage(language);
    // Optionally collapse all items when switching language
    // setExpandedItems(new Set());
  }, []);

  // Expand all matching results (useful after search)
  const expandAll = useCallback(() => {
    const allIndices = new Set(filteredFaqs.map((_, index) => index));
    setExpandedItems(allIndices);
  }, [filteredFaqs]);

  // Collapse all items
  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Header Controls */}
      <div className="mb-8 space-y-4">
        {/* Language Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Languages className="w-5 h-5 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Language:</span>
            </div>
            <div className="flex bg-surface-secondary border border-border-primary rounded-lg p-1">
              {(['en', 'id'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                    activeLanguage === lang
                      ? 'bg-accent text-text-inverse shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                  aria-pressed={activeLanguage === lang}
                >
                  <span>{LANGUAGE_FLAGS[lang]}</span>
                  <span>{LANGUAGE_NAMES[lang]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Stats */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-text-muted">
            <MessageCircle className="w-4 h-4" />
            <span>{filteredFaqs.length} of {faqs.length} questions</span>
          </div>
        </div>

        {/* Search Bar */}
        {searchable && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder={`Search FAQs in ${LANGUAGE_NAMES[activeLanguage]}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-surface-secondary border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-accent transition-colors"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Search Results Header & Controls */}
        {(searchQuery || expandedItems.size > 0) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-secondary rounded-lg border border-border-primary">
            <div className="flex items-center space-x-2 text-sm">
              {searchQuery && (
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Search className="w-3 h-3 mr-1" />
                  "{searchQuery}"
                </Badge>
              )}
              <span className="text-text-muted">
                {expandedItems.size} expanded • {filteredFaqs.length} total
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {filteredFaqs.length > 0 && expandedItems.size < filteredFaqs.length && (
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  Expand All
                </Button>
              )}
              {expandedItems.size > 0 && (
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  Collapse All
                </Button>
              )}
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredFaqs.length > 0 ? (
            <motion.div
              key={`${activeLanguage}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedItems.has(index);
                
                return (
                  <motion.div
                    key={`faq-${index}-${activeLanguage}`}
                    initial={!reducedMotion ? { opacity: 0, y: 10 } : { opacity: 1 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: searchQuery ? 0 : index * 0.05 
                    }}
                  >
                    <Collapsible.Root
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(index)}
                      className={cn(
                        'bg-surface-secondary border border-border-primary rounded-xl overflow-hidden transition-all duration-200',
                        'hover:border-accent/30 hover:shadow-md',
                        isExpanded && 'border-accent/50 shadow-lg'
                      )}
                    >
                      <Collapsible.Trigger asChild>
                        <button
                          className="w-full p-6 text-left hover:bg-surface-tertiary transition-colors duration-200 focus:outline-none focus:bg-surface-tertiary focus:ring-2 focus:ring-inset focus:ring-accent"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="text-lg font-semibold text-text-primary leading-relaxed">
                                {faq.question[activeLanguage]}
                              </h3>
                              {searchQuery && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Badge variant="secondary" className="px-2 py-1 text-xs">
                                    <HelpCircle className="w-3 h-3 mr-1" />
                                    FAQ #{index + 1}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200',
                                  isExpanded 
                                    ? 'bg-accent text-text-inverse' 
                                    : 'bg-surface-tertiary text-text-muted'
                                )}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </div>
                          </div>
                        </button>
                      </Collapsible.Trigger>

                      <Collapsible.Content asChild>
                        <motion.div
                          initial={!reducedMotion ? { height: 0, opacity: 0 } : { opacity: 0 }}
                          animate={{ 
                            height: isExpanded ? 'auto' : 0, 
                            opacity: isExpanded ? 1 : 0 
                          }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            duration: reducedMotion ? 0 : 0.3,
                            ease: "easeInOut"
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-border-muted">
                            <div className="prose prose-sm max-w-none">
                              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                                {faq.answer[activeLanguage]}
                              </p>
                            </div>
                            
                            {/* Language indicator for answer */}
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-text-muted">
                                <Globe className="w-3 h-3" />
                                <span>Answered in {LANGUAGE_NAMES[activeLanguage]}</span>
                              </div>
                              
                              {/* Quick language switch for this answer */}
                              <div className="flex items-center space-x-1">
                                {(['en', 'id'] as const).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={cn(
                                      'px-2 py-1 text-xs rounded transition-colors duration-200',
                                      'focus:outline-none focus:ring-1 focus:ring-accent',
                                      activeLanguage === lang
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-text-muted hover:text-accent hover:bg-accent/5'
                                    )}
                                    disabled={activeLanguage === lang}
                                  >
                                    {LANGUAGE_FLAGS[lang]} {lang.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <div className="max-w-sm mx-auto">
                <Search className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No FAQs Found
                </h3>
                <p className="text-text-secondary mb-4">
                  No questions match your search "{searchQuery}" in {LANGUAGE_NAMES[activeLanguage]}.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={clearSearch}>
                    Clear Search
                  </Button>
                  <br />
                  <button
                    onClick={() => handleLanguageChange(activeLanguage === 'en' ? 'id' : 'en')}
                    className="text-sm text-accent hover:text-accent-hover underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                  >
                    Try searching in {LANGUAGE_NAMES[activeLanguage === 'en' ? 'id' : 'en']}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-xl text-center"
      >
        <HelpCircle className="w-8 h-8 text-accent mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-text-primary mb-2">
          Still Have Questions?
        </h4>
        <p className="text-text-secondary mb-4">
          Can't find what you're looking for? Visit our VIP Lounge or contact our customer service team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button size="sm">
            <Globe className="w-4 h-4 mr-2" />
            Visit VIP Lounge
          </Button>
        </div>
        <p className="text-xs text-text-muted mt-3">
          VIP Lounge • Ground Floor, Main Lobby • Daily: 10:00 AM - 10:00 PM
        </p>
      </motion.div>
    </div>
  );
};