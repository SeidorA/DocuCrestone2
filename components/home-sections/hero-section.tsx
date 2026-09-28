'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'caralstable';
import { CaralIcon } from 'iconcaral2';
import { HomeSectionConfig, ProductConfig } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface HeroSectionProps {
  section: HomeSectionConfig;
  config: ProductConfig;
  onOpenSearch?: () => void;
}

export function HeroSection({ section, config, onOpenSearch }: HeroSectionProps) {
  const { language, t } = useLanguage();

  const headline =
    getLocalizedText(section.headline, language) ||
    t('home.getStartedNow', 'Get started now');

  const title =
    getLocalizedText(section.title, language) ||
    t('home.helpCenter', 'Help Center');

  const heroImage =
    section.image ||
    (config.coverImages && config.coverImages.length > 0 ? config.coverImages[0] : undefined);


  return (
    <section className="relative w-full overflow-hidden bg-seidor-main text-white py-12 sm:py-16 md:py-20 px-6 sm:px-10 mb-12">
      {/* Ambient glowing radial effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-[30px]! pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className={`max-w-5xl mx-auto ${heroImage ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center' : 'flex flex-col items-start max-w-4xl'} relative z-10`}>
        {/* Left Column: Headline & Title & Action */}
        <div className={`${heroImage ? 'lg:col-span-6' : 'w-full'} flex flex-col justify-center text-left`}>
          <span className="text-info-main text-sm sm:text-base md:text-lg font-semibold tracking-wide mb-2 block">
            {headline}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6">
            {title}
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
            {getLocalizedText(section.description || config.description || config.tagline, language) ||
              t(
                'home.heroDescription',
                'Explore guides, technical documentation, architectural references and live integrations to power your data pipelines.'
              )}
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Link href={section.ctaLink || '/documentation'}>
              <Button
                variant="info"
                iconName="book"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold shadow-lg shadow-cyan-500/25 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 border-0"
              >
                <span>{section.ctaText || t('home.exploreDocs', 'Explore Documentation')}</span>
                <CaralIcon name="arrowRight" size={16} />
              </Button>
            </Link>

            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-200 text-xs sm:text-sm font-medium transition-colors"
              >
                <CaralIcon name="search" size={14} />
                <span>{t('search.placeholder', 'Search docs...')}</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-white/10 font-mono text-neutral-300">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>
        </div>


      </div>
      {/* Right Column: Configurable Hero Image */}
      {heroImage && (
        <div className="absolute z-0 pointer-events-none"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            right: 0
          }}
        >
          <div className={`relative hidden md:flex lg:flex items-center justify-center ${section.imagesize || section.imageSize || ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={section.imageAlt || title}
              className="w-full h-auto max-h-[360px] object-contain drop-shadow-2xl select-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
