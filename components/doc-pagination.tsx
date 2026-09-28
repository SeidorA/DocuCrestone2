'use client';

import React from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { FlatDocItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface DocPaginationProps {
  prevDoc: FlatDocItem | null;
  nextDoc: FlatDocItem | null;
}

export function DocPagination({ prevDoc, nextDoc }: DocPaginationProps) {
  const { language, t } = useLanguage();

  if (!prevDoc && !nextDoc) return null;

  return (
    <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 font-poppins">
      {prevDoc ? (
        <Link
          href={`/documentation/${prevDoc.slug}`}
          className="group flex flex-col p-4 rounded-xl border border-neutral-400 bg-container hover:border-info-main transition-all shadow-sm"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-400 group-hover:text-info-main transition-colors">
            <CaralIcon
              name="arrowLeft"
              size={14}
              classname="transition-transform group-hover:-translate-x-1"
            />
            {t('docs.previous', 'Anterior')}
          </span>
          <span className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-info-main line-clamp-1">
            {getLocalizedText(prevDoc.title, language)}
          </span>
          {prevDoc.sectionTitle && prevDoc.sectionTitle !== 'General' && (
            <span className="text-xs text-neutral-800 dark:text-neutral-400 mt-0.5">
              {getLocalizedText(prevDoc.sectionTitle, language)}
            </span>
          )}
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {nextDoc ? (
        <Link
          href={`/documentation/${nextDoc.slug}`}
          className="group flex flex-col p-4 rounded-xl border border-neutral-400 bg-container hover:border-info-main transition-all shadow-sm text-right sm:items-end"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-400 group-hover:text-info-main transition-colors">
            {t('docs.next', 'Siguiente')}
            <CaralIcon
              name="arrowRight"
              size={14}
              classname="transition-transform group-hover:translate-x-1"
            />
          </span>
          <span className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-info-main line-clamp-1">
            {getLocalizedText(nextDoc.title, language)}
          </span>
          {nextDoc.sectionTitle && nextDoc.sectionTitle !== 'General' && (
            <span className="text-xs text-neutral-800 dark:text-neutral-400 mt-0.5">
              {getLocalizedText(nextDoc.sectionTitle, language)}
            </span>
          )}
        </Link>
      ) : null}
    </div>
  );
}
