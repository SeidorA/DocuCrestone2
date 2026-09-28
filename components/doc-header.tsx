'use client';

import React from 'react';
import { DynamicIcon } from '@/components/icon-helper';
import { DocMeta } from '@/components/doc-meta';
import { DocumentItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedItemTitle, getLocalizedText, extractFirstH1, parseMultilingualMarkdown } from '@/lib/utils';

interface DocHeaderProps {
  doc: DocumentItem;
  iconName?: string;
  displaySection?: string;
  readingTime?: number;
}

export function DocHeader({
  doc,
  iconName,
  displaySection,
  readingTime = 1,
}: DocHeaderProps) {
  const { language } = useLanguage();

  // Localize section name if present
  const localizedSection = displaySection ? getLocalizedText(displaySection, language) : undefined;

  // Extract localized H1 from localized markdown if available, or fall back to localized item title
  const parsedMarkdown = parseMultilingualMarkdown(doc.content || '', language);
  const contentH1 = extractFirstH1(parsedMarkdown.content);
  const title = contentH1 || getLocalizedItemTitle(doc, language) || doc.title;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 mb-2">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
        {iconName && (
          <DynamicIcon
            name={iconName}
            size={34}
            className="text-info-main shrink-0"
          />
        )}
        <span>{title}</span>
      </h1>

      <DocMeta
        section={localizedSection}
        readingTime={readingTime}
        updatedAt={doc.updated_at}
      />
    </header>
  );
}
