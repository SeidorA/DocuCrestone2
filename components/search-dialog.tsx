'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CaralIcon } from 'iconcaral2';
import { FlatDocItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documents: FlatDocItem[];
  productTitle?: string;
}

export function SearchDialog({
  isOpen,
  onClose,
  documents,
  productTitle = 'Docs',
}: SearchDialogProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const localizedDocs = useMemo(() => {
    return documents.map((doc) => ({
      ...doc,
      localizedTitle: getLocalizedText(doc.title, language),
      localizedSection: doc.sectionTitle ? getLocalizedText(doc.sectionTitle, language) : undefined,
      localizedModule: doc.moduleTitle ? getLocalizedText(doc.moduleTitle, language) : undefined,
    }));
  }, [documents, language]);

  const filteredDocs = useMemo(() => {
    if (!query.trim()) return localizedDocs.slice(0, 8);
    const q = query.toLowerCase().trim();
    return localizedDocs.filter((doc) => {
      const matchTitle = (doc.localizedTitle || doc.title).toLowerCase().includes(q);
      const matchSection = (doc.localizedSection || doc.sectionTitle)?.toLowerCase().includes(q);
      const matchModule = (doc.localizedModule || doc.moduleTitle)?.toLowerCase().includes(q);
      return matchTitle || matchSection || matchModule;
    });
  }, [query, localizedDocs]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredDocs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredDocs.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? filteredDocs.length - 1 : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredDocs[selectedIndex]) {
          const selected = filteredDocs[selectedIndex];
          router.push(`/documentation/${selected.slug}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredDocs, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('search.ariaLabel', 'Buscar en la documentación')}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-sm animate-fade-in font-poppins"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-container rounded-2xl shadow-2xl border border-neutral-400 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-neutral-400">
          <CaralIcon
            name="search"
            size={18}
            classname="text-neutral-800 dark:text-neutral-400 mr-3 shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', 'Buscar páginas, secciones o temas...')}
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1"
            >
              <CaralIcon name="x" size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-medium text-neutral-800 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredDocs.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-400 flex items-center justify-between">
                <span>
                  {query
                    ? t('search.results', 'Resultados')
                    : t('search.recommended', 'Páginas recomendadas')}
                </span>
                <span>{filteredDocs.length} {t('search.docsCount', 'docs')}</span>
              </div>
              {filteredDocs.map((doc, idx) => {
                const isSelected = idx === selectedIndex;
                const displayTitle = doc.localizedTitle || doc.title;
                const displaySection = doc.localizedSection || doc.sectionTitle;

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      router.push(`/documentation/${doc.slug}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-info-main text-white'
                        : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        <CaralIcon name="file" size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {displayTitle}
                        </div>
                        {displaySection && (
                          <div
                            className={`text-xs truncate ${
                              isSelected ? 'text-white/80' : 'text-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {displaySection}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CaralIcon
                        name="arrowLeft"
                        size={16}
                        classname="text-white shrink-0 ml-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-800 dark:text-neutral-400 space-y-2">
              <div className="flex justify-center text-neutral-500">
                <CaralIcon name="magic" size={32} />
              </div>
              <p className="text-sm font-medium">
                {t('search.noResults', 'No se encontraron resultados')}
              </p>
              <p className="text-xs text-neutral-500">
                {t(
                  'search.tryAnother',
                  'Prueba buscando por otra palabra clave como "getting started" o "instalación"'
                )}
              </p>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border-t border-neutral-400 flex items-center justify-between text-[11px] text-neutral-800 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              {t('search.navigate', 'Navegar')}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              {t('search.select', 'Seleccionar')}
            </span>
          </div>
          <span>{productTitle} Docs</span>
        </div>
      </div>
    </div>
  );
}
