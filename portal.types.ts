import { Icons } from 'iconcaral2';
import { FooterConfig } from './layout.types';

export interface ProductIconCaral {
  using_icon_caral?: boolean;
  name?: string;
  is_color?: boolean;
  icon_dark?: string;
}

export interface ProductColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  text_main?: string;
  bg_light?: string;
  bg_dark?: string;
}

export type ProductColorTokens = Record<string, string>;

export interface ProductIsologos {
  positive_bw?: string;
  negative_bw?: string;
  safety_zone_image?: string;
  isotype_info?: string;
  safety_zone_info?: string;
  positive_negative_info?: string;
}

export interface ProductDownloadableAsset {
  id: string;
  url: string;
  name: string;
  size?: string;
  format?: string;
}

export interface ProductBranding {
  favicon?: string;
  logo?: {
    light?: string; // URL o path relativo a la imagen del logo en modo claro
    dark?: string; // URL o path relativo a la imagen del logo en modo oscuro
    alt?: string;
    iconName?: Icons; // Icono de Caral fallback si no hay imagen de logo
    isBrand?: boolean; // Si el icono pertenece al set Brand de Caral
    isColor?: boolean;
  };
  colors: {
    primary: string; // Color principal de la marca (ej. #2563eb / azul)
    secondary: string; // Color secundario (ej. #4f46e5 / índigo)
    accent: string; // Color de acento (ej. #8b5cf6 / violeta)
    background: {
      light: string;
      dark: string;
    };
    text: {
      light: string;
      dark: string;
    };
  };
  badges?: {
    headerBadge?: string; // Ej: "Docs"
    heroBadge?: string; // Ej: "Portal CMS + Next.js App Router"
    sidebarBadge?: string; // Ej: "v2.0"
  };
}

export interface ProductFeature {
  title: string;
  description: string;
  icon: Icons;
}

export interface ProductFaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  question_es?: string;
  question_en?: string;
  answer_es?: string;
  answer_en?: string;
}

export interface ProductNavLink {
  label: string | { es?: string; en?: string };
  label_es?: string;
  label_en?: string;
  labelES?: string;
  labelEN?: string;
  href?: string;
  link?: string;
  external?: boolean;
}

export interface DiscoverCardItem {
  id?: string;
  title: string;
  description: string;
  icon?: Icons | string;
  href?: string;
  badge?: string;
}

export interface ConnectionItem {
  id?: string;
  label: string;
  brand?: string;
  icon?: Icons;
  logoUrl?: string;
}

export type HomeSectionType =
  | 'hero'
  | 'description'
  | 'discover'
  | 'connections'
  | 'faq'
  | 'index'
  | 'features'
  | 'custom';

export interface HomeSectionConfig {
  id: string;
  type: HomeSectionType;
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  headline?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imagesize?: string;
  imageSize?: string;
  exploreText?: string;
  exploreLink?: string;
  showIsometricGraphic?: boolean;
  ctaText?: string;
  ctaLink?: string;
  items?: any[];
}

export interface ReleaseItemDetail {
  id?: string;
  icon?: string;
  title?: string;
  title_es?: string;
  title_en?: string;
  description?: string;
  description_es?: string;
  description_en?: string;
  gifUrl?: string;
  pngUrl?: string;
  gifName?: string;
  pngName?: string;
  png_url?: string;
  gif_url?: string;
  image_url?: string;
  imageUrl?: string;
}

export type ReleaseFeatureItem = string | ReleaseItemDetail;

export interface ReleaseNoteItem {
  id?: string;
  version: string;
  title: string;
  title_es?: string;
  title_en?: string;
  date?: string;
  release_date?: string;
  tag?: 'Major' | 'Minor' | 'Patch' | 'Beta' | string;
  description?: string;
  description_es?: string;
  description_en?: string;
  content?: string;
  content_es?: string;
  content_en?: string;
  highlights?: ReleaseFeatureItem[];
  features?: ReleaseFeatureItem[];
  fixes?: ReleaseFeatureItem[];
  improvements?: ReleaseFeatureItem[];
  breaking_changes?: ReleaseFeatureItem[];
}

export interface BlogPostItem {
  id?: string;
  slug: string;
  title: string;
  title_es?: string;
  title_en?: string;
  description?: string;
  description_es?: string;
  description_en?: string;
  content?: string;
  content_es?: string;
  content_en?: string;
  cover_image?: string;
  coverImage?: string;
  coverimage?: string;
  cover_url?: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  author?:
    | {
        name: string;
        role?: string;
        avatar?: string;
      }
    | string;
  date?: string;
  published_at?: string;
  tags?: string[];
  category?: string;
  reading_time?: number;
}

export interface ProductConfig {
  /** Slug identificador del producto en Portal CMS */
  slug: string;
  /** Nombre o título del producto */
  title: string;
  title_es?: string;
  title_en?: string;
  /** Subtítulo o tagline corto */
  tagline?: string;
  /** Descripción general del producto (pestaña General de Producto) */
  description: string;
  description_es?: string;
  description_en?: string;
  /** Título y descripción para la sección Index / Docs (pestaña Index de CMS) */
  indexTitle?: string;
  indexTitle_es?: string;
  indexTitle_en?: string;
  indexDescription?: string;
  indexDescription_es?: string;
  indexDescription_en?: string;
  discoverTitle?: string;
  discoverTitle_es?: string;
  discoverTitle_en?: string;
  /** Versión de la documentación */
  version: string;
  /** Compañía u organización autora */
  author: string;
  /** URL pública de Portal CMS */
  portalUrl: string;
  /** URL base de la API de Portal */
  apiUrl: string;
  /** Favicon de la aplicación */
  favicon?: string;
  /** Configuración visual y branding */
  branding: ProductBranding;
  /** Enlaces de navegación del header */
  navLinks?: ProductNavLink[];
  /** Paleta de colores recibida desde Portal CMS */
  colors?: ProductColors;
  /** Tokens de color recibidos desde Portal CMS */
  colorTokens?: ProductColorTokens;
  /** Isologos e información de zona de seguridad */
  isologos?: ProductIsologos;
  /** Información tipográfica */
  typographyInfo?: string;
  /** Información general de marca */
  brandInfo?: string;
  /** Imágenes de portada */
  coverImages?: string[];
  /** Recursos descargables de marca */
  downloadableAssets?: ProductDownloadableAsset[];
  /** Módulo gráfico habilitado */
  enableGraphicModule?: boolean;
  /** Configuración de icono Caral */
  iconCaral?: ProductIconCaral;
  /** Tarjetas destacadas 'Discover' para el template */
  discoverItems?: DiscoverCardItem[];
  /** Conexiones e integraciones soportadas */
  connections?: ConnectionItem[];
  /** Lista ordenada de secciones modulares para la página de inicio */
  homeSections?: HomeSectionConfig[];
  /** Características destacadas para la landing page */
  features: ProductFeature[];
  /** Preguntas frecuentes iniciales o fallback */
  faq: ProductFaqItem[];
  /** Notas de versiones (Release Notes) */
  releases?: ReleaseNoteItem[];
  /** Publicaciones del Blog */
  blogPosts?: BlogPostItem[];
  /** Configuración de cabecera para Release Notes */
  releaseNotesConfig?: {
    title?: string;
    description?: string;
  };
  /** Configuración de cabecera para Blog */
  blogConfig?: {
    title?: string;
    description?: string;
  };
  /** Personalizaciones del pie de página */
  footer?: FooterConfig;
}
