'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { HomeSectionConfig, ProductConfig, ProductFaqItem } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface FaqHomeSectionProps {
  section: HomeSectionConfig;
  config: ProductConfig;
}

export function FaqHomeSection({ section, config }: FaqHomeSectionProps) {
  const { language, t } = useLanguage();
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});

  const title =
    getLocalizedText(section.title, language) ||
    t('faq.title', 'Frequently asked questions');

  const subtitle =
    getLocalizedText(section.subtitle, language) ||
    t(
      'faq.homeSubtitle',
      "Welcome to the FAQ section! We've compiled answers to the most common questions so you can find information quickly."
    );

  const exploreText =
    getLocalizedText(section.exploreText, language) ||
    t(
      'faq.homeExploreText',
      'If you want to explore all the questions, go to this link. Where you will find all the answers made by the users.'
    );

  const exploreLink = section.exploreLink || '/documentation';

  const items: ProductFaqItem[] =
    section.items || config.faq || [];

  const toggleItem = (idx: number) => {
    setOpenIds((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (!items || items.length === 0) return null;

  return (
    <div className='bg-container'>
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Heading & Explanatory copy */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-4">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              {subtitle}
            </p>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed">
              {exploreText.includes('go to this link') ? (
                <>
                  {exploreText.split('go to this link')[0]}
                  <Link
                    href={exploreLink}
                    className="text-info-main dark:text-sky-400 font-semibold underline hover:opacity-80 transition-opacity"
                  >
                    {t('faq.goToThisLink', 'go to this link')}
                  </Link>
                  {exploreText.split('go to this link')[1]}
                </>
              ) : (
                <Link
                  href={exploreLink}
                  className="text-info-main dark:text-sky-400 font-semibold underline hover:opacity-80 transition-opacity"
                >
                  {exploreText}
                </Link>
              )}
            </p>
          </div>

          {/* Right Column: Accordion Q&A */}
          <div className="lg:col-span-8 divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.map((item, idx) => {
              const isOpen = Boolean(openIds[idx]);
              const q =
                (language === 'es' ? item.question_es : item.question_en) ||
                getLocalizedText(item.question, language);
              const a =
                (language === 'es' ? item.answer_es : item.answer_en) ||
                getLocalizedText(item.answer, language);

              return (
                <div key={`${item.question}-${idx}`} className="py-4 sm:py-5 first:pt-0 last:pb-0 border-b border-neutral-800">
                  <button
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className="w-full flex items-center justify-between gap-4  py-2 text-left group"
                  >
                    <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 group-hover:text-info-main dark:group-hover:text-sky-400 transition-colors">
                      {q}
                    </span>
                    <div className="text-neutral-900 group-hover:text-info-main shrink-0 transition-transform duration-200">
                      <CaralIcon
                        name={isOpen ? 'chevronUp' : 'chevronDown'}
                        size={18}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed animate-fade-in pl-1">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
