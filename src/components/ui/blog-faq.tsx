// src/components/ui/blog-faq.tsx
// Created: Blog FAQ accordion component with editorial policy and submission guidelines

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, HelpCircle, Edit, Send, Globe } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'editorial-policy',
    question: 'What is our editorial policy?',
    answer: 'Our blog features news, events, and community stories related to Supermal Karawaci. All content is reviewed for accuracy, relevance, and community guidelines compliance. We prioritize authentic, helpful information that serves our visitors and local community. Posts are published in both Indonesian and English when possible.',
    icon: <Edit size={20} />
  },
  {
    id: 'submit-posts',
    question: 'How can I submit a guest post or story idea?',
    answer: 'We welcome community submissions! Email your story ideas, event announcements, or guest posts to blog@supermalkarawaci.com. Include a brief summary, relevant images, and your contact information. Community events, local business features, and customer success stories are especially welcome. Please allow 5-7 business days for review.',
    icon: <Send size={20} />
  },
  {
    id: 'wysiwyg-tips',
    question: 'What are the best practices for writing blog posts?',
    answer: 'Keep posts engaging and accessible. Use clear headings, short paragraphs, and bullet points when appropriate. Include high-quality images with descriptive alt text. Write compelling titles and summaries. Tag posts appropriately for better discoverability. Aim for 300-800 words for optimal readability. Always fact-check information and include sources when relevant.',
    icon: <HelpCircle size={20} />
  },
  {
    id: 'languages',
    question: 'Do you accept posts in languages other than Indonesian?',
    answer: 'We primarily publish in Indonesian to serve our local community, but we also welcome English content, especially for international visitors and events. If submitting in English, please provide an Indonesian translation when possible, or our team can assist with translation for approved posts.',
    icon: <Globe size={20} />
  }
];

export default function BlogFAQ() {
  const shouldReduceMotion = useReducedMotion();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(id);
    }
  };

  return (
    <motion.section
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      aria-labelledby="faq-heading"
      className="bg-surface border border-border rounded-xl p-6"
    >
      <h2 id="faq-heading" className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
        <HelpCircle size={24} className="text-accent" />
        Frequently Asked Questions
      </h2>

      <div className="space-y-4" role="region" aria-labelledby="faq-heading">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-lg overflow-hidden bg-background"
            >
              <button
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                id={`faq-question-${item.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-accent flex-shrink-0">
                    {item.icon}
                  </span>
                  <h3 className="text-base font-medium text-primary">
                    {item.question}
                  </h3>
                </div>
                
                <motion.div
                  animate={shouldReduceMotion ? {} : { rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown size={20} className="text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? {} : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? {} : { height: 'auto', opacity: 1 }}
                    exit={shouldReduceMotion ? {} : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <div
                      id={`faq-answer-${item.id}`}
                      aria-labelledby={`faq-question-${item.id}`}
                      className="px-6 pb-6 pt-2"
                      role="region"
                    >
                      <div className="pl-11">
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Contact Information */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pt-6 border-t border-border"
      >
        <p className="text-sm text-muted-foreground text-center">
          Have more questions? Contact our editorial team at{' '}
          <a 
            href="mailto:blog@supermalkarawaci.com"
            className="text-accent hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-accent rounded"
          >
            blog@supermalkarawaci.com
          </a>
        </p>
      </motion.div>
    </motion.section>
  );
}