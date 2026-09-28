'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'caralstable';
import { CaralIcon, Brand } from 'iconcaral2';
import { ThemeToggle } from './theme-toggle';
import { LanguageDropdown } from './language-dropdown';
import { SearchDialog } from './search-dialog';
import { FlatDocItem, NavigationItem } from '@/lib/api';
import { ProductConfig, defaultProductConfig, navbar as layoutNavbar } from '@/portal.config';
import { Sidebar } from './sidebar';
import { useSidebar } from './sidebar-provider';
import { useTheme } from './theme-provider';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface HeaderProps {
  config?: ProductConfig;
  productTitle?: string;
  navigation: NavigationItem[];
  flatDocs: FlatDocItem[];
  showSidebarToggle?: boolean;
  sidebarContent?: ((onClose: () => void) => React.ReactNode) | React.ReactNode;
}

export function Header({
  config = defaultProductConfig,
  productTitle,
  navigation,
  flatDocs,
  showSidebarToggle = true,
  sidebarContent,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { language, t } = useLanguage();

  const enableSearch = layoutNavbar?.enableSearch !== false;
  const enableMultiLanguage = layoutNavbar?.enableMultiLanguage !== false;
  const enableThemeSwitcher = layoutNavbar?.enableThemeSwitcher !== false;
  const enableCollapseSidebar = layoutNavbar?.enableCollapseSidebar !== false && showSidebarToggle;

  const title = getLocalizedText(productTitle || config.title, language);
  const logoIcon = config.branding.logo?.iconName || 'magic';
  const headerBadge = config.branding.badges?.headerBadge || config.version || 'v2.0';

  const isUsingCaralBrand = Boolean(
    config.iconCaral?.using_icon_caral ?? config.branding.logo?.isBrand
  );
  const brandName = (config.iconCaral?.name || config.branding.logo?.iconName || title) as any;
  const darkIconSrc = config.iconCaral?.icon_dark || config.branding.logo?.dark;

  const logoConfig = layoutNavbar?.logo?.[0];
  const logoEnabled = logoConfig ? logoConfig.enable !== false : true;
  const logoLink = logoConfig?.link || '/';

  // Resolved navigation links for desktop and mobile drawer
  const resolvedNavItems = useMemo(() => {
    const rawItems =
      (layoutNavbar?.itemsLeft && layoutNavbar.itemsLeft.length > 0
        ? layoutNavbar.itemsLeft
        : config.navLinks) || [];

    if (rawItems.length === 0) {
      return [
        {
          label: t('nav.docs', 'Documentación'),
          href: '/documentation',
          external: false,
          icon: 'book',
        },
      ];
    }

    return rawItems.map((link: any) => {
      const label =
        language === 'es'
          ? link.labelES ||
            link.label_es ||
            (typeof link.label === 'object' ? link.label?.es : link.label) ||
            link.labelEN ||
            link.label_en ||
            'Link'
          : link.labelEN ||
            link.label_en ||
            (typeof link.label === 'object' ? link.label?.en : link.label) ||
            link.labelES ||
            link.label_es ||
            'Link';

      const rawTarget = link.href || link.link || '/';
      const href =
        rawTarget.startsWith('/') || rawTarget.startsWith('http')
          ? rawTarget
          : `/${rawTarget === 'docs' ? 'documentation' : rawTarget === 'release-notes' ? 'releases' : rawTarget}`;

      let icon = 'link';
      const lowerTarget = (rawTarget || '').toLowerCase();
      if (lowerTarget.includes('doc')) icon = 'book';
      else if (lowerTarget.includes('release')) icon = 'tag';
      else if (lowerTarget.includes('blog')) icon = 'penNib';

      return {
        label,
        href,
        external: Boolean(link.external),
        icon,
      };
    });
  }, [layoutNavbar, config.navLinks, language, t]);

  // Handle Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        ref={navbarRef}
        className="sticky top-0 z-50 bg-container! w-full shrink-0 border-b border-neutral-400 font-poppins"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 w-full mx-auto">
          {/* Left: Mobile Menu Toggle, Desktop Sidebar Toggle, Brand & Desktop Links */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 w-auto md:w-[33%]">
            {/* Mobile hamburger button - always visible on mobile */}
            <div className="flex md:!hidden">
              <Button
                variant="ghost"
                isIconButton
                iconName={isMobileMenuOpen ? 'x' : 'menu'}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={t('nav.openMenu', 'Abrir menú')}
              />
            </div>

            {/* Desktop Sidebar Toggle Button */}
            {enableCollapseSidebar && (
              <div className="hidden md:!flex">
                <Button
                  variant={isSidebarOpen ? 'info' : 'ghost'}
                  isIconButton
                  iconName="closeSidebarRigt"
                  onClick={toggleSidebar}
                  aria-label={
                    isSidebarOpen
                      ? t('nav.toggleSidebarHide', 'Ocultar menú lateral')
                      : t('nav.toggleSidebarShow', 'Mostrar menú lateral')
                  }
                />
              </div>
            )}

            {/* Brand Logo & Title */}
            {logoEnabled && (
              <Link
                href={logoLink}
                className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
              >
                {isUsingCaralBrand ? (
                  isDarkMode && darkIconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={darkIconSrc}
                      alt={config.branding.logo?.alt || title}
                      className="h-[28px]! w-auto object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center shrink-0">
                      <Brand name={brandName} size={28} />
                    </div>
                  )
                ) : config.branding.logo?.light || config.branding.logo?.dark ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      isDarkMode && config.branding.logo?.dark
                        ? config.branding.logo.dark
                        : (config.branding.logo?.light || config.branding.logo?.dark)
                    }
                    alt={config.branding.logo?.alt || title}
                    className="h-7 sm:h-8 w-auto object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-info-main flex items-center justify-center text-white font-bold shadow-md shadow-info-main/20 overflow-hidden">
                    <CaralIcon name={logoIcon as any} size={18} color="#ffffff" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-poppins text-sm sm:text-base tracking-tight">
                    {title}
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Left Quick Navigation Links */}
            <div className="hidden md:!flex items-center gap-2 ml-3">
              {resolvedNavItems.map((item, idx) => {
                const isActive = !item.external && pathname === item.href;
                if (item.external) {
                  return (
                    <a
                      key={`${item.href}-${idx}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-info-main dark:hover:text-info-light transition-colors inline-flex items-center gap-1"
                    >
                      <span>{item.label}</span>
                      <CaralIcon name="upRightFromSquare" size={10} />
                    </a>
                  );
                }
                return (
                  <Link
                    key={`${item.href}-${idx}`}
                    href={item.href}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-info-main dark:text-info-light font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-info-main dark:hover:text-info-light'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Middle: Global Search bar trigger */}
          {enableSearch ? (
            <div className="w-[33%] md:!flex hidden flex-1 justify-center">
              <div className="w-[70%]">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  type="button"
                  className="flex items-center justify-between border border-neutral-800 rounded-full px-4 py-2 w-full transition-colors cursor-pointer group hover:border-neutral-900 bg-neutral-100/40 dark:bg-neutral-800/40"
                >
                  <div className="flex items-center gap-2 text-neutral-800 group-hover:text-neutral-900 transition-colors">
                    <CaralIcon name="search" size={16} />
                    <span className="font-poppins text-xs text-neutral-800 group-hover:text-neutral-900">
                      {t('nav.search', 'Buscar en la documentación...')}
                    </span>
                  </div>
                  <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-full px-2 py-0.5 text-[10px] text-neutral-800 dark:text-neutral-400 font-mono shrink-0">
                    ⌘ K
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-[33%] md:!flex hidden flex-1" />
          )}

          {/* Right: Actions (Language Selector & Theme Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-3 relative shrink-0 justify-end w-auto md:w-[33%]">
            {/* Mobile Search Button */}
            {enableSearch && (
              <div className="flex md:!hidden">
                <Button
                  variant="ghost"
                  isIconButton
                  iconName="search"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label={t('nav.searchMobile', 'Buscar')}
                />
              </div>
            )}

            {/* Global Language Selector */}
            {enableMultiLanguage && <LanguageDropdown />}

            {/* Theme Toggle (Light / Dark / System) */}
            {enableThemeSwitcher && <ThemeToggle />}
          </div>
        </div>
      </header>

      {/* Search Palette Modal */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={flatDocs}
        productTitle={title}
      />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:!hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-container shadow-2xl border-r border-neutral-400 flex flex-col z-50 animate-slide-up h-full">
            {/* Mobile Drawer Header */}
            <div className="p-4 border-b border-neutral-400 flex items-center justify-between">
              <Link
                href={logoLink}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 min-w-0"
              >
                {isUsingCaralBrand ? (
                  isDarkMode && darkIconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={darkIconSrc}
                      alt={config.branding.logo?.alt || title}
                      className="h-[24px]! w-auto object-contain shrink-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center shrink-0">
                      <Brand name={brandName} size={24} />
                    </div>
                  )
                ) : config.branding.logo?.light || config.branding.logo?.dark ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      isDarkMode && config.branding.logo?.dark
                        ? config.branding.logo.dark
                        : (config.branding.logo?.light || config.branding.logo?.dark)
                    }
                    alt={config.branding.logo?.alt || title}
                    className="h-6 w-auto object-contain shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-info-main flex items-center justify-center text-white font-bold shrink-0">
                    <CaralIcon name={logoIcon as any} size={16} color="#ffffff" />
                  </div>
                )}
                <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                  {title}
                </span>
              </Link>
              <Button
                variant="ghost"
                isIconButton
                iconName="x"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={t('common.close', 'Cerrar')}
              />
            </div>

            {/* Mobile Drawer Content */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
              {/* Main Navigation Links */}
              <div className="flex flex-col gap-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  {t('nav.menu', 'Menú')}
                </div>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-info-main/10 text-info-main font-semibold dark:bg-info-main/20'
                      : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <CaralIcon name="house" size={16} />
                  <span>{t('nav.home', 'Inicio')}</span>
                </Link>
                {resolvedNavItems.map((item, idx) => {
                  const isActive = !item.external && pathname === item.href;
                  if (item.external) {
                    return (
                      <a
                        key={`mobile-nav-${item.href}-${idx}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <CaralIcon name={item.icon as any} size={16} />
                          <span>{item.label}</span>
                        </div>
                        <CaralIcon name="upRightFromSquare" size={12} />
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={`mobile-nav-${item.href}-${idx}`}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-info-main/10 text-info-main font-semibold dark:bg-info-main/20'
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <CaralIcon name={item.icon as any} size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Documentation Sidebar / Custom Content if showSidebarToggle or sidebarContent is provided */}
              {(showSidebarToggle || sidebarContent) && (
                <div className="pt-3 border-t border-neutral-300 dark:border-neutral-700/80 flex flex-col gap-2">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    {t('nav.docs', 'Documentación')}
                  </div>
                  {sidebarContent ? (
                    typeof sidebarContent === 'function' ? (
                      sidebarContent(() => setIsMobileMenuOpen(false))
                    ) : (
                      sidebarContent
                    )
                  ) : (
                    <Sidebar
                      config={config}
                      navigation={navigation}
                      onItemClick={() => setIsMobileMenuOpen(false)}
                      isMobileDrawer={true}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
