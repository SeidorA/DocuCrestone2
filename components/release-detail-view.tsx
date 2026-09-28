'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ReleasesSidebar } from '@/components/releases-sidebar';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ProductConfig, ReleaseNoteItem } from '@/portal.config';
import { NavigationItem, FlatDocItem } from '@/lib/api';
import { useLanguage, Locale } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';
import { FeatureSlider, SlideFeatureItem } from '@/components/feature-slider';
import { Button } from 'caralstable';

interface ActionFeatureItem {
  id: string;
  title: string;
  description?: string;
  pngUrl?: string;
  icon?: string;
  highlights?: (string | any)[];
}

interface ReleaseDetailViewProps {
  versionParam: string;
  config: ProductConfig;
  navigation: NavigationItem[];
  flatDocs: FlatDocItem[];
}

export function ReleaseDetailView({
  versionParam,
  config,
  navigation,
  flatDocs,
}: ReleaseDetailViewProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'action' | 'slider'>('action');

  const releases: ReleaseNoteItem[] = config.releases || [];

  const normalizeVer = (v: string | undefined | null) =>
    (v || '').replace(/^v/i, '').trim().toLowerCase();

  // Find the selected release or fallback to first
  const currentRelease = useMemo(() => {
    if (releases.length === 0) return null;
    const found = releases.find(
      (r) =>
        normalizeVer(r.version) === normalizeVer(versionParam) ||
        r.id === versionParam
    );
    return found || releases[0];
  }, [releases, versionParam]);

  const currentVersionNumber = currentRelease
    ? currentRelease.version.replace(/^v/i, '')
    : versionParam.replace(/^v/i, '');

  // Prepare features specifically for Action tab (PNG / JPG static images only)
  const actionFeatures: ActionFeatureItem[] = useMemo(() => {
    if (!currentRelease) return [];

    const rawFeatures =
      currentRelease.features && currentRelease.features.length > 0
        ? currentRelease.features
        : currentRelease.highlights && currentRelease.highlights.length > 0
          ? currentRelease.highlights
          : [];

    if (rawFeatures.length > 0) {
      return rawFeatures.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return {
            id: `feat-action-${idx}`,
            title: item,
            description: '',
            pngUrl: undefined,
            icon: 'magic',
          };
        }

        const title =
          getLocalizedText(
            item?.title_es && item?.title_en
              ? { es: item.title_es, en: item.title_en }
              : item?.title,
            language
          ) || `Feature ${idx + 1}`;

        const description = getLocalizedText(
          item?.description_es && item?.description_en
            ? { es: item.description_es, en: item.description_en }
            : item?.description,
          language
        );

        // For Action tab: ONLY PNG / JPG / static images (excluding GIF)
        const pngUrl =
          item?.pngUrl ||
          item?.png_url ||
          (item?.imageUrl && !item.imageUrl.toLowerCase().endsWith('.gif') ? item.imageUrl : undefined) ||
          (item?.image_url && !item.image_url.toLowerCase().endsWith('.gif') ? item.image_url : undefined);

        const icon =
          item?.icon ||
          item?.icon_name ||
          item?.iconName ||
          item?.iconCaral ||
          item?.icon_caral?.name ||
          'magic';

        return {
          id: item?.id || `feat-action-${idx}`,
          title,
          description,
          pngUrl,
          icon,
          highlights: item?.highlights,
        };
      });
    }

    const latestTitle =
      getLocalizedText(
        currentRelease.title_es && currentRelease.title_en
          ? { es: currentRelease.title_es, en: currentRelease.title_en }
          : currentRelease.title,
        language
      ) || `Release ${currentRelease.version}`;

    const latestDesc = getLocalizedText(
      currentRelease.description_es && currentRelease.description_en
        ? { es: currentRelease.description_es, en: currentRelease.description_en }
        : currentRelease.description,
      language
    );

    return [
      {
        id: currentRelease.id || 'current-release',
        title: latestTitle,
        description: latestDesc,
        pngUrl: undefined,
      },
    ];
  }, [currentRelease, language]);

  // Prepare slides for the Slider tab (GIFs prioritized)
  const featureSlides: SlideFeatureItem[] = useMemo(() => {
    if (!currentRelease) return [];

    const rawFeatures =
      currentRelease.features && currentRelease.features.length > 0
        ? currentRelease.features
        : currentRelease.highlights && currentRelease.highlights.length > 0
          ? currentRelease.highlights
          : [];

    if (rawFeatures.length > 0) {
      return rawFeatures.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return {
            id: `feat-${idx}`,
            title: item,
            description: '',
          };
        }

        const title =
          getLocalizedText(
            item?.title_es && item?.title_en
              ? { es: item.title_es, en: item.title_en }
              : item?.title,
            language
          ) || `Feature ${idx + 1}`;

        const description = getLocalizedText(
          item?.description_es && item?.description_en
            ? { es: item.description_es, en: item.description_en }
            : item?.description,
          language
        );

        // For Slider: GIFs prioritized
        const mediaUrl =
          item?.gifUrl ||
          item?.gif_url ||
          item?.imageUrl ||
          item?.image_url ||
          item?.pngUrl ||
          item?.png_url;

        const icon =
          item?.icon ||
          item?.icon_name ||
          item?.iconName ||
          item?.iconCaral ||
          item?.icon_caral?.name;

        return {
          id: item?.id || `feat-${idx}`,
          title,
          description,
          mediaUrl,
          icon,
        };
      });
    }

    const latestTitle =
      getLocalizedText(
        currentRelease.title_es && currentRelease.title_en
          ? { es: currentRelease.title_es, en: currentRelease.title_en }
          : currentRelease.title,
        language
      ) || `Release ${currentRelease.version}`;

    const latestDesc = getLocalizedText(
      currentRelease.description_es && currentRelease.description_en
        ? { es: currentRelease.description_es, en: currentRelease.description_en }
        : currentRelease.description,
      language
    );

    return [
      {
        id: currentRelease.id || 'current-release',
        title: latestTitle,
        description: latestDesc,
      },
    ];
  }, [currentRelease, language]);

  const handleDownloadPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-full text-neutral-900 dark:text-neutral-100 flex flex-col justify-between font-poppins relative">
      {/* Header */}
      <Header
        config={config}
        navigation={navigation}
        flatDocs={flatDocs}
        showSidebarToggle={true}
        sidebarContent={(onClose) => (
          <ReleasesSidebar
            config={config}
            releases={releases}
            currentVersion={currentVersionNumber}
            onItemClick={onClose}
            isMobileDrawer={true}
          />
        )}
      />

      {/* Content Area with Flex Layout */}
      <div className="w-full flex-1 flex items-start">
        {/* Left Desktop Sidebar with Releases data */}
        <ReleasesSidebar
          config={config}
          releases={releases}
          currentVersion={currentVersionNumber}
        />

        {/* Main Central Content Area */}
        <main className="flex-1 max-w-5xl mx-auto min-w-0 py-8 px-4 sm:px-8 lg:px-12 w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
            <Link
              href="/"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <CaralIcon name="house" size={14} />
            </Link>
            <CaralIcon name="chevronRigth" size={10} />
            <Link
              href="/release-notes"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {t('releases.title', 'Release Notes')}
            </Link>
            <CaralIcon name="chevronRigth" size={10} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info-main/10 text-info-main border border-info-main/20">
              V {currentVersionNumber}
            </span>
          </div>

          {/* Main Version Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
            V {currentVersionNumber}
          </h1>

          {/* Tabs: Action vs Slider */}
          <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
            <button
              onClick={() => setActiveTab('action')}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative ${activeTab === 'action'
                ? 'text-info-main'
                : 'text-neutral-800 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              {t('releases.actionTab', 'Action')}
              {activeTab === 'action' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-info-main rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('slider')}
              className={`pb-3 text-sm sm:text-base font-bold transition-all relative ${activeTab === 'slider'
                ? 'text-info-main'
                : 'text-neutral-800 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
            >
              {t('releases.sliderTab', 'Slider')}
              {activeTab === 'slider' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-info-main rounded-full" />
              )}
            </button>
          </div>

          {/* TAB CONTENT */}
          {!currentRelease ? (
            <div className="text-center py-16 bg-container rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-800">
                {t('releases.noReleases', 'No se encontraron notas de versión.')}
              </p>
            </div>
          ) : activeTab === 'slider' ? (
            /* Slider View */
            <div className="animate-in fade-in duration-200">
              <FeatureSlider
                slides={featureSlides}
                version={currentRelease.version}
                language={language}
                nextLabel={t('releases.next', 'Next')}
                prevLabel={t('releases.prev', 'Prev')}
                className="mb-8"
              />
            </div>
          ) : (
            /* Action View: All features with images stacked */
            <div className="space-y-10 animate-in fade-in duration-200">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-info-main">
                    <CaralIcon name="bolt" size={20} />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                    {t('releases.allFeaturesTitle', 'All the features of this release')}
                  </h2>
                </div>

                <Button
                  onClick={handleDownloadPdf}
                  variant='info'
                  iconName='arrowDownToLine'
                >
                  <span>{t('releases.downloadPdf', 'Download PDF')}</span>
                </Button>

              </div>

              {/* Features List with Rich Static Images (PNG/JPG only) */}
              {actionFeatures.length > 0 ? (
                <div className="space-y-12">
                  {actionFeatures.map((feat, idx) => (
                    <div
                      key={feat.id || idx}
                      className="space-y-4 pb-8 border-b border-neutral-200 dark:border-neutral-800 last:border-0"
                    >
                      {/* Title with icon */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-info-main mt-0.5 shrink-0">
                          <CaralIcon name={(feat.icon as any) || 'magic'} size={18} />
                        </span>
                        <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white">
                          {feat.title}
                        </h3>
                      </div>

                      {/* Description */}
                      {feat.description && (
                        <div className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed pl-7">
                          {feat.description}
                        </div>
                      )}

                      {/* Highlights sub-list */}
                      {feat.highlights && feat.highlights.length > 0 && (
                        <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pl-7">
                          {feat.highlights.map((h: any, hIdx: number) => {
                            const hText =
                              typeof h === 'string'
                                ? h
                                : getLocalizedText(
                                  h?.title_es && h?.title_en
                                    ? { es: h.title_es, en: h.title_en }
                                    : h?.title,
                                  language
                                ) ||
                                getLocalizedText(
                                  h?.description_es && h?.description_en
                                    ? { es: h.description_es, en: h.description_en }
                                    : h?.description,
                                  language
                                ) ||
                                '';
                            return (
                              <li key={hIdx} className="flex items-start gap-2">
                                <span className="text-info-main font-bold">•</span>
                                <span>{hText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Feature Static Preview PNG / JPG Container */}
                      {feat.pngUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 flex justify-center shadow-sm">
                          <img
                            src={feat.pngUrl}
                            alt={feat.title}
                            className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-md"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Markdown Content if available */}
              {currentRelease.content && (
                <div className="pt-6">
                  <MarkdownRenderer
                    content={
                      getLocalizedText(
                        currentRelease.content_es && currentRelease.content_en
                          ? { es: currentRelease.content_es, en: currentRelease.content_en }
                          : currentRelease.content,
                        language
                      ) || ''
                    }
                  />
                </div>
              )}

              {/* Fixes, Improvements, Breaking Changes */}
              {(currentRelease.fixes ||
                currentRelease.improvements ||
                currentRelease.breaking_changes) && (
                  <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    {currentRelease.fixes && currentRelease.fixes.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                          {t('releases.fixes', 'Correcciones de Errores')}
                        </h4>
                        <ReleaseItemList
                          items={currentRelease.fixes}
                          bulletColorClass="text-emerald-500"
                          language={language}
                        />
                      </div>
                    )}

                    {currentRelease.improvements && currentRelease.improvements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                          {t('releases.improvements', 'Mejoras')}
                        </h4>
                        <ReleaseItemList
                          items={currentRelease.improvements}
                          bulletColorClass="text-indigo-500"
                          language={language}
                        />
                      </div>
                    )}

                    {currentRelease.breaking_changes &&
                      currentRelease.breaking_changes.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                            {t('releases.breakingChanges', 'Cambios Importantes')}
                          </h4>
                          <ReleaseItemList
                            items={currentRelease.breaking_changes}
                            bulletColorClass="text-red-500"
                            language={language}
                          />
                        </div>
                      )}
                  </div>
                )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="mt-16">
        <Footer config={config} />
      </div>
    </div>
  );
}

interface ReleaseItemListProps {
  items: (string | any)[];
  bulletColorClass: string;
  language: Locale;
}

function ReleaseItemList({ items, bulletColorClass, language }: ReleaseItemListProps) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
      {items.map((item, idx) => {
        if (typeof item === 'string') {
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className={`${bulletColorClass} font-bold mt-0.5`}>•</span>
              <span>{item}</span>
            </li>
          );
        }

        const title = getLocalizedText(
          item?.title_es && item?.title_en
            ? { es: item.title_es, en: item.title_en }
            : item?.title,
          language
        );

        const desc = getLocalizedText(
          item?.description_es && item?.description_en
            ? { es: item.description_es, en: item.description_en }
            : item?.description,
          language
        );

        return (
          <li key={item?.id || idx} className="flex items-start gap-2">
            <span className={`${bulletColorClass} font-bold mt-0.5`}>•</span>
            <div>
              {title && (
                <span className="font-semibold text-neutral-900 dark:text-white mr-1.5">
                  {title}
                </span>
              )}
              {desc && <span className="text-neutral-600 dark:text-neutral-300">{desc}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
