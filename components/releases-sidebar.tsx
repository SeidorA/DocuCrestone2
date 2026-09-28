'use client';

import React from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { ReleaseNoteItem, ProductConfig, defaultProductConfig } from '@/portal.config';
import { useSidebar } from './sidebar-provider';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface ReleasesSidebarProps {
  config?: ProductConfig;
  releases: ReleaseNoteItem[];
  currentVersion: string;
  onItemClick?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
}

export function ReleasesSidebar({
  config = defaultProductConfig,
  releases = [],
  currentVersion,
  onItemClick,
  className = '',
  isMobileDrawer = false,
}: ReleasesSidebarProps) {
  const { isSidebarOpen } = useSidebar();
  const { language, t } = useLanguage();

  const title = getLocalizedText(config.title, language);

  const normalizeVer = (v: string | undefined | null) =>
    (v || '').replace(/^v/i, '').trim().toLowerCase();

  if (isMobileDrawer) {
    return (
      <div className={`w-full h-full flex flex-col p-4 bg-container font-poppins ${className}`}>
        <div className="px-2 py-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
          <span>{t('releases.sidebarTitle', 'Release Notes')}</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
            {releases.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
          {releases.map((rel, idx) => {
            const verStr = rel.version.replace(/^v/i, '');
            const isSelected =
              normalizeVer(rel.version) === normalizeVer(currentVersion) ||
              rel.id === currentVersion;
            const href = `/release-notes/${encodeURIComponent(verStr)}`;

            return (
              <Link
                key={rel.id || rel.version || idx}
                href={href}
                onClick={onItemClick}
                className={`w-full flex items-center justify-between font-poppins rounded-md px-2 py-2 transition-colors min-w-0 box-border ${
                  isSelected
                    ? 'bg-info-main text-white font-medium shadow-xs'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white font-normal'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CaralIcon
                    name={idx === 0 ? 'cubeInCube' : 'file'}
                    size={15}
                    classname={isSelected ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}
                  />
                  <span className="text-sm truncate">V. {verStr}</span>
                </div>

                {(rel.date || rel.release_date) && (
                  <span
                    className={`text-[10px] ml-2 shrink-0 ${
                      isSelected ? 'text-white/80' : 'text-neutral-800 dark:text-neutral-800'
                    }`}
                  >
                    {rel.date || rel.release_date}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-col shrink-0">
          <div className="flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-400 px-2 py-1.5">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <CaralIcon name="clock" size={14} classname="text-info-main shrink-0" />
              <span className="truncate">{title} Releases</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
              {releases.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{
        width: isSidebarOpen ? 288 : 0,
        minWidth: isSidebarOpen ? 288 : 0,
        maxWidth: isSidebarOpen ? 288 : 0,
      }}
      className={`hidden md:!flex flex-col justify-between transition-all duration-300 ease-in-out border-neutral-400 shrink-0 bg-container overflow-y-auto overflow-x-hidden font-poppins sticky top-[57px] h-[calc(100vh-57px)] min-h-[calc(100vh-57px)] ${
        className || ''
      } ${
        isSidebarOpen
          ? 'p-4 border-r opacity-100'
          : '!p-0 !border-0 opacity-0 invisible pointer-events-none'
      }`}
    >
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
        <div className="px-2 py-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
          <span>{t('releases.sidebarTitle', 'Release Notes')}</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
            {releases.length}
          </span>
        </div>

        {releases.map((rel, idx) => {
          const verStr = rel.version.replace(/^v/i, '');
          const isSelected =
            normalizeVer(rel.version) === normalizeVer(currentVersion) ||
            rel.id === currentVersion;
          const href = `/release-notes/${encodeURIComponent(verStr)}`;

          return (
            <Link
              key={rel.id || rel.version || idx}
              href={href}
              onClick={onItemClick}
              className={`w-full flex items-center justify-between font-poppins rounded-md px-2 py-2 transition-colors min-w-0 box-border ${
                isSelected
                  ? 'bg-info-main text-white font-medium shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white font-normal'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CaralIcon
                  name={idx === 0 ? 'cubeInCube' : 'file'}
                  size={15}
                  classname={isSelected ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}
                />
                <span className="text-sm truncate">V. {verStr}</span>
              </div>

              {(rel.date || rel.release_date) && (
                <span
                  className={`text-[10px] ml-2 shrink-0 ${
                    isSelected ? 'text-white/80' : 'text-neutral-800 dark:text-neutral-800'
                  }`}
                >
                  {rel.date || rel.release_date}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-col shrink-0">
        <div className="flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-400 px-2 py-1.5">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <CaralIcon name="clock" size={14} classname="text-info-main shrink-0" />
            <span className="truncate">{title} Releases</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
            {releases.length}
          </span>
        </div>
      </div>
    </aside>
  );
}
