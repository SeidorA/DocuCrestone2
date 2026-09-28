'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationItem, DocumentItem, getSectionIndexDoc } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText, getLocalizedItemTitle } from '@/lib/utils';
import { DynamicIcon } from './icon-helper';

interface SectionGridProps {
  items: NavigationItem[];
  allDocs?: DocumentItem[];
  title?: string;
  description?: string;
}

export function SectionGrid({
  items,
  allDocs = [],
  title,
  description,
}: SectionGridProps) {
  const { language, t } = useLanguage();

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full my-8 font-poppins">
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-1">
              {getLocalizedText(title, language)}
            </h2>
          )}
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {getLocalizedText(description, language)}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {items.map((item, idx) => {
          const isSection =
            item.type === 'section' ||
            Boolean(item.items && item.items.length > 0 && !item.slug);
          const indexDoc = getSectionIndexDoc(item);

          // Find effective slug
          const targetSlug =
            indexDoc?.slug ||
            item.slug ||
            (item.items && item.items.length > 0 ? item.items[0].slug : '') ||
            item.id;

          const targetHref = `/documentation/${targetSlug}`;

          // Find description in full documents list if available
          const matchingDoc = allDocs.find(
            (d) => d.slug === targetSlug || d.id === item.id
          );
          const itemDescription = matchingDoc?.description_es || matchingDoc?.description_en || matchingDoc?.description;

          // Icon fallback logic: if item has no icon or generic file, fallback to 'book'
          const rawIcon =
            item.icon_name ||
            indexDoc?.icon_name ||
            matchingDoc?.icon_name;
          const effectiveIcon =
            rawIcon && rawIcon.trim().length > 0 && rawIcon !== 'file'
              ? rawIcon
              : 'book';

          // Background image from public/haz/bg-1.png to bg-7.png
          const bgIndex = (idx % 7) + 1;
          const bgUrl = `/haz/bg-${bgIndex}.png`;

          const displayTitle = getLocalizedItemTitle(item, language);

          return (
            <Link
              key={item.id || idx}
              href={targetHref}
              className="group relative flex flex-col rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-container overflow-hidden shadow-xs hover:shadow-lg hover:border-info-main/40 dark:hover:border-info-main/40 transition-all duration-300 hover:-translate-y-1 no-underline"
            >
              {/* Card Header with Glowing Background Image & Centered Icon */}
              <div
                className="w-full h-32 sm:h-36 relative flex items-center justify-center bg-cover bg-center overflow-hidden border-b border-neutral-100 dark:border-neutral-800/80"
                style={{ backgroundImage: `url(${bgUrl})` }}
              >
                {/* Soft dark mode overlay for ideal contrast */}
                <div className="absolute inset-0 bg-neutral-900/0 dark:bg-neutral-950/25 transition-colors" />

                <div className="relative z-10 text-[#07153A] dark:text-white transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                  <DynamicIcon
                    name={effectiveIcon}
                    size={42}
                    className="drop-shadow-xs"
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col p-5 bg-container">
                <h3 className="text-base sm:text-lg font-bold text-info-main line-clamp-1 group-hover:text-info-main/90 transition-colors">
                  {displayTitle}
                </h3>

                {itemDescription ? (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                    {getLocalizedText(itemDescription, language)}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                    {isSection
                      ? t('docs.exploreSection', 'Explora las opciones y guías de esta sección.')
                      : t('docs.readDocument', 'Guía y documentación técnica detallada.')}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
