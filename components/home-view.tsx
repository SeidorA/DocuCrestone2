'use client';

import React from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import {
  ProductConfig,
  HomeSectionConfig,
  footer as layoutFooter,
  HomeSectionItem,
} from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { NavigationItem, DocumentItem, flattenNavigation } from '@/lib/api';
import { DocIndex } from '@/components/doc-index';
import {
  HeroSection,
  DescriptionSection,
  DiscoverSection,
  ConnectionsSection,
  FaqHomeSection,
} from '@/components/home-sections';

interface HomeViewProps {
  config: ProductConfig;
  navigation?: NavigationItem[];
  documents?: DocumentItem[];
}

export function HomeView({ config, navigation = [], documents = [] }: HomeViewProps) {
  const { language, t } = useLanguage();

  const flatDocs = React.useMemo(() => {
    return flattenNavigation(navigation);
  }, [navigation]);

  const localizedTitle = getLocalizedText(config.title, language);

  // Active sections configured directly in config.homeSections
  const sectionsToRender: HomeSectionItem[] =
    config.homeSections && config.homeSections.length > 0
      ? config.homeSections
      : [
          'Hero',
          'Description',
          'Discover',
          'Faq',
        ];

  const getSectionConfig = (type: string): HomeSectionConfig => {
    const existing = config.homeSections?.find((s) => s.type?.toLowerCase() === type.toLowerCase());
    return existing || { id: type, type: type as any, enabled: true };
  };

  const renderSectionItem = (item: HomeSectionItem, index: number) => {
    if (!item) return null;

    // 1. Direct React Component / Function passed in portal.config.ts
    if (typeof item === 'function') {
      const CustomComponent = item;
      return (
        <CustomComponent
          key={`custom-section-${index}`}
          config={config}
          navigation={navigation}
          documents={documents}
        />
      );
    }

    // 2. String identifier (e.g. 'Hero', 'Description', 'Discover', 'Faq', 'Connections', 'Index', 'Features')
    if (typeof item === 'string') {
      const typeKey = item.toLowerCase().trim();

      switch (typeKey) {
        case 'hero':
          return (
            <HeroSection
              key={`hero-${index}`}
              section={getSectionConfig('hero')}
              config={config}
            />
          );

        case 'description':
          return (
            <DescriptionSection
              key={`desc-${index}`}
              section={getSectionConfig('description')}
              config={config}
            />
          );

        case 'discover':
          return (
            <DiscoverSection
              key={`discover-${index}`}
              section={getSectionConfig('discover')}
              config={config}
            />
          );

        case 'connections':
        case 'connection':
          return (
            <ConnectionsSection
              key={`conn-${index}`}
              section={getSectionConfig('connections')}
              config={config}
            />
          );

        case 'faq':
        case 'faqs':
          return (
            <FaqHomeSection
              key={`faq-${index}`}
              section={getSectionConfig('faq')}
              config={config}
            />
          );

        case 'index':
        case 'docindex':
        case 'docs':
          return (
            <div
              key={`index-${index}`}
              className="max-w-6xl mx-auto w-full px-4 mb-16"
            >
              <DocIndex
                navigation={navigation}
                allDocs={documents}
                title={getLocalizedText(config.indexTitle || 'Documentation', language)}
                description={getLocalizedText(config.indexDescription || '', language)}
                showStats={true}
              />
            </div>
          );

        case 'features':
          if (!config.features || config.features.length === 0) return null;
          return (
            <section
              key={`features-${index}`}
              className="max-w-5xl mx-auto w-full px-4 mb-16"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 text-left">
                {t('home.features', 'Core Features')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
                {config.features.map((feature, idx) => {
                  const hazImages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
                  const hazImg = hazImages[idx % hazImages.length];

                  return (
                    <div
                      key={`${feature.title}-${idx}`}
                      className="p-5 rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-xl bg-cover bg-center text-white flex items-center justify-center mb-3 shadow-sm overflow-hidden"
                        style={{ backgroundImage: `url('/haz/${hazImg}.png')` }}
                      >
                        <CaralIcon name={feature.icon as any} size={20} />
                      </div>
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                        {getLocalizedText(feature.title, language)}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {getLocalizedText(feature.description, language)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );

        default:
          return null;
      }
    }

    // 3. Object configuration (HomeSectionConfig)
    if (typeof item === 'object') {
      const section = item as any;
      if (section.enabled === false) return null;

      if (section.component) {
        const Comp = section.component;
        return (
          <Comp
            key={section.id || `custom-obj-${index}`}
            section={section}
            config={config}
            navigation={navigation}
            documents={documents}
          />
        );
      }

      const typeKey = (section.type || '').toLowerCase().trim();

      switch (typeKey) {
        case 'hero':
          return (
            <HeroSection
              key={section.id || `hero-${index}`}
              section={section}
              config={config}
            />
          );

        case 'description':
          return (
            <DescriptionSection
              key={section.id || `desc-${index}`}
              section={section}
              config={config}
            />
          );

        case 'discover':
          return (
            <DiscoverSection
              key={section.id || `discover-${index}`}
              section={section}
              config={config}
            />
          );

        case 'connections':
          return (
            <ConnectionsSection
              key={section.id || `conn-${index}`}
              section={section}
              config={config}
            />
          );

        case 'faq':
          return (
            <FaqHomeSection
              key={section.id || `faq-${index}`}
              section={section}
              config={config}
            />
          );

        case 'index':
          return (
            <div
              key={section.id || `index-${index}`}
              className="max-w-6xl mx-auto w-full px-4 mb-16"
            >
              <DocIndex
                navigation={navigation}
                allDocs={documents}
                title={getLocalizedText(section.title, language)}
                description={getLocalizedText(section.subtitle, language)}
                showStats={section.showIsometricGraphic}
              />
            </div>
          );

        case 'features':
          if (!config.features || config.features.length === 0) return null;
          return (
            <section
              key={section.id || `features-${index}`}
              className="max-w-5xl mx-auto w-full px-4 mb-16"
            >
              {section.title && (
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 text-left">
                  {getLocalizedText(section.title, language)}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
                {config.features.map((feature, idx) => {
                  const hazImages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
                  const hazImg = hazImages[idx % hazImages.length];

                  return (
                    <div
                      key={`${feature.title}-${idx}`}
                      className="p-5 rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-xl bg-cover bg-center text-white flex items-center justify-center mb-3 shadow-sm overflow-hidden"
                        style={{ backgroundImage: `url('/haz/${hazImg}.png')` }}
                      >
                        <CaralIcon name={feature.icon as any} size={20} />
                      </div>
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                        {getLocalizedText(feature.title, language)}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {getLocalizedText(feature.description, language)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );

        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-full text-neutral-900 flex flex-col justify-between font-poppins relative selection:bg-cyan-500/20">
      {/* Top Header / Navbar */}
      <Header
        config={config}
        navigation={navigation}
        flatDocs={flatDocs}
        showSidebarToggle={false}
      />

      {/* Main Dynamic Sections Container */}
      <main className="w-full">
        {sectionsToRender.map((sec, idx) => renderSectionItem(sec, idx))}
      </main>

      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}

