'use client';

import React from 'react';
import { HomeSectionConfig, ProductConfig } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface DescriptionSectionProps {
  section: HomeSectionConfig;
  config: ProductConfig;
}

export function DescriptionSection({ section, config }: DescriptionSectionProps) {
  const { language } = useLanguage();

  const title =
    (language === 'es' ? config.indexTitle_es : config.indexTitle_en) ||
    config.indexTitle ||
    getLocalizedText(section.title, language) ||
    `${getLocalizedText(config.title, language)} Docs`;

  const descriptionRaw =
    (language === 'es' ? config.indexDescription_es : config.indexDescription_en) ||
    config.indexDescription ||
    section.description ||
    config.description ||
    '';
  const localizedDescription = getLocalizedText(descriptionRaw, language);

  // Split description by newlines for clean paragraph formatting if applicable
  const paragraphs = localizedDescription
    ? localizedDescription.split('\n\n').filter(Boolean)
    : [];

  return (
    <section className="max-w-5xl mx-auto w-full px-2 sm:px-4 py-6 mb-12 text-left">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
        {title}
      </h2>

      {paragraphs.length > 0 ? (
        <div className="space-y-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
          {paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
          {localizedDescription}
        </p>
      )}
    </section>
  );
}
