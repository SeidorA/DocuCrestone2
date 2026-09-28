'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CaralIcon, Brand } from 'iconcaral2';
import { NavigationItem, DocumentItem, getSectionIndexDoc, flattenNavigation } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText, getLocalizedItemTitle, calculateReadingTime } from '@/lib/utils';
import { DynamicIcon } from './icon-helper';

export interface DocIndexProps {
  navigation: NavigationItem[];
  allDocs?: DocumentItem[];
  title?: string;
  description?: string;
  showStats?: boolean;
  className?: string;
}

export function DocIndex({
  navigation = [],
  allDocs = [],
  title,
  description,
  showStats = true,
  className = '',
}: DocIndexProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('ALL');

  // Top level modules
  const modules = navigation;

  // Flattened documents list with localized data
  const flatDocs = useMemo(() => {
    return flattenNavigation(navigation);
  }, [navigation]);

  // Filter modules
  const activeModules = useMemo(() => {
    if (selectedModuleId === 'ALL') return modules;
    return modules.filter((m) => m.id === selectedModuleId);
  }, [modules, selectedModuleId]);

  // Count total stats
  const stats = useMemo(() => {
    let sectionsCount = 0;
    const countSections = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.type === 'section' || (item.items && item.items.length > 0)) {
          sectionsCount++;
        }
        if (item.items) {
          countSections(item.items);
        }
      }
    };
    countSections(navigation);

    return {
      totalDocs: flatDocs.length,
      totalSections: sectionsCount,
      totalModules: modules.length,
    };
  }, [navigation, flatDocs]);

  const displayTitle = title ? getLocalizedText(title, language) : t('index.title', 'Índice de Documentación');
  const displayDesc = description
    ? getLocalizedText(description, language)
    : t('index.subtitle', 'Explora todos los módulos, secciones y guías técnicas disponibles.');

  return (
    <div className={`w-full my-8 font-poppins not-prose ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-info-main/10 text-info-main">
            <CaralIcon name="folder" size={24} />
          </div>
          <span>{displayTitle}</span>
        </h2>
        {displayDesc && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Stats Cards Bar */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-container border border-neutral-200/90 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-info-main/10 text-info-main flex items-center justify-center shrink-0">
              <CaralIcon name="file" size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalDocs}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('index.documentsCount', 'documentos')}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-container border border-neutral-200/90 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CaralIcon name="folder" size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalSections}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('index.sectionsCount', 'secciones')}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-container border border-neutral-200/90 dark:border-neutral-800 shadow-xs hidden sm:flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CaralIcon name="cubeInCube" size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalModules}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('index.allModules', 'Módulos')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar: Module Selector & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center justify-between">
        {/* Module Switcher Tabs */}
        {modules.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedModuleId('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                selectedModuleId === 'ALL'
                  ? 'bg-info-main text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {t('index.allModules', 'Todos los módulos')}
            </button>
            {modules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModuleId(mod.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  selectedModuleId === mod.id
                    ? 'bg-info-main text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {getLocalizedItemTitle(mod, language)}
              </button>
            ))}
          </div>
        )}

        {/* Search Filter */}
        <div className="relative min-w-[240px] sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <CaralIcon name="search" size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('index.searchPlaceholder', 'Filtrar documentos por título o tema...')}
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
      </div>

      {/* Directory Sections Grid */}
      <div className="space-y-10">
        {activeModules.map((mod, modIdx) => {
          const modItems = mod.items || [];
          const modTitle = getLocalizedItemTitle(mod, language);

          // If searching, filter module items
          const matchingItems = modItems.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const itemTitle = getLocalizedItemTitle(item, language).toLowerCase();
            const childMatches = (item.items || []).some((c) =>
              getLocalizedItemTitle(c, language).toLowerCase().includes(q)
            );
            return itemTitle.includes(q) || childMatches;
          });

          if (matchingItems.length === 0 && searchQuery.trim()) {
            return null;
          }

          return (
            <div key={mod.id || modIdx} className="space-y-4">
              {modules.length > 1 && (
                <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <CaralIcon name="cubeInCube" size={18} classname="text-info-main" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {modTitle}
                  </h3>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {matchingItems.map((item, idx) => {
                  const isSection =
                    item.type === 'section' ||
                    Boolean(item.items && item.items.length > 0 && !item.slug);
                  const indexDoc = getSectionIndexDoc(item);

                  const targetSlug =
                    indexDoc?.slug ||
                    item.slug ||
                    (item.items && item.items.length > 0 ? item.items[0].slug : '') ||
                    item.id;

                  const targetHref = `/documentation/${targetSlug}`;

                  const matchingDoc = allDocs.find(
                    (d) => d.slug === targetSlug || d.id === item.id
                  );
                  const rawDesc =
                    matchingDoc?.description_es ||
                    matchingDoc?.description_en ||
                    matchingDoc?.description;
                  const itemDescription = rawDesc ? getLocalizedText(rawDesc, language) : '';

                  const rawIcon =
                    item.icon_name || indexDoc?.icon_name || matchingDoc?.icon_name;
                  const effectiveIcon =
                    rawIcon && rawIcon.trim().length > 0 && rawIcon !== 'file'
                      ? rawIcon
                      : 'book';

                  const childDocs = item.items
                    ? item.items.filter(
                        (c, cIdx) => !(cIdx === 0 && indexDoc && c.id === indexDoc.id)
                      )
                    : [];

                  const bgIndex = ((modIdx * 3 + idx) % 7) + 1;
                  const bgUrl = `/haz/bg-${bgIndex}.png`;
                  const itemTitle = getLocalizedItemTitle(item, language);

                  return (
                    <div
                      key={item.id || idx}
                      className="group flex flex-col rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-container overflow-hidden shadow-xs hover:shadow-md hover:border-info-main/40 dark:hover:border-info-main/40 transition-all duration-200"
                    >
                      {/* Card Header with Glowing Background Image */}
                      <Link
                        href={targetHref}
                        className="w-full h-28 relative flex items-center justify-center bg-cover bg-center overflow-hidden border-b border-neutral-100 dark:border-neutral-800/80 no-underline"
                        style={{ backgroundImage: `url(${bgUrl})` }}
                      >
                        <div className="absolute inset-0 bg-neutral-900/0 dark:bg-neutral-950/25 transition-colors" />
                        <div className="relative z-10 text-[#07153A] dark:text-white transition-transform duration-300 group-hover:scale-110">
                          <DynamicIcon name={effectiveIcon} size={36} />
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <Link href={targetHref} className="no-underline">
                            <h4 className="text-base font-bold text-info-main group-hover:text-info-main/90 transition-colors line-clamp-1">
                              {itemTitle}
                            </h4>
                          </Link>

                          {itemDescription ? (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {itemDescription}
                            </p>
                          ) : (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {isSection
                                ? t('docs.exploreSection', 'Explora las opciones y guías de esta sección.')
                                : t('docs.readDocument', 'Guía y documentación técnica detallada.')}
                            </p>
                          )}
                        </div>

                        {/* Child Articles List if any */}
                        {childDocs.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                              {childDocs.length} {t('index.documentsCount', 'artículos')}
                            </div>
                            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                              {childDocs.slice(0, 5).map((child, cIdx) => {
                                const childSlug = child.slug || child.id;
                                const childTitle = getLocalizedItemTitle(child, language);
                                return (
                                  <Link
                                    key={child.id || cIdx}
                                    href={`/documentation/${childSlug}`}
                                    className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 hover:text-info-main dark:hover:text-info-main transition-colors py-0.5 no-underline truncate"
                                  >
                                    <CaralIcon
                                      name={(child.icon_name as any) || 'file'}
                                      size={12}
                                      classname="text-neutral-400 shrink-0"
                                    />
                                    <span className="truncate">{childTitle}</span>
                                  </Link>
                                );
                              })}
                              {childDocs.length > 5 && (
                                <Link
                                  href={targetHref}
                                  className="text-[11px] font-medium text-info-main hover:underline pt-0.5 no-underline"
                                >
                                  +{childDocs.length - 5} más...
                                </Link>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
