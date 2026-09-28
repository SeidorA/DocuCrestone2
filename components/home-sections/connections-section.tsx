'use client';

import React from 'react';
import { Brand, CaralIcon } from 'iconcaral2';
import { ConnectionItem, HomeSectionConfig, ProductConfig } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface ConnectionsSectionProps {
  section: HomeSectionConfig;
  config: ProductConfig;
}

export function ConnectionsSection({ section, config }: ConnectionsSectionProps) {
  const { language } = useLanguage();

  const title =
    getLocalizedText(section.title, language) || 'Connections';

  const items: ConnectionItem[] =
    section.items || config.connections || [];

  if (!items || items.length === 0) return null;

  return (
    <section className="w-full bg-neutral-100/80 dark:bg-neutral-900/50 py-10 px-4 sm:px-8 border-y border-neutral-200/80 dark:border-neutral-800/80">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 text-left">
          {title}
        </h2>

        {/* Horizontal Badge Pills List */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-thin no-scrollbar sm:flex-wrap">
          {items.map((conn, idx) => {
            const label = getLocalizedText(conn.label, language);
            const brand = conn.brand as any;

            return (
              <div
                key={`${conn.label}-${idx}`}
                className="shrink-0 inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow transition-shadow hover:border-info-main/40"
              >
                {brand ? (
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Brand name={brand} size={20} />
                  </div>
                ) : conn.icon ? (
                  <div className="text-info-main shrink-0">
                    <CaralIcon name={conn.icon as any} size={18} />
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-info-main" />
                )}
                <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
