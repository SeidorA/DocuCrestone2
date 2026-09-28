'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'caralstable';
import { CaralIcon } from 'iconcaral2';
import { useTheme } from './theme-provider';
import { useLanguage } from '@/context/language-context';

export function ThemeToggle() {
  const { themePreference, isDarkMode, setThemePreference } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    );
  }

  const currentIcon =
    themePreference === 'system'
      ? 'screenView'
      : isDarkMode
      ? 'sunMoon'
      : 'sunBright';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        isIconButton
        iconName={currentIcon as any}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.changeTheme', 'Cambiar tema')}
        className="text-neutral-800 hover:text-neutral-900"
      />

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-container border border-neutral-400 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 z-50 animate-fade-in font-poppins">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setThemePreference('light');
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left ${
                themePreference === 'light'
                  ? 'bg-info-main text-white'
                  : 'text-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <CaralIcon name="sunBright" size={14} />
              <span>{t('nav.themeLight', 'Claro')}</span>
            </button>

            <button
              onClick={() => {
                setThemePreference('dark');
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left ${
                themePreference === 'dark'
                  ? 'bg-info-main text-white'
                  : 'text-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <CaralIcon name="sunMoon" size={14} />
              <span>{t('nav.themeDark', 'Oscuro')}</span>
            </button>

            <button
              onClick={() => {
                setThemePreference('system');
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full text-left ${
                themePreference === 'system'
                  ? 'bg-info-main text-white'
                  : 'text-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <CaralIcon name="screenView" size={14} />
              <span>{t('nav.themeSystem', 'Sistema')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
