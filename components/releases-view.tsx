'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductConfig, ReleaseNoteItem } from '@/portal.config';
import { NavigationItem, FlatDocItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

import { FeatureSlider, SlideFeatureItem } from '@/components/feature-slider';

interface ReleasesViewProps {
  config: ProductConfig;
  navigation: NavigationItem[];
  flatDocs: FlatDocItem[];
}

export function ReleasesView({ config, navigation, flatDocs }: ReleasesViewProps) {
  const { language, t } = useLanguage();

  const releases: ReleaseNoteItem[] = config.releases || [];
  const latestRelease = releases[0];

  // Localized page title & description
  const pageTitle =
    config.releaseNotesConfig?.title ||
    t('releases.title', 'Release Notes');
  const pageDescription =
    config.releaseNotesConfig?.description ||
    t(
      'releases.subtitle',
      'Stay up to date with the latest improvements, features, and fixes in Crestone. This section provides a chronological overview of all platform updates, helping you track changes across versions and understand how each release enhances functionality, performance, and stability.'
    );

  // Prepare slides from the features of the latest release
  const featureSlides: SlideFeatureItem[] = useMemo(() => {
    if (!latestRelease) return [];

    const rawFeatures =
      (latestRelease.features && latestRelease.features.length > 0)
        ? latestRelease.features
        : (latestRelease.highlights && latestRelease.highlights.length > 0)
          ? latestRelease.highlights
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

        const mediaUrl =
          item?.gifUrl ||
          item?.pngUrl ||
          item?.imageUrl ||
          item?.image_url ||
          item?.gif_url ||
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

    // Fallback if latest release has no individual feature items:
    // Render the latest release summary as the single slide
    const latestTitle =
      getLocalizedText(
        latestRelease.title_es && latestRelease.title_en
          ? { es: latestRelease.title_es, en: latestRelease.title_en }
          : latestRelease.title,
        language
      ) || `Release ${latestRelease.version}`;

    const latestDesc = getLocalizedText(
      latestRelease.description_es && latestRelease.description_en
        ? { es: latestRelease.description_es, en: latestRelease.description_en }
        : latestRelease.description,
      language
    );

    return [
      {
        id: latestRelease.id || 'latest-release',
        title: latestTitle,
        description: latestDesc,
      },
    ];
  }, [latestRelease, language]);

  return (
    <div className="min-h-screen bg-full text-neutral-900 dark:text-neutral-100 flex flex-col justify-between font-poppins relative">
      {/* Header Navbar */}
      <Header
        config={config}
        navigation={navigation}
        flatDocs={flatDocs}
        showSidebarToggle={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-800 mb-4">
          <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <CaralIcon name="house" />
          </Link>
          <CaralIcon name="chevronRigth" />
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">{pageTitle}</span>
        </div>

        {/* Page Main Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-8">
          {pageTitle}
        </h1>

        {releases.length === 0 ? (
          <div className="text-center py-16 bg-container rounded-2xl border border-neutral-300 dark:border-neutral-800">
            <div className="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <CaralIcon name="clock" size={24} />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {t('releases.noReleases', 'No se encontraron notas de versión.')}
            </p>
          </div>
        ) : (
          <>
            {/* Top Featured Slider with Latest Release Features */}
            {featureSlides.length > 0 && (
              <FeatureSlider
                slides={featureSlides}
                version={latestRelease?.version || config.version}
                language={language}
                nextLabel={t('releases.next', 'Next')}
                prevLabel={t('releases.prev', 'Prev')}
                className="mb-12"
              />
            )}

            {/* Section Header: Release Notes Overview */}
            <div className="mb-8">
              <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">
                {pageTitle}
              </h2>
              <p className="text-neutral-900 leading-relaxed">
                {pageDescription}
              </p>
            </div>

            {/* List of Version Cards */}
            <div className="space-y-4">
              {releases.map((rel, index) => {
                const relId = rel.id || rel.version || `rel-${index}`;

                const title = getLocalizedText(
                  rel.title_es && rel.title_en
                    ? { es: rel.title_es, en: rel.title_en }
                    : rel.title,
                  language
                );
                const desc = getLocalizedText(
                  rel.description_es && rel.description_en
                    ? { es: rel.description_es, en: rel.description_en }
                    : rel.description,
                  language
                );

                const bgNum = (index % 7) + 1;
                const verStr = rel.version.replace(/^v/i, '');

                return (
                  <div
                    key={relId}
                    className="bg-container border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex sm:flex-col md:flex-row items-stretch"
                  >
                    {/* Left Box: Pastel Gradient with Bold Version Number Linking to Version Page */}
                    <Link
                      href={`/release-notes/${encodeURIComponent(verStr)}`}
                      className="sm:w-full md:w-64 lg:w-72 shrink-0 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group transition-transform"
                      style={{
                        backgroundImage: `url(/haz/bg-${bgNum}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      title={`V ${verStr}`}
                    >
                      <span className="text-2xl sm:text-3xl font-extrabold text-seidor-main tracking-tight group-hover:scale-105 transition-transform">
                        V. {verStr}
                      </span>
                    </Link>

                    {/* Right Box: Date, Description & Ver más */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                      <div>
                        {/* Released Date */}
                        {(rel.date || rel.release_date) && (
                          <span className="text-xs text-neutral-800 font-medium mb-1.5 block">
                            {t('releases.releasedOn', 'Released on')}{' '}
                            {rel.date || rel.release_date}
                          </span>
                        )}

                        {/* Summary / Description */}
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {desc || title}
                        </p>
                      </div>

                      {/* Ver más Link */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          href={`/release-notes/${encodeURIComponent(verStr)}`}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B132B] dark:bg-[#07112B] hover:bg-[#152349] dark:hover:bg-[#13224F] text-white transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{t('releases.readMore', 'Ver más')}</span>
                          <CaralIcon name="chevronRigth" size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next Navigation */}
            {releases.length > 0 && (
              <div className="flex justify-end pt-10 border-t border-neutral-200 dark:border-neutral-800 mt-12">
                <Link href="/documentation" className="group flex flex-col items-end text-right">
                  <span className="text-xs text-neutral-400 font-medium">
                    {t('releases.next', 'Next')}
                  </span>
                  <span className="text-sm font-semibold text-info-main group-hover:underline flex items-center gap-1">
                    V {releases[0].version.replace(/^v/i, '')} »
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}

