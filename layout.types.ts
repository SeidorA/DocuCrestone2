import React from 'react';

export type BuiltinHomeSection =
  | 'Hero'
  | 'hero'
  | 'Description'
  | 'description'
  | 'Discover'
  | 'discover'
  | 'Connections'
  | 'connections'
  | 'Faq'
  | 'faq'
  | 'FAQ'
  | 'Index'
  | 'index'
  | 'DocIndex'
  | 'docindex'
  | 'Features'
  | 'features';

export type HomeSectionItem =
  | BuiltinHomeSection
  | (string & {})
  | React.ComponentType<{
      config?: any;
      navigation?: any[];
      documents?: any[];
      [key: string]: any;
    }>
  | {
      id?: string;
      type: string;
      enabled?: boolean;
      title?: string | { es?: string; en?: string };
      subtitle?: string | { es?: string; en?: string };
      description?: string | { es?: string; en?: string };
      headline?: string | { es?: string; en?: string };
      image?: string;
      imageAlt?: string;
      imagesize?: string;
      imageSize?: string;
      component?: React.ComponentType<any>;
      [key: string]: any;
    };

export interface NavbarItem {
  labelEN?: string;
  labelES?: string;
  label?: string | { es?: string; en?: string };
  link?: string;
  href?: string;
  external?: boolean;
}

export interface NavbarConfig {
  logo: Array<{
    enable: boolean;
    link: string;
  }>;
  itemsLeft: NavbarItem[];
  enableSearch?: boolean;
  enableMultiLanguage?: boolean;
  enableThemeSwitcher?: boolean;
  enableCollapseSidebar?: boolean;
}

export interface HomepageConfig {
  sections: HomeSectionItem[];
}

export interface FooterSocialItem {
  name: 'github' | 'linkedin' | 'twitter' | 'youtube' | 'discord' | string;
  url: string;
}

export interface FooterConfig {
  copyright?: string;
  description?: string;
  social?: FooterSocialItem[];
}
