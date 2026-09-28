'use client';

import React from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { BreadcrumbItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { language, t } = useLanguage();

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1.5 text-xs text-neutral-900 mb-6 overflow-x-auto whitespace-nowrap py-1 scrollbar-none font-poppins"
    >
      <Link
        href="/documentation"
        className="flex items-center gap-1 hover:text-info-main transition-colors"
        title={t('docs.home', 'Inicio Documentación')}
      >
        <CaralIcon name="house" size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const localizedRaw = getLocalizedText(item.title, language);
        const displayTitle =
          localizedRaw === 'Documentación' || localizedRaw === 'Documentation'
            ? t('docs.docsTitle', 'Documentación')
            : localizedRaw;

        return (
          <React.Fragment key={`${item.title}-${index}`}>
            <CaralIcon
              name="chevronRigth"
              size={12}
              classname="text-neutral-800 flex-shrink-0"
            />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-info-main transition-colors truncate max-w-[180px]"
              >
                {displayTitle}
              </Link>
            ) : (
              <span
                className={`truncate max-w-[240px] ${
                  isLast
                    ? 'font-medium text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-800 dark:text-neutral-400'
                }`}
              >
                {displayTitle}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
