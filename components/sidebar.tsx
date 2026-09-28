'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CaralIcon, Brand } from 'iconcaral2';
import { NavigationItem, getSectionIndexDoc, flattenNavigation } from '@/lib/api';
import { ProductConfig, defaultProductConfig } from '@/portal.config';
import { useSidebar } from './sidebar-provider';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText, getLocalizedItemTitle } from '@/lib/utils';

interface SidebarProps {
  config?: ProductConfig;
  navigation: NavigationItem[];
  onItemClick?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
}

const checkActive = (item: NavigationItem, currentPath: string): boolean => {
  if (item.slug && `/documentation/${item.slug}` === currentPath) return true;
  const indexDoc = getSectionIndexDoc(item);
  if (indexDoc?.slug && `/documentation/${indexDoc.slug}` === currentPath) return true;
  if (item.items && item.items.length > 0) {
    return item.items.some((child) => checkActive(child, currentPath));
  }
  return false;
};

function findModuleIdForPath(modules: NavigationItem[], path: string): string | null {
  for (const mod of modules) {
    if (checkActive(mod, path)) {
      return mod.id;
    }
  }
  return null;
}

function getDefaultModuleId(modules: NavigationItem[], config?: ProductConfig): string {
  if (!modules || modules.length === 0) return '';
  const currentMod = modules.find((m) => {
    const t = m.title?.trim().toLowerCase();
    if (t === 'current' || t === 'curren') return true;
    if (config?.version && m.title?.includes(config.version)) return true;
    return false;
  });
  return currentMod ? currentMod.id : modules[0].id;
}

export function Sidebar({
  config = defaultProductConfig,
  navigation,
  onItemClick,
  className = '',
  isMobileDrawer = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, setNavigation } = useSidebar();
  const { language } = useLanguage();

  const defaultModId = getDefaultModuleId(navigation, config);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    return findModuleIdForPath(navigation, pathname) || defaultModId;
  });

  // When pathname changes, if it matches a different module, sync the selected module
  useEffect(() => {
    const matchingId = findModuleIdForPath(navigation, pathname);
    if (matchingId) {
      setSelectedModuleId(matchingId);
    }
  }, [pathname, navigation]);

  useEffect(() => {
    setNavigation(navigation);
  }, [navigation, setNavigation]);

  const activeModule =
    navigation.find((m) => m.id === selectedModuleId) ||
    navigation.find((m) => m.id === defaultModId) ||
    navigation[0];

  const moduleItems = activeModule?.items || [];

  const handleSelectModule = (selectedMod: NavigationItem) => {
    setSelectedModuleId(selectedMod.id);
    const flatDocs = flattenNavigation(selectedMod.items || []);
    if (flatDocs.length > 0) {
      router.push(flatDocs[0].url);
      if (onItemClick) onItemClick();
    }
  };

  const title = getLocalizedText(config.title, language);

  if (isMobileDrawer) {
    return (
      <div className={`w-full h-full flex flex-col p-4 bg-container font-poppins ${className}`}>
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
          {moduleItems.map((item, itemIndex) => (
            <SidebarItemNode
              key={item.id || itemIndex}
              item={item}
              pathname={pathname}
              router={router}
              onNavigate={onItemClick}
            />
          ))}
        </div>

        {/* Footer Info / Version Selector */}
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-col shrink-0">
          <SidebarVersionSelector
            modules={navigation}
            selectedModuleId={activeModule?.id || selectedModuleId}
            onSelectModule={handleSelectModule}
            config={config}
          />
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
      className={`hidden md:!flex flex-col justify-between transition-all duration-300 ease-in-out border-neutral-400 shrink-0 bg-container overflow-y-auto overflow-x-hidden font-poppins sticky top-[57px] h-[calc(100vh-57px)] min-h-[calc(100vh-57px)] ${className || ''
        } ${isSidebarOpen
          ? 'p-4 border-r opacity-100'
          : '!p-0 !border-0 opacity-0 invisible pointer-events-none'
        }`}
    >
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
        {moduleItems.map((item, itemIndex) => (
          <SidebarItemNode
            key={item.id || itemIndex}
            item={item}
            pathname={pathname}
            router={router}
            onNavigate={onItemClick}
          />
        ))}
      </div>

      {/* Footer Info / Version Selector */}
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-col shrink-0">
        <SidebarVersionSelector
          modules={navigation}
          selectedModuleId={activeModule?.id || selectedModuleId}
          onSelectModule={handleSelectModule}
          config={config}
        />
      </div>
    </aside>
  );
}

interface VersionSelectorProps {
  modules: NavigationItem[];
  selectedModuleId: string;
  onSelectModule: (module: NavigationItem) => void;
  config?: ProductConfig;
}

function SidebarVersionSelector({
  modules,
  selectedModuleId,
  onSelectModule,
  config = defaultProductConfig,
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];
  const title = getLocalizedText(config.title, language);
  const sidebarBadge = config.branding.badges?.sidebarBadge || config.version || 'v2.0';

  // Extract active version label for the chip (e.g. "1.97.6" or "2.0")
  const activeModuleTitle = activeModule ? getLocalizedText(activeModule.title, language) : '';
  const activeVersionText = (() => {
    if (!activeModuleTitle) return sidebarBadge;
    const lowerTitle = title.toLowerCase();
    const lowerMod = activeModuleTitle.toLowerCase();
    if (lowerMod.startsWith(lowerTitle)) {
      const rest = activeModuleTitle.slice(title.length).trim();
      return rest || sidebarBadge;
    }
    return activeModuleTitle;
  })();

  const canSwitchVersion = modules && modules.length > 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!canSwitchVersion) {
    return (
      <div className="flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-400 px-2 py-1.5">
        <span className="flex items-center gap-1.5 font-medium">
          <CaralIcon name="book" size={14} classname="text-info-main" />
          {title} Docs
        </span>
        {sidebarBadge && (
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
            {sidebarBadge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Menu (opens upwards) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-container border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-xl z-50 flex flex-col gap-1 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-800">
            Versiones de documentación
          </div>
          {modules.map((mod, idx) => {
            const isSelected = mod.id === activeModule?.id;
            const localizedModTitle = getLocalizedText(mod.title, language);
            const isCurrent =
              idx === 0 ||
              localizedModTitle.toLowerCase().trim() === 'current' ||
              (config.version && localizedModTitle.includes(config.version));

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  onSelectModule(mod);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer ${isSelected
                  ? 'bg-info-main text-white font-semibold shadow-xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CaralIcon
                    name={isCurrent ? 'cubeInCube' : 'folder'}
                    size={14}
                    classname={isSelected ? 'text-white' : 'text-info-main'}
                  />
                  <span className="truncate">{localizedModTitle}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {isCurrent && !isSelected && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                      Actual
                    </span>
                  )}
                  {isSelected && (
                    <CaralIcon name="check" size={14} classname="text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Trigger Button in the same line: "Crestone Docs" + Chip + Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${isOpen
          ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
          : 'text-neutral-800 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
      >
        <span className="flex items-center gap-1.5 font-medium truncate">
          <CaralIcon name="book" size={14} classname="text-info-main shrink-0" />
          <span className="truncate">{title} Docs</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {activeVersionText && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700">
              {activeVersionText}
            </span>
          )}
          <CaralIcon
            name={isOpen ? 'chevronUp' : 'chevronDown'}
            size={12}
            classname={`shrink-0 transition-transform duration-200 ${isOpen
              ? 'rotate-180 text-info-main'
              : 'text-neutral-800 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'
              }`}
          />
        </div>
      </button>
    </div>
  );
}


interface SidebarItemNodeProps {
  item: NavigationItem;
  level?: number;
  pathname: string;
  router: any;
  onNavigate?: () => void;
}

function SidebarItemNode({
  item,
  level = 0,
  pathname,
  router,
  onNavigate,
}: SidebarItemNodeProps) {
  const { language } = useLanguage();
  const indexDoc = getSectionIndexDoc(item);
  const isFolder = Boolean(
    item.type === 'section' || (item.items && item.items.length > 0 && !item.slug)
  );

  // Filter out the index doc from children so it doesn't appear duplicated under the section
  const visibleChildItems = item.items
    ? item.items.filter(
        (child, idx) =>
          !(
            indexDoc &&
            ((child.id && child.id === indexDoc.id) ||
              (child.slug && child.slug === indexDoc.slug) ||
              (idx === 0 && child.slug === indexDoc.slug))
          )
      )
    : [];

  const hasVisibleChildren = visibleChildItems.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isFolder && item.items) {
      if (checkActive(item, pathname)) {
        setIsOpen(true);
      }
    }
  }, [pathname, item, isFolder]);

  // If item has an indexDoc, use indexDoc's slug; otherwise use item.slug
  const effectiveSlug = indexDoc?.slug || item.slug || null;
  const docHref = effectiveSlug ? `/documentation/${effectiveSlug}` : '';
  const isDirectActive = docHref ? pathname === docHref : false;
  const isSectionActive = item.slug ? pathname === `/documentation/${item.slug}` : false;
  const isIndexActive = indexDoc?.slug ? pathname === `/documentation/${indexDoc.slug}` : false;
  const isActive = isDirectActive || isSectionActive || isIndexActive;

  const handleRowClick = () => {
    if (docHref) {
      router.push(docHref);
      if (onNavigate) onNavigate();
      if (hasVisibleChildren) {
        setIsOpen(true);
      }
    } else if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const iconName = item.icon_name || indexDoc?.icon_name || (isFolder ? 'folder' : 'file');
  const isBrand = iconName.startsWith('brand-');
  const cleanIconName = iconName.replace(/^brand-/, '');
  const showIcon = level === 0;

  // Resolve sidebar title using language & sidebar preference
  const displayTitle = getLocalizedItemTitle(item, language, { isSidebar: true });

  return (
    <div className="w-full flex flex-col min-w-0">
      <button
        type="button"
        onClick={handleRowClick}
        className={`w-full max-w-full flex items-center justify-between text-left font-poppins rounded-md px-2 py-1.5 transition-colors cursor-pointer min-w-0 box-border ${isActive
          ? 'bg-info-main text-white font-medium shadow-xs'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white font-normal'
          }`}
      >
        <div className="flex flex-1 items-center gap-2 justify-between min-w-0 w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showIcon && (
              isBrand ? (
                <Brand name={cleanIconName as any} size={15} />
              ) : (
                <div className={isActive ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}>
                  <CaralIcon
                    name={cleanIconName as any}
                    size={15}
                  />
                </div>
              ))}
            <span className="text-md">{displayTitle}</span>
          </div>

          {isFolder && hasVisibleChildren && (
            <div
              onClick={handleChevronClick}
              className={`p-1 -mr-1 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 transition-transform ${isOpen ? 'rotate-180' : ''
                }`}
              title={isOpen ? 'Colapsar' : 'Expandir'}
            >
              <CaralIcon
                name={isOpen ? 'chevronUp' : 'chevronDown'}
                size={13}
                classname={isActive ? 'text-white' : 'text-neutral-800'}
              />
            </div>
          )}
        </div>
      </button>

      {isFolder && isOpen && hasVisibleChildren && (
        <div className="flex flex-col mt-0.5 space-y-0.5 border-l border-neutral-200 dark:border-neutral-700/60 ml-2.5 pl-1.5 min-w-0">
          {visibleChildItems.map((child, idx) => (
            <SidebarItemNode
              key={child.id || idx}
              item={child}
              level={level + 1}
              pathname={pathname}
              router={router}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

