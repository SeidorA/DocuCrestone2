'use client';

import React, { useState, useMemo } from 'react';
import { CaralIcon } from 'iconcaral2';
import { ProductFaqItem } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

export interface FaqAccordionProps {
  items?: ProductFaqItem[];
  title?: string;
  description?: string;
  allowMultiple?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  className?: string;
}

export function FaqAccordion({
  items = [],
  title,
  description,
  allowMultiple = false,
  showSearch = true,
  showCategories = true,
  className = '',
}: FaqAccordionProps) {
  const { language, t } = useLanguage();
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // Open first by default
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const localizedFaqs = useMemo(() => {
    return (items || []).map((item, idx) => {
      const q =
        item.question_es && language === 'es'
          ? item.question_es
          : item.question_en && language === 'en'
          ? item.question_en
          : getLocalizedText(item.question, language);

      const a =
        item.answer_es && language === 'es'
          ? item.answer_es
          : item.answer_en && language === 'en'
          ? item.answer_en
          : getLocalizedText(item.answer, language);

      const cat = item.category ? getLocalizedText(item.category, language) : undefined;

      return {
        id: item.id || `faq-${idx}`,
        question: q,
        answer: a,
        category: cat || 'General',
        originalIndex: idx,
      };
    });
  }, [items, language]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    localizedFaqs.forEach((faq) => {
      if (faq.category) cats.add(faq.category);
    });
    return Array.from(cats);
  }, [localizedFaqs]);

  const filteredFaqs = useMemo(() => {
    return localizedFaqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'ALL' || faq.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    });
  }, [localizedFaqs, selectedCategory, searchQuery]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  if (!items || items.length === 0) return null;

  const displayTitle = title ? getLocalizedText(title, language) : t('faq.title', 'Preguntas Frecuentes');
  const displayDesc = description
    ? getLocalizedText(description, language)
    : t('faq.subtitle', 'Encuentra respuestas rápidas a las dudas comunes sobre el producto y su documentación.');

  return (
    <div className={`w-full my-8 font-poppins not-prose ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-info-main/10 text-info-main">
            <CaralIcon name="circleInfo" size={24} />
          </div>
          <span>{displayTitle}</span>
        </h2>
        {displayDesc && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      {(showSearch || (showCategories && categories.length > 1)) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          {/* Category Chips */}
          {showCategories && categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-info-main text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {t('faq.allCategories', 'Todas')} ({localizedFaqs.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-info-main text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Search Box */}
          {showSearch && (
            <div className="relative min-w-[220px] sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <CaralIcon name="search" size={14} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchPlaceholder', 'Buscar en preguntas frecuentes...')}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-container border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-info-main transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <CaralIcon name="x" size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAQ Items List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(faq.originalIndex);

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-info-main/40 dark:border-info-main/40 bg-container shadow-sm'
                    : 'border-neutral-200/90 dark:border-neutral-800 bg-container hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.originalIndex)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 pr-4">
                    <div
                      className={`mt-0.5 sm:mt-0 p-1.5 rounded-lg shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-info-main text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <CaralIcon name="circleInfo" size={15} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                      <span className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug">
                        {faq.question}
                      </span>
                      {faq.category && faq.category !== 'General' && (
                        <span className="self-start sm:self-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60">
                          {faq.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`shrink-0 p-1 rounded-full text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-info-main dark:text-info-main' : ''
                    }`}
                  >
                    <CaralIcon name="chevronDown" size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="pt-3.5 space-y-2 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30">
          <CaralIcon name="search" size={28} classname="text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('faq.noResults', 'No se encontraron preguntas frecuentes.')}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-semibold text-info-main hover:underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
