import { ProductConfig } from './portal.types';
import {
  defaultProductBranding,
  defaultProductColors,
  defaultProductColorTokens,
} from './branding.portal';
import { NavbarConfig, HomepageConfig, FooterConfig } from './layout.types';

export * from './portal.types';
export * from './branding.portal';
export * from './layout.types';

/**
 * 1. CONFIGURACIÓN DEL PRODUCTO Y METADATA
 * Valores por defecto del portal de documentación (sobreescritos por Portal CMS).
 */
export const defaultProductConfig: ProductConfig = {
  slug: process.env.NEXT_PUBLIC_PRODUCT_SLUG || 'docuportal',
  title: process.env.NEXT_PUBLIC_PRODUCT_TITLE || 'DocuPortal',
  tagline: 'Portal de documentación técnica moderna',
  description:
    process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION ||
    'DocuPortal ofrece una experiencia completa y moderna para explorar la documentación técnica, guías, APIs y novedades de producto.',
  version: process.env.NEXT_PUBLIC_PRODUCT_VERSION || 'v1.0.0',
  author: 'SEIDOR',
  portalUrl:
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    process.env.NEXT_PUBLIC_PORTAL_API ||
    '',
  apiUrl:
    process.env.NEXT_PUBLIC_PORTAL_API ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    '',

  branding: defaultProductBranding,
  colors: defaultProductColors,
  colorTokens: defaultProductColorTokens,

  discoverItems: [],

  homeSections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      headline: 'Documentación Oficial',
      title: 'Centro de Ayuda y Guías Técnicas',
      showIsometricGraphic: true,
      image: '/hero.png',
      imagesize: 'w-auto h-[700px]',
      ctaText: 'Explorar Documentación',
      ctaLink: '/documentation',
    },
    {
      id: 'description',
      type: 'description',
      enabled: true,
      title: 'Documentación del Producto',
    },
    {
      id: 'discover',
      type: 'discover',
      enabled: true,
      title: 'Descubre las Funcionalidades',
    },
    {
      id: 'faq',
      type: 'faq',
      enabled: true,
      title: 'Preguntas Frecuentes',
      subtitle:
        'Respuestas a las preguntas más habituales sobre la plataforma y su integración.',
      exploreText:
        'Si deseas explorar más preguntas y respuestas, visita la sección de documentación.',
      exploreLink: '/documentation',
    },
  ],

  features: [],
  faq: [],
  releases: [],
  blogPosts: [],
};

/**
 * 2. CONFIGURACIÓN DEL NAVBAR SUPERIOR
 * Enlaces, logo, buscador, selector de idioma y modo oscuro.
 */
export const navbar: NavbarConfig = {
  logo: [
    {
      enable: true,
      link: '/',
    },
  ],
  itemsLeft: [
    { labelEN: 'Documentation', labelES: 'Documentación', link: 'docs' },
    { labelEN: 'Release Notes', labelES: 'Notas de Lanzamiento', link: 'release-notes' },
    { labelEN: 'Blog', labelES: 'Blog', link: 'blog' },
  ],
  enableSearch: true,
  enableMultiLanguage: true,
  enableThemeSwitcher: true,
  enableCollapseSidebar: true,
};

/**
 * 3. CONFIGURACIÓN DEL PIE DE PÁGINA (FOOTER)
 * Copyright, descripción y redes sociales.
 */
export const footer: FooterConfig = {
  copyright: 'Official Crestone documentation.',
  description: 'Official Crestone documentation.',
  social: [
    {
      name: 'Web',
      url: 'https://crestone.io/',
    },
    {
      name: 'Demo',
      url: 'https://crestone.seidoranalytics.com/',
    },
  ],
};

export default defaultProductConfig;
