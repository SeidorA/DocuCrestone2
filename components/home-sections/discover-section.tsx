'use client';

import React from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { DiscoverCardItem, HomeSectionConfig, ProductConfig } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface DiscoverSectionProps {
  section: HomeSectionConfig;
  config: ProductConfig;
}

export function DiscoverSection({ section, config }: DiscoverSectionProps) {
  const { language, t } = useLanguage();

  const title =
    (language === 'es' ? config.discoverTitle_es : config.discoverTitle_en) ||
    config.discoverTitle ||
    getLocalizedText(section.title, language) ||
    `Discover ${getLocalizedText(config.title, language)}`;

  const items: DiscoverCardItem[] =
    section.items || config.discoverItems || [];

  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto w-full px-2 sm:px-4 py-6 mb-16 text-left">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const itemTitle = getLocalizedText(item.title, language);
          const itemDesc = getLocalizedText(item.description, language);
          const href = item.href || '/documentation';
          const hazImages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
          const hazImg = hazImages[idx % hazImages.length];

          return (
            <Link
              key={`${item.title}-${idx}`}
              href={href}
              className="group block rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-info-main/40 flex flex-col"
            >
              {/* Gradient Header with Haz Background Image */}
              <div
                className="h-28 w-full bg-cover bg-center flex items-center justify-center relative overflow-hidden"
                style={{ backgroundImage: `url('/haz/${hazImg}.png')` }}
              >
                {/* Soft ambient blur circle */}
                <div className="absolute w-20 h-20 bg-neutral-100/60 backdrop-blur-xs rounded-full" />
                <div className="relative z-10 text-seidor-hard  group-hover:text-info-main transition-colors transform group-hover:scale-110 duration-200">
                  <CaralIcon name={(item.icon || 'cubeInCube') as any} size={36} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-start">
                <h3 className="font-bold text-base text-info-main  mb-2 group-hover:underline">
                  {itemTitle}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                  {itemDesc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
