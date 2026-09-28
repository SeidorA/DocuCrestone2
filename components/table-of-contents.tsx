'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from 'caralstable';
import { CaralIcon } from 'iconcaral2';
import { TocHeading } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { parseMultilingualMarkdown } from '@/lib/utils';

interface TableOfContentsProps {
  headings?: TocHeading[];
  rawContent?: string;
}

export function TableOfContents({ headings, rawContent }: TableOfContentsProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const activeToc = useMemo(() => {
    if (rawContent) {
      const { content: activeText } = parseMultilingualMarkdown(rawContent, language);
      const items: TocHeading[] = [];
      const headingRegex = /(?:^|\n)(#{2,4})\s+([^\n]+)/g;
      let match;
      while ((match = headingRegex.exec(activeText)) !== null) {
        const level = match[1].length;
        let title = match[2].trim();
        if (title.endsWith('\r')) title = title.slice(0, -1);

        // Ignore language delimiters if any
        if (title.toLowerCase() === 'es' || title.toLowerCase() === 'en') continue;

        const cleanTitle = title
          .replace(/[*_`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/!(?:icon|brand)-[\w-]+!/g, '')
          .trim();

        if (!cleanTitle) continue;

        const id = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        items.push({ level, text: cleanTitle, id });
      }

      if (items.length > 0) return items;
    }
    return headings || [];
  }, [rawContent, headings, language]);

  useEffect(() => {
    if (activeToc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -70% 0%',
        threshold: 0,
      }
    );

    activeToc.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [activeToc]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside
      className={`hidden lg:!flex shrink-0 sticky top-[80px] transition-all duration-300 ease-in-out overflow-hidden flex-col font-poppins ${isOpen ? 'w-[260px] xl:w-[280px]' : 'w-[40px] items-end'
        }`}
    >
      <div className={`flex gap-2 items-center mb-3 w-full ${!isOpen ? 'justify-end' : 'justify-between'}`}>
        {isOpen && (
          <span className="font-semibold text-xs uppercase tracking-wider text-neutral-900 dark:text-white whitespace-nowrap">
            {t('docs.onThisPage', 'En esta página')}
          </span>
        )}
        <Button
          isIconButton
          iconName={isOpen ? 'chevronRigth' : 'chevronLeft'}
          variant={isOpen ? 'ghost' : 'info'}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen
              ? t('docs.collapseToc', 'Colapsar tabla de contenido')
              : t('docs.expandToc', 'Expandir tabla de contenido')
          }
        />
      </div>

      {isOpen && (
        <div className="animate-fade-in flex flex-col space-y-4 w-full">
          {activeToc.length === 0 ? (
            <p className="text-xs text-neutral-800 italic">
              {t('docs.noSubtitles', 'No hay subtítulos en esta sección.')}
            </p>
          ) : (
            <ul className="flex flex-col gap-1 border-l border-neutral-500 text-[12px] max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              {activeToc.map((item, idx) => {
                const isActive = activeId === item.id;
                return (
                  <li
                    key={idx}
                    className={`${item.level === 3 ? 'pl-5' : item.level === 4 ? 'pl-7' : 'pl-3'}`}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          window.history.pushState(null, '', `#${item.id}`);
                          setActiveId(item.id);
                        }
                      }}
                      className={`block py-1 transition-all duration-200 ease-out line-clamp-2 ${isActive
                        ? 'text-info-main font-semibold'
                        : 'text-neutral-800 hover:text-info-main dark:hover:text-info-light'
                        }`}
                    >
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="pt-3 border-t border-neutral-500 flex flex-col gap-1.5 text-xs w-full">
            <button
              onClick={handleCopyLink}
              type="button"
              className="flex items-center gap-2 text-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors py-1 text-left cursor-pointer"
            >
              {copied ? (
                <>
                  <CaralIcon name="check" size={14} classname="text-success-main" />
                  <span className="text-success-main font-medium">
                    {t('docs.linkCopied', 'Enlace copiado')}
                  </span>
                </>
              ) : (
                <>
                  <CaralIcon name="link" size={14} />
                  <span>{t('docs.copyLink', 'Copiar enlace')}</span>
                </>
              )}
            </button>

            <button
              onClick={scrollToTop}
              type="button"
              className="flex items-center gap-2 text-neutral-800  hover:text-neutral-900 dark:hover:text-white transition-colors py-1 text-left cursor-pointer"
            >
              <CaralIcon name="arrowUp" size={14} />
              <span>{t('docs.backToTop', 'Volver arriba')}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
