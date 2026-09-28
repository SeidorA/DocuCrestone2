import {
  defaultProductConfig,
  ProductConfig,
  ProductBranding,
  ProductFeature,
  ProductFaqItem,
  ProductIconCaral,
  ProductColors,
  ProductColorTokens,
  ProductIsologos,
  ProductDownloadableAsset,
  ProductNavLink,
  DiscoverCardItem,
  ConnectionItem,
  HomeSectionConfig,
} from '@/portal.config';
import { getLocalizedText, getLocalizedItemTitle, slugify } from './utils';

export type {
  ProductIconCaral,
  ProductColors,
  ProductColorTokens,
  ProductIsologos,
  ProductDownloadableAsset,
  ProductNavLink,
  DiscoverCardItem,
  ConnectionItem,
  HomeSectionConfig,
};

export interface ProductCustomization {
  branding?: Partial<ProductBranding>;
  navLinks?: ProductNavLink[];
  discoverItems?: DiscoverCardItem[];
  connections?: ConnectionItem[];
  homeSections?: HomeSectionConfig[];
  faq?: ProductFaqItem[];
  features?: ProductFeature[];
  extra?: Record<string, unknown>;
}

export interface Product {
  id: string;
  title: string;
  title_es?: string;
  title_en?: string;
  slug: string;
  version?: string;
  description: string;
  description_es?: string;
  description_en?: string;
  icon_name?: string;
  logo_light?: string;
  logo_dark?: string;
  favicon?: string;
  icon_caral?: ProductIconCaral;
  colors?: ProductColors;
  color_tokens?: ProductColorTokens;
  isologos?: ProductIsologos;
  typography_info?: string;
  brand_info?: string;
  cover_images?: string[];
  downloadable_assets?: ProductDownloadableAsset[];
  enable_graphic_module?: boolean;
  faq?: ProductFaqItem[];
  features?: ProductFeature[];
  customization?: ProductCustomization;
}

export interface Module {
  id: string;
  title: string;
  title_es?: string;
  title_en?: string;
  slug: string | null;
  order_index: number;
  is_hidden: boolean;
  allowed_roles?: string[];
}

export interface NavigationItem {
  id: string;
  title: string;
  sidebar_title?: string;
  sidebar_name?: string;
  title_es?: string;
  title_en?: string;
  slug?: string | null;
  type?: 'document' | 'section' | string;
  icon_name?: string;
  order_index?: number;
  url?: string;
  items?: NavigationItem[];
}

export interface DocumentItem {
  id: string;
  product_id?: string;
  module_id?: string;
  title: string;
  title_es?: string;
  title_en?: string;
  sidebar_title?: string;
  sidebar_name?: string;
  slug: string;
  content: string;
  status?: string;
  section?: string;
  order_index?: number;
  icon_name?: string;
  type?: string;
  description?: string;
  description_es?: string;
  description_en?: string;
  created_at?: string;
  updated_at?: string;
  product?: Product;
}

export interface TechnicalDocsIndexEntry {
  id?: string;
  docId?: string;
  title: string;
  docSlug?: string;
  docTitle?: string;
  description: string;
  icon?: string;
}

export interface TechnicalDocsIndexLang {
  title?: string;
  description?: string;
  discoverTitle?: string;
}

export interface TechnicalDocsIndex {
  en?: TechnicalDocsIndexLang;
  es?: TechnicalDocsIndexLang;
  entries?: TechnicalDocsIndexEntry[];
}

export interface TechnicalDocsFaqLang {
  title?: string;
  description?: string;
}

export interface TechnicalDocsFaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

export interface TechnicalDocsFaq {
  en?: TechnicalDocsFaqLang;
  es?: TechnicalDocsFaqLang;
  items?: TechnicalDocsFaqItem[];
}

export interface TechnicalDocs {
  index?: TechnicalDocsIndex;
  faq?: TechnicalDocsFaq;
  blog?: any;
  releases?: any;
}

export interface DocsApiResponse {
  success: boolean;
  product: Product;
  modules: Module[];
  navigation: NavigationItem[];
  total_documents: number;
  documents: DocumentItem[];
  technical_docs?: TechnicalDocs;
  error?: string;
  message?: string;
}

export interface DocDetailResponse {
  success: boolean;
  document: DocumentItem;
  error?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || process.env.NEXT_PUBLIC_PORTAL_API || '';
const PRODUCT_SLUG = process.env.NEXT_PUBLIC_PRODUCT_SLUG || 'docuportal';

/**
 * Formats a module/version title, replacing any generic "Current" / "Curren"
 * with the product name and current version (e.g. "DocuPortal 1.0").
 */
export function formatModuleTitle(
  title: string | undefined | null,
  productTitle = 'DocuPortal',
  productVersion = '1.0'
): string {
  if (!title) return `${productTitle} ${productVersion}`.trim();
  const trimmed = title.trim();
  if (trimmed.toLowerCase() === 'current' || trimmed.toLowerCase() === 'curren') {
    return `${productTitle} ${productVersion}`.trim();
  }
  return trimmed;
}

/**
 * Normalizes all module and navigation titles in a DocsApiResponse,
 * replacing "Current" with "[ProductTitle] [Version]".
 */
export function normalizeDocsData(data: DocsApiResponse): DocsApiResponse {
  if (!data) return data;

  const productTitle = data.product?.title || defaultProductConfig.title;
  const productVersion = data.product?.version || defaultProductConfig.version;

  const normalizeItem = (item: NavigationItem): NavigationItem => ({
    ...item,
    title: item.type === 'section' || item.type === 'document' ? item.title : formatModuleTitle(item.title, productTitle, productVersion),
    items: item.items ? item.items.map(normalizeItem) : undefined,
  });

  const normalizedModules = (data.modules || []).map((mod) => ({
    ...mod,
    title: formatModuleTitle(mod.title, productTitle, productVersion),
  }));

  const normalizedNav = (data.navigation || []).map((navMod) => ({
    ...navMod,
    title: formatModuleTitle(navMod.title, productTitle, productVersion),
    items: navMod.items ? navMod.items.map(normalizeItem) : undefined,
  }));

  return {
    ...data,
    modules: normalizedModules,
    navigation: normalizedNav,
  };
}

/**
 * Combines default static config with potential CMS customizations and API branding.
 */
export function resolveProductConfig(
  cmsProduct?: Partial<Product>,
  technicalDocs?: TechnicalDocs
): ProductConfig {
  if (!cmsProduct && !technicalDocs) return defaultProductConfig;

  const custom = cmsProduct?.customization || {};

  const logoLight =
    cmsProduct?.logo_light ||
    custom.branding?.logo?.light ||
    defaultProductConfig.branding.logo?.light;

  const logoDark =
    cmsProduct?.logo_dark ||
    custom.branding?.logo?.dark ||
    defaultProductConfig.branding.logo?.dark;

  const favicon =
    cmsProduct?.favicon ||
    custom.branding?.favicon ||
    defaultProductConfig.branding.favicon;

  const isBrandIcon =
    cmsProduct?.icon_caral?.using_icon_caral ??
    custom.branding?.logo?.isBrand ??
    defaultProductConfig.branding.logo?.isBrand;

  const iconName =
    (cmsProduct?.icon_caral?.name as any) ||
    (cmsProduct?.icon_name as any) ||
    custom.branding?.logo?.iconName ||
    defaultProductConfig.branding.logo?.iconName;

  const productVersion = cmsProduct?.version || defaultProductConfig.version;

  // General Product Description (from Product Edit modal, used in Hero)
  const productDesc = cmsProduct?.description || defaultProductConfig.description;
  const productDescEs = cmsProduct?.description_es;
  const productDescEn = cmsProduct?.description_en;

  // Technical docs index overrides (from Index tab in CMS, used in Description & Discover sections)
  const indexDoc = technicalDocs?.index;
  const indexTitle = indexDoc?.en?.title || indexDoc?.es?.title || `${cmsProduct?.title || defaultProductConfig.title} Docs`;
  const indexTitleEs = indexDoc?.es?.title;
  const indexTitleEn = indexDoc?.en?.title;

  const indexDesc =
    indexDoc?.en?.description ||
    indexDoc?.es?.description ||
    productDesc;
  const indexDescEs = indexDoc?.es?.description || productDescEs;
  const indexDescEn = indexDoc?.en?.description || productDescEn;

  const discoverTitle =
    indexDoc?.en?.discoverTitle ||
    indexDoc?.es?.discoverTitle ||
    `Discover ${cmsProduct?.title || defaultProductConfig.title}`;
  const discoverTitleEs = indexDoc?.es?.discoverTitle;
  const discoverTitleEn = indexDoc?.en?.discoverTitle;

  // Map discover entries from technical_docs.index
  let discoverItems = defaultProductConfig.discoverItems;
  if (indexDoc?.entries && Array.isArray(indexDoc.entries)) {
    discoverItems = indexDoc.entries.map((entry) => {
      const lower = (entry.title || '').toLowerCase();
      let icon = entry.icon || 'cubeInCube';
      if (lower.includes('source')) icon = 'planeDeparture';
      else if (lower.includes('destin')) icon = 'planeArrival';
      else if (lower.includes('node')) icon = 'cubeInCube';
      else if (lower.includes('job')) icon = 'network';
      else if (lower.includes('workspace')) icon = 'puzzle';
      else if (lower.includes('monitor')) icon = 'presentationScreenChart';

      return {
        id: entry.id,
        title: entry.title,
        description: entry.description,
        href: entry.docSlug ? `/documentation/${entry.docSlug}` : '/documentation',
        icon: icon as any,
      };
    });
  } else if (custom.discoverItems) {
    discoverItems = custom.discoverItems;
  }

  // Map FAQ items from technical_docs.faq
  const faqDoc = technicalDocs?.faq;
  let faqItems = cmsProduct?.faq || custom.faq || defaultProductConfig.faq;
  if (faqDoc?.items && Array.isArray(faqDoc.items) && faqDoc.items.length > 0) {
    faqItems = faqDoc.items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category || 'General',
    }));
  }

  // Map Releases from technical_docs.releases
  const releasesDoc = technicalDocs?.releases;
  let rawReleasesList: any[] = [];
  if (Array.isArray(releasesDoc) && releasesDoc.length > 0) {
    rawReleasesList = releasesDoc;
  } else if (releasesDoc && typeof releasesDoc === 'object' && Array.isArray(releasesDoc.items) && releasesDoc.items.length > 0) {
    rawReleasesList = releasesDoc.items;
  }

  let releasesList = defaultProductConfig.releases || [];
  if (rawReleasesList.length > 0) {
    releasesList = rawReleasesList.map((item: any, idx: number) => ({
      id: item.id || `rel-${idx}`,
      version: item.version || item.tag_name || item.v || `v1.${idx}.0`,
      title: item.title || item.name || item.version || 'Release',
      title_es: item.title_es,
      title_en: item.title_en,
      date: item.date || item.release_date || item.published_at || item.created_at,
      release_date: item.release_date || item.date,
      tag: item.tag || item.type,
      description: item.description || item.summary || item.desc,
      description_es: item.description_es,
      description_en: item.description_en,
      content: item.content || item.body || item.markdown,
      content_es: item.content_es,
      content_en: item.content_en,
      highlights: Array.isArray(item.highlights)
        ? item.highlights
        : typeof item.highlights === 'string'
        ? item.highlights.split('\n').filter(Boolean)
        : undefined,
      features: Array.isArray(item.features)
        ? item.features
        : typeof item.features === 'string'
        ? item.features.split('\n').filter(Boolean)
        : undefined,
      fixes: Array.isArray(item.fixes)
        ? item.fixes
        : typeof item.fixes === 'string'
        ? item.fixes.split('\n').filter(Boolean)
        : undefined,
      improvements: Array.isArray(item.improvements)
        ? item.improvements
        : typeof item.improvements === 'string'
        ? item.improvements.split('\n').filter(Boolean)
        : undefined,
      breaking_changes: Array.isArray(item.breaking_changes)
        ? item.breaking_changes
        : typeof item.breaking_changes === 'string'
        ? item.breaking_changes.split('\n').filter(Boolean)
        : undefined,
    }));
  }

  // Map Blog Posts from technical_docs.blog
  const blogDoc = technicalDocs?.blog;
  let rawBlogList: any[] = [];
  if (Array.isArray(blogDoc) && blogDoc.length > 0) {
    rawBlogList = blogDoc;
  } else if (blogDoc && typeof blogDoc === 'object' && Array.isArray(blogDoc.items) && blogDoc.items.length > 0) {
    rawBlogList = blogDoc.items;
  }

  let blogList = defaultProductConfig.blogPosts || [];
  if (rawBlogList.length > 0) {
    blogList = rawBlogList.map((item: any, idx: number) => {
      const slug =
        item.slug ||
        (item.title ? item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') : `article-${idx}`);
      
      let author = item.author;
      if (typeof author === 'string') {
        author = { name: author, avatar: `/haz/a.png` };
      } else if (!author) {
        author = { name: item.author_name || cmsProduct?.title || 'SEIDOR', avatar: `/haz/a.png` };
      }

      const cover_image =
        item.cover_image ||
        item.coverimage ||
        item.coverImage ||
        item.cover_image_url ||
        item.coverImageUrl ||
        item.cover_url ||
        item.coverUrl ||
        item.cover ||
        item.image ||
        item.imageUrl ||
        item.image_url ||
        item.thumbnail ||
        (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : undefined);

      return {
        id: item.id || `post-${idx}`,
        slug,
        title: item.title || item.name || 'Article',
        title_es: item.title_es,
        title_en: item.title_en,
        description: item.description || item.summary || item.excerpt,
        description_es: item.description_es,
        description_en: item.description_en,
        content: item.content || item.body || item.markdown || item.description,
        content_es: item.content_es,
        content_en: item.content_en,
        cover_image,
        coverImage: cover_image,
        coverimage: cover_image,
        image: cover_image,
        imageUrl: cover_image,
        author,
        date: item.date || item.published_at || item.created_at,
        published_at: item.published_at || item.date,
        tags: Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
          ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
        category: item.category || item.cat || 'General',
        reading_time: item.reading_time || Math.max(1, Math.ceil((item.content || item.description || '').split(/\s+/).length / 200)),
      };
    });
  }

  return {
    ...defaultProductConfig,
    title: cmsProduct?.title || defaultProductConfig.title,
    title_es: cmsProduct?.title_es,
    title_en: cmsProduct?.title_en,
    description: productDesc,
    description_es: productDescEs,
    description_en: productDescEn,
    indexTitle,
    indexTitle_es: indexTitleEs,
    indexTitle_en: indexTitleEn,
    indexDescription: indexDesc,
    indexDescription_es: indexDescEs,
    indexDescription_en: indexDescEn,
    discoverTitle,
    discoverTitle_es: discoverTitleEs,
    discoverTitle_en: discoverTitleEn,
    slug: cmsProduct?.slug || defaultProductConfig.slug,
    version: productVersion,
    favicon,
    branding: {
      ...defaultProductConfig.branding,
      ...(custom.branding || {}),
      favicon,
      logo: {
        ...defaultProductConfig.branding.logo,
        light: logoLight,
        dark: logoDark,
        alt: cmsProduct?.title || defaultProductConfig.branding.logo?.alt,
        iconName: iconName,
        isBrand: isBrandIcon,
        isColor:
          cmsProduct?.icon_caral?.is_color ??
          defaultProductConfig.branding.logo?.isColor,
        ...(custom.branding?.logo || {}),
      },
      colors: {
        ...defaultProductConfig.branding.colors,
        primary: cmsProduct?.colors?.primary || defaultProductConfig.branding.colors.primary,
        secondary: cmsProduct?.colors?.secondary || defaultProductConfig.branding.colors.secondary,
        accent: cmsProduct?.colors?.accent || defaultProductConfig.branding.colors.accent,
        background: {
          light: cmsProduct?.colors?.bg_light || defaultProductConfig.branding.colors.background.light,
          dark: cmsProduct?.colors?.bg_dark || defaultProductConfig.branding.colors.background.dark,
        },
        text: {
          light: cmsProduct?.colors?.text_main || defaultProductConfig.branding.colors.text.light,
          dark: defaultProductConfig.branding.colors.text.dark,
        },
        ...(custom.branding?.colors || {}),
      },
      badges: {
        ...defaultProductConfig.branding.badges,
        headerBadge:
          custom.branding?.badges?.headerBadge ||
          productVersion ||
          defaultProductConfig.branding.badges?.headerBadge,
        sidebarBadge:
          custom.branding?.badges?.sidebarBadge ||
          productVersion ||
          defaultProductConfig.branding.badges?.sidebarBadge,
        ...(custom.branding?.badges || {}),
      },
    },
    colors: cmsProduct?.colors || defaultProductConfig.colors,
    colorTokens: cmsProduct?.color_tokens || defaultProductConfig.colorTokens,
    isologos: cmsProduct?.isologos || defaultProductConfig.isologos,
    typographyInfo: cmsProduct?.typography_info || defaultProductConfig.typographyInfo,
    brandInfo: cmsProduct?.brand_info || defaultProductConfig.brandInfo,
    coverImages: cmsProduct?.cover_images || defaultProductConfig.coverImages,
    downloadableAssets:
      cmsProduct?.downloadable_assets || defaultProductConfig.downloadableAssets,
    iconCaral: cmsProduct?.icon_caral || defaultProductConfig.iconCaral,
    navLinks: custom.navLinks || defaultProductConfig.navLinks,
    discoverItems: discoverItems,
    connections: custom.connections || defaultProductConfig.connections,
    homeSections: custom.homeSections || defaultProductConfig.homeSections,
    features: cmsProduct?.features || custom.features || defaultProductConfig.features,
    faq: faqItems,
    releases: releasesList,
    blogPosts: blogList,
    releaseNotesConfig: {
      title: releasesDoc?.en?.title || releasesDoc?.es?.title,
      description: releasesDoc?.en?.description || releasesDoc?.es?.description,
    },
    blogConfig: {
      title: blogDoc?.en?.title || blogDoc?.es?.title,
      description: blogDoc?.en?.description || blogDoc?.es?.description,
    },
  };
}

/**
 * Fetches the entire navigation tree and documents for the configured product.
 * In development mode, bypasses cache (no-store) for instant CMS reflection.
 * Falls back to local data/docs-cache.json if API is unreachable.
 */
export async function getDocumentationData(
  productSlug = PRODUCT_SLUG
): Promise<DocsApiResponse | null> {
  const isDev = process.env.NODE_ENV === 'development';
  const fetchOptions: RequestInit = isDev
    ? { cache: 'no-store' }
    : { next: { tags: ['portal-docs', `docs-${productSlug}`], revalidate: 86400 } };

  if (API_BASE_URL) {
    try {
      const [docsRes, blogRes, releasesRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/public/docs?product=${encodeURIComponent(productSlug)}&include_content=true`,
          fetchOptions
        ).catch(() => null),
        fetch(
          `${API_BASE_URL}/api/public/blog?product=${encodeURIComponent(productSlug)}`,
          fetchOptions
        ).catch(() => null),
        fetch(
          `${API_BASE_URL}/api/public/releases?product=${encodeURIComponent(productSlug)}`,
          fetchOptions
        ).catch(() => null),
      ]);

      if (docsRes && docsRes.ok) {
        const data: DocsApiResponse = await docsRes.json();

        if (!data.technical_docs) {
          data.technical_docs = {};
        }

        // If blog was not in technical_docs or was empty, check blog endpoint
        if (
          (!data.technical_docs.blog ||
            (Array.isArray(data.technical_docs.blog) && data.technical_docs.blog.length === 0)) &&
          blogRes &&
          blogRes.ok
        ) {
          try {
            const blogData = await blogRes.json();
            if (blogData && Array.isArray(blogData.posts) && blogData.posts.length > 0) {
              data.technical_docs.blog = blogData.posts;
            }
          } catch {
            // Ignore blog parse error
          }
        }

        // If releases was not in technical_docs or was empty, check releases endpoint
        if (
          (!data.technical_docs.releases ||
            (Array.isArray(data.technical_docs.releases) && data.technical_docs.releases.length === 0)) &&
          releasesRes &&
          releasesRes.ok
        ) {
          try {
            const relData = await releasesRes.json();
            if (relData && Array.isArray(relData.releases) && relData.releases.length > 0) {
              data.technical_docs.releases = relData.releases;
            }
          } catch {
            // Ignore releases parse error
          }
        }

        return normalizeDocsData(data);
      }
    } catch (error) {
      console.warn('API de Portal no disponible en vivo, intentando cargar caché local...');
    }
  }

  // Fallback a caché local data/docs-cache.json (solo en entorno Servidor)
  if (typeof window === 'undefined') {
    try {
      const fsMod = 'fs';
      const pathMod = 'path';
      const fs = await import(/* webpackIgnore: true */ fsMod);
      const path = await import(/* webpackIgnore: true */ pathMod);
      const cachePath = path.join(process.cwd(), 'data', 'docs-cache.json');
      if (fs.existsSync(cachePath)) {
        const content = fs.readFileSync(cachePath, 'utf8');
        const data = JSON.parse(content) as DocsApiResponse;
        return normalizeDocsData(data);
      }
    } catch (cacheErr) {
      console.error('Error leyendo caché local de documentación:', cacheErr);
    }
  }

  return null;
}

/**
 * Fetches a single document by slug.
 */
export async function getDocumentBySlug(
  slug: string,
  productSlug = PRODUCT_SLUG
): Promise<DocumentItem | null> {
  const isDev = process.env.NODE_ENV === 'development';
  const fetchOptions: RequestInit = isDev
    ? { cache: 'no-store' }
    : { next: { tags: ['portal-docs', `doc-${slug}`], revalidate: 86400 } };

  if (API_BASE_URL) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/docs/${encodeURIComponent(slug)}?product=${encodeURIComponent(productSlug)}`,
        fetchOptions
      );

      if (res.ok) {
        const data: DocDetailResponse = await res.json();
        if (data.success && data.document) {
          return data.document;
        }
      }
    } catch (error) {
      // Si la llamada individual falla, buscamos en los datos generales
    }
  }

  // Fallback: search in full docs list (que ya tiene fallback a cache)
  const fullData = await getDocumentationData(productSlug);
  if (fullData?.documents) {
    const doc = fullData.documents.find((d) => d.slug === slug);
    if (doc) return doc;
  }
  return null;
}

export interface FlatDocItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  icon_name?: string;
  sectionTitle?: string;
  moduleTitle?: string;
}

/**
 * Recursively flattens the navigation tree into an ordered list of document items.
 */
export function flattenNavigation(
  items: NavigationItem[],
  moduleTitle = '',
  sectionTitle = ''
): FlatDocItem[] {
  let list: FlatDocItem[] = [];

  for (const item of items) {
    const currentModule = item.type === undefined && item.items ? item.title : moduleTitle;
    const currentSection = item.type === 'section' ? item.title : sectionTitle;

    if (item.type === 'document' && item.slug) {
      list.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        url: item.url ? item.url.replace(/^\/docs\//, '/documentation/') : `/documentation/${item.slug}`,
        icon_name: item.icon_name,
        sectionTitle: currentSection,
        moduleTitle: currentModule,
      });
    }

    if (item.items && item.items.length > 0) {
      list = list.concat(
        flattenNavigation(
          item.items,
          currentModule,
          item.type === 'section' ? item.title : currentSection
        )
      );
    }
  }

  return list;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface DocNavigationContext {
  prevDoc: FlatDocItem | null;
  nextDoc: FlatDocItem | null;
  breadcrumbs: BreadcrumbItem[];
  allFlatDocs: FlatDocItem[];
}

/**
 * Finds previous, next, and breadcrumbs for a given document slug.
 */
export function getDocNavigationContext(
  navigation: NavigationItem[],
  currentSlug: string
): DocNavigationContext {
  const flatDocs = flattenNavigation(navigation);
  const currentIndex = flatDocs.findIndex((doc) => doc.slug === currentSlug);

  const prevDoc = currentIndex > 0 ? flatDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex >= 0 && currentIndex < flatDocs.length - 1
      ? flatDocs[currentIndex + 1]
      : null;

  const currentDoc = currentIndex >= 0 ? flatDocs[currentIndex] : null;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Documentación', href: '/documentation' },
  ];

  if (currentDoc) {
    if (currentDoc.moduleTitle && currentDoc.moduleTitle !== 'Documentation') {
      breadcrumbs.push({ title: currentDoc.moduleTitle });
    }
    if (
      currentDoc.sectionTitle &&
      currentDoc.sectionTitle !== 'General' &&
      currentDoc.sectionTitle.trim().toLowerCase() !== currentDoc.title.trim().toLowerCase()
    ) {
      breadcrumbs.push({ title: currentDoc.sectionTitle });
    }
    breadcrumbs.push({ title: currentDoc.title });
  }

  return {
    prevDoc,
    nextDoc,
    breadcrumbs,
    allFlatDocs: flatDocs,
  };
}

/**
 * Helper to identify if the first child document corresponds to the section's index document.
 * (e.g. child has slug "index", "overview", or title matching section title across languages).
 */
export function getSectionIndexDoc(section: NavigationItem): NavigationItem | null {
  if (!section.items || section.items.length === 0) return null;
  const firstChild = section.items[0];
  if (firstChild.type === 'document' || firstChild.slug) {
    const childSlug = (firstChild.slug || '').toLowerCase().trim();
    const sectionSlug = (section.slug || '').toLowerCase().trim();

    // 1. Direct slug matches
    const isIndexSlug =
      childSlug === 'index' ||
      childSlug === 'overview' ||
      childSlug === 'intro' ||
      childSlug === 'introduction';

    const isMatchingSectionSlug =
      Boolean(sectionSlug) &&
      (childSlug === sectionSlug ||
        childSlug === `${sectionSlug}-overview` ||
        childSlug === `${sectionSlug}-index` ||
        childSlug === `${sectionSlug}-intro` ||
        childSlug === `${sectionSlug}-introduction`);

    // 2. Multilingual / localized title matches
    const firstChildTitleEs = getLocalizedItemTitle(firstChild, 'es').trim().toLowerCase();
    const sectionTitleEs = getLocalizedItemTitle(section, 'es').trim().toLowerCase();
    const isMatchingTitleEs = Boolean(
      firstChildTitleEs && sectionTitleEs && firstChildTitleEs === sectionTitleEs
    );

    const firstChildTitleEn = getLocalizedItemTitle(firstChild, 'en').trim().toLowerCase();
    const sectionTitleEn = getLocalizedItemTitle(section, 'en').trim().toLowerCase();
    const isMatchingTitleEn = Boolean(
      firstChildTitleEn && sectionTitleEn && firstChildTitleEn === sectionTitleEn
    );

    // 3. Raw title stripped or slugified match
    const isMatchingRawTitle =
      typeof firstChild.title === 'string' &&
      typeof section.title === 'string' &&
      firstChild.title.trim().toLowerCase() === section.title.trim().toLowerCase();

    const isMatchingSlugifiedTitle =
      Boolean(firstChildTitleEs && sectionSlug && slugify(firstChildTitleEs) === sectionSlug) ||
      Boolean(firstChildTitleEn && sectionSlug && slugify(firstChildTitleEn) === sectionSlug);

    if (
      isIndexSlug ||
      isMatchingSectionSlug ||
      isMatchingTitleEs ||
      isMatchingTitleEn ||
      isMatchingRawTitle ||
      isMatchingSlugifiedTitle
    ) {
      return firstChild;
    }
  }
  return null;
}

/**
 * Recursively finds a NavigationItem matching a slug in the navigation tree.
 */
export function findNavigationItemBySlug(
  items: NavigationItem[],
  slug: string
): NavigationItem | null {
  const targetSlug = slug.toLowerCase().trim();
  for (const item of items) {
    const itemSlug = (item.slug || '').toLowerCase().trim();
    if (itemSlug === targetSlug) {
      return item;
    }
    if (item.items && item.items.length > 0) {
      const found = findNavigationItemBySlug(item.items, slug);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively looks for a section matching the given slug that has a dedicated index document.
 */
export function findSectionIndexDocBySlug(
  items: NavigationItem[],
  slug: string
): NavigationItem | null {
  const targetSlug = slug.toLowerCase().trim();
  for (const item of items) {
    const itemSlug = (item.slug || '').toLowerCase().trim();
    const isMatchingSection =
      itemSlug === targetSlug ||
      slugify(getLocalizedItemTitle(item, 'es')) === targetSlug ||
      slugify(getLocalizedItemTitle(item, 'en')) === targetSlug;

    if (isMatchingSection && item.items && item.items.length > 0) {
      const indexDoc = getSectionIndexDoc(item);
      if (indexDoc && indexDoc.slug && indexDoc.slug.toLowerCase().trim() !== targetSlug) {
        return indexDoc;
      }
    }
    if (item.items) {
      const found = findSectionIndexDocBySlug(item.items, slug);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the section children items for a given document or section slug.
 * - If the slug corresponds to a section with items, returns those items (excluding index doc).
 * - If the slug is a document inside a section, returns the parent section's items (excluding this doc).
 */
export function getSectionChildrenForSlug(
  navigation: NavigationItem[],
  slug: string
): NavigationItem[] {
  if (!navigation || navigation.length === 0 || !slug) return [];

  // 1. Direct match: is the slug itself a section with items?
  const directItem = findNavigationItemBySlug(navigation, slug);
  if (directItem?.items && directItem.items.length > 0) {
    return directItem.items.filter((child) => child.slug !== slug);
  }

  // 2. Parent match: find the parent section containing this slug
  function findParent(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        if (item.items.some((child) => child.slug === slug || child.id === slug)) {
          return item;
        }
        const deepFound = findParent(item.items);
        if (deepFound) return deepFound;
      }
    }
    return null;
  }

  const parent = findParent(navigation);
  if (parent?.items && parent.items.length > 0) {
    return parent.items.filter((child) => child.slug !== slug);
  }

  return [];
}

/**
 * Finds items for a named section (by slug, title, or id).
 */
export function findSectionItems(
  navigation: NavigationItem[],
  sectionSlugOrName: string
): NavigationItem[] {
  if (!navigation || !sectionSlugOrName) return [];
  const normalized = sectionSlugOrName.trim().toLowerCase();

  function search(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (
        item.slug?.toLowerCase() === normalized ||
        item.title?.toLowerCase() === normalized ||
        item.id === sectionSlugOrName
      ) {
        return item;
      }
      if (item.items && item.items.length > 0) {
        const found = search(item.items);
        if (found) return found;
      }
    }
    return null;
  }

  const found = search(navigation);
  if (found?.items && found.items.length > 0) {
    return found.items.filter(
      (child) =>
        child.slug !== found.slug &&
        child.slug !== 'index' &&
        child.slug !== `${found.slug}-overview`
    );
  }
  return [];
}



