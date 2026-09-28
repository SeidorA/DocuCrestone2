'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'caralstable';
import { CaralIcon } from 'iconcaral2';
import { useLanguage, Locale } from '@/context/language-context';

export function LanguageDropdown({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const languages: { code: Locale; name: string; short: string; flag: string }[] = [
    { code: 'es', name: 'Español', short: 'ES', flag: '🇪🇸' },
    { code: 'en', name: 'English', short: 'EN', flag: '🇺🇸' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={dropdownRef} className={`relative font-poppins ${className}`}>
      <Button
        variant="ghost"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-800 hover:text-neutral-900 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
        iconName='globe'
      >

        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 uppercase">
          {current.short}
        </span>
        <CaralIcon
          name="chevronDown"
          size={12}
          classname={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-container border border-neutral-400 dark:border-neutral-700 rounded-xl shadow-xl p-1 z-50 animate-fade-in">
          <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-neutral-800 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 mb-1">
            Idioma
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${isSelected
                    ? 'bg-info-main text-white font-medium'
                    : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <CaralIcon name="check" size={14} classname="text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
