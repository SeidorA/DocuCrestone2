'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NavigationItem } from '@/lib/api';

type SidebarContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  navigation: NavigationItem[] | null;
  setNavigation: (nav: NavigationItem[] | null) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navigation, setNavigationState] = useState<NavigationItem[] | null>(null);

  const setNavigation = useCallback((newNav: NavigationItem[] | null) => {
    setNavigationState((prev) => {
      if (prev === newNav) return prev;
      return newNav;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        navigation,
        setNavigation,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isSidebarOpen: true,
      setIsSidebarOpen: () => {},
      toggleSidebar: () => {},
      navigation: null,
      setNavigation: () => {},
    };
  }
  return context;
}
