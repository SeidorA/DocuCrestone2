'use client';

import React from 'react';
import { CaralIcon } from 'iconcaral2';
import { useLanguage } from '@/context/language-context';

interface DocMetaProps {
  section?: string;
  readingTime: number;
  updatedAt?: string | null;
}

export function DocMeta({ section, readingTime, updatedAt }: DocMetaProps) {
  const { language, t } = useLanguage();

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 my-2 border-t border-neutral-800 font-poppins text-neutral-800">
      {section && section !== 'General' && (
        <>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-neutral-200 text-neutral-800 border border-neutral-100">
            {section}
          </span>
          |
        </>
      )}

      <span className="inline-flex items-center gap-1 text-xs ">
        <CaralIcon name="clock" size={14} />
        {readingTime} {t('docs.readingTime', 'min de lectura')}
      </span>
      |
      {formattedDate && (
        <span className="inline-flex items-center gap-1 text-xs ml-2">
          <CaralIcon name="calendar" size={14} />
          {t('docs.updated', 'Actualizado')}: {formattedDate}
        </span>
      )}
    </div>
  );
}
