import { ProductBranding, ProductColors, ProductColorTokens } from './portal.types';

/**
 * Configuración de branding por defecto (logos, colores base de la UI y badges).
 */
export const defaultProductBranding: ProductBranding = {
  logo: {
    iconName: 'magic',
    alt: 'Logo de Documentación',
  },
  colors: {
    primary: '#07153A', // Seidor Main
    secondary: '#1F3A70', // Seidor Hard
    accent: '#0085FF', // Info Main
    background: {
      light: '#F4F4F5', // Neutral 100
      dark: '#0F172A', // Neutral 950
    },
    text: {
      light: '#18181B', // Neutral 900
      dark: '#F8FAFC', // Neutral 50
    },
  },
  badges: {
    headerBadge: 'Docs',
    heroBadge: 'Portal CMS + Next.js App Router',
    sidebarBadge: 'v1.97.6',
  },
};

/**
 * Paleta de colores principal de la marca.
 */
export const defaultProductColors: ProductColors = {
  primary: '#07153A',
  secondary: '#1F3A70',
  accent: '#0085FF',
  text_main: '#18181B',
  bg_light: '#F4F4F5',
  bg_dark: '#0F172A',
};

/**
 * Mapeo de nombres descriptivos para tokens de diseño.
 */
export const defaultProductColorTokens: ProductColorTokens = {
  primary: 'Seidor Main',
  secondary: 'Seidor Hard',
  accent: 'Info main',
  bg_light: 'Neutral 100',
  text_main: 'Neutral 900',
};
