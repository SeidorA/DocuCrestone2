'use client';

import React from 'react';
import Link from 'next/link';
import { ProductConfig, defaultProductConfig, footer as layoutFooter } from '@/portal.config';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface FooterProps {
  config?: ProductConfig;
}

export function Footer({ config = defaultProductConfig }: FooterProps) {
  const { language, t } = useLanguage();
  const localizedTitle = getLocalizedText(config.title, language);

  return (
    <footer className="border-t py-8 text-xs text-neutral-500 bg-seidor-main">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {localizedTitle} —{' '}
            {layoutFooter?.description ||
              layoutFooter?.copyright ||
              t('home.copyright', 'Technical documentation template powered by Portal CMS.')}
          </p>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          {layoutFooter?.social &&
            Array.isArray(layoutFooter.social) &&
            layoutFooter.social.map((s, idx) => (
              <a
                key={`${s.name}-${idx}`}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-info-main transition-colors text-xs capitalize flex items-center gap-1"
              >
                <span>{s.name}</span>
              </a>
            ))}
          <Link href="/documentation" className="hover:text-info-main transition-colors ml-2">
            {t('home.goToDocs', 'Documentation')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
