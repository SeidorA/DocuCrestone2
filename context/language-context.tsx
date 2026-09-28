'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'es' | 'en';

export const translations = {
  es: {
    nav: {
      home: 'Inicio',
      menu: 'Menú',
      docs: 'Documentación',
      search: 'Buscar en la documentación...',
      searchMobile: 'Buscar...',
      language: 'Idioma',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      themeSystem: 'Sistema',
      changeTheme: 'Cambiar tema',
      openMenu: 'Abrir menú',
      toggleSidebarHide: 'Ocultar menú lateral',
      toggleSidebarShow: 'Mostrar menú lateral',
    },
    docs: {
      onThisPage: 'En esta página',
      noSubtitles: 'No hay subtítulos en esta sección.',
      copyLink: 'Copiar enlace',
      linkCopied: 'Enlace copiado',
      backToTop: 'Volver arriba',
      collapseToc: 'Colapsar tabla de contenido',
      expandToc: 'Expandir tabla de contenido',
      readingTime: 'min de lectura',
      updated: 'Actualizado',
      previous: 'Anterior',
      next: 'Siguiente',
      home: 'Inicio Documentación',
      docsTitle: 'Documentación',
      notAvailable: 'Documentación no disponible',
      notAvailableDesc: 'No se encontraron documentos públicos en el CMS para este producto.',
    },
    search: {
      ariaLabel: 'Buscar en la documentación',
      placeholder: 'Buscar páginas, secciones o temas...',
      results: 'Resultados',
      recommended: 'Páginas recomendadas',
      noResults: 'No se encontraron resultados',
      tryAnother: 'Prueba buscando por otra palabra clave como "getting started" o "instalación"',
      navigate: 'Navegar',
      select: 'Seleccionar',
      docsCount: 'docs',
    },
    home: {
      goToDocs: 'Ir a la Documentación',
      exploreDocs: 'Explorar Documentación',
      copyright: 'Documentación técnica generada desde Portal CMS.',
    },
    faq: {
      title: 'Preguntas Frecuentes',
      subtitle: 'Encuentra respuestas rápidas a las dudas comunes sobre el producto y su documentación.',
      allCategories: 'Todas',
      searchPlaceholder: 'Buscar en preguntas frecuentes...',
      noResults: 'No se encontraron preguntas frecuentes.',
      askSupport: '¿No encontraste lo que buscabas?',
      contactSupport: 'Contactar a soporte',
    },
    index: {
      title: 'Índice de Documentación',
      subtitle: 'Explora todos los módulos, secciones y guías técnicas disponibles.',
      searchPlaceholder: 'Filtrar documentos por título o tema...',
      allModules: 'Todos los módulos',
      documentsCount: 'documentos',
      sectionsCount: 'secciones',
      noResults: 'No se encontraron documentos que coincidan con la búsqueda.',
      viewDocument: 'Ver documento',
      overview: 'Visión general',
    },
    releases: {
      title: 'Notas de la Versión',
      subtitle: 'Mantente al día de las últimas mejoras, funciones y correcciones de la plataforma. Esta sección ofrece una visión general cronológica de todas las actualizaciones, lo que te ayudará a seguir los cambios entre versiones y a comprender cómo cada lanzamiento mejora la funcionalidad, el rendimiento y la estabilidad.',
      searchPlaceholder: 'Buscar por versión o palabra clave...',
      allTags: 'Todas',
      latestBadge: 'Más reciente',
      highlights: 'Aspectos Destacados',
      features: 'Novedades',
      fixes: 'Correcciones de Errores',
      improvements: 'Mejoras',
      breakingChanges: 'Cambios Importantes',
      actionTab: 'Action',
      sliderTab: 'Slider',
      allFeaturesTitle: 'Todas las novedades de esta versión',
      downloadPdf: 'Descargar PDF',
      sidebarTitle: 'Release Notes',
      noReleases: 'No se encontraron notas de versión.',
      releasedOn: 'Lanzado el',
      readMore: 'Ver más',
      showLess: 'Mostrar menos',
      next: 'Siguiente',
      prev: 'Anterior',
    },
    blog: {
      title: 'Blog & Artículos',
      subtitle: 'Novedades, mejores prácticas, casos de uso y artículos técnicos sobre el producto.',
      searchPlaceholder: 'Buscar artículos por título o tema...',
      allCategories: 'Todas las categorías',
      readTime: 'min de lectura',
      readMore: 'Leer artículo',
      backToBlog: 'Volver a Artículos',
      publishedBy: 'Publicado por',
      publishedOn: 'Fecha de publicación',
      latest: 'Latest',
      tagsTitle: 'Etiquetas',
      allTags: 'Todas',
      articles: 'artículos',
      noFilteredPosts: 'No se encontraron artículos con el filtro seleccionado.',
      clearFilters: 'Limpiar filtros',
      noPosts: 'No se encontraron artículos publicados.',
      shareArticle: 'Compartir artículo',
    },
  },
  en: {
    nav: {
      home: 'Home',
      menu: 'Menu',
      docs: 'Documentation',
      search: 'Search documentation...',
      searchMobile: 'Search...',
      language: 'Language',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      changeTheme: 'Change theme',
      openMenu: 'Open menu',
      toggleSidebarHide: 'Hide sidebar',
      toggleSidebarShow: 'Show sidebar',
    },
    docs: {
      onThisPage: 'On this page',
      noSubtitles: 'No subtitles in this section.',
      copyLink: 'Copy link',
      linkCopied: 'Link copied',
      backToTop: 'Back to top',
      collapseToc: 'Collapse table of contents',
      expandToc: 'Expand table of contents',
      readingTime: 'min read',
      updated: 'Updated',
      previous: 'Previous',
      next: 'Next',
      home: 'Docs Home',
      docsTitle: 'Documentation',
      notAvailable: 'Documentation not available',
      notAvailableDesc: 'No public documents found in CMS for this product.',
    },
    search: {
      ariaLabel: 'Search documentation',
      placeholder: 'Search pages, sections or topics...',
      results: 'Results',
      recommended: 'Recommended pages',
      noResults: 'No results found',
      tryAnother: 'Try searching for another keyword like "getting started" or "installation"',
      navigate: 'Navigate',
      select: 'Select',
      docsCount: 'docs',
    },
    home: {
      goToDocs: 'Go to Documentation',
      exploreDocs: 'Explore Documentation',
      copyright: 'Technical documentation generated from Portal CMS.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find quick answers to common questions about the product and documentation.',
      allCategories: 'All',
      searchPlaceholder: 'Search frequently asked questions...',
      noResults: 'No frequently asked questions found.',
      askSupport: "Didn't find what you were looking for?",
      contactSupport: 'Contact support',
    },
    index: {
      title: 'Documentation Index',
      subtitle: 'Explore all available modules, sections, and technical guides.',
      searchPlaceholder: 'Filter documents by title or topic...',
      allModules: 'All modules',
      documentsCount: 'documents',
      sectionsCount: 'sections',
      noResults: 'No documents match your search.',
      viewDocument: 'View document',
      overview: 'Overview',
    },
    releases: {
      title: 'Release Notes',
      subtitle: 'Stay up to date with the latest improvements, features, and fixes. This section provides a chronological overview of all platform updates, helping you track changes across versions and understand how each release enhances functionality, performance, and stability.',
      searchPlaceholder: 'Search by version or keyword...',
      allTags: 'All',
      latestBadge: 'Latest',
      highlights: 'Key Highlights',
      features: 'New Features',
      fixes: 'Bug Fixes',
      improvements: 'Improvements',
      breakingChanges: 'Breaking Changes',
      actionTab: 'Action',
      sliderTab: 'Slider',
      allFeaturesTitle: 'All the features of this release',
      downloadPdf: 'Download PDF',
      sidebarTitle: 'Release Notes',
      noReleases: 'No release notes found.',
      releasedOn: 'Released on',
      readMore: 'Read more',
      showLess: 'Show less',
      next: 'Next',
      prev: 'Previous',
    },
    blog: {
      title: 'Blog & Insights',
      subtitle: 'News, best practices, deep-dives, and technical articles about the product.',
      searchPlaceholder: 'Search articles by title or keyword...',
      allCategories: 'All categories',
      readTime: 'min read',
      readMore: 'Read article',
      backToBlog: 'Back to Blog',
      publishedBy: 'Published by',
      publishedOn: 'Published date',
      latest: 'Latest',
      tagsTitle: 'Tags',
      allTags: 'All',
      articles: 'articles',
      noFilteredPosts: 'No articles found matching the selected filter.',
      clearFilters: 'Clear filters',
      noPosts: 'No articles published yet.',
      shareArticle: 'Share article',
    },
  },
};

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => { },
  t: (path: string, fallback?: string) => fallback || path,
});

const STORAGE_KEY = 'portal_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('es');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (savedLang === 'es' || savedLang === 'en') {
        setLanguageState(savedLang);
      } else {
        const browserLang = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
        setLanguageState(browserLang);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `portal_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  };

  const t = (path: string, fallback?: string): string => {
    const dict = translations[language] || translations.es;
    const parts = path.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'es' as Locale,
      setLanguage: () => { },
      t: (path: string, fallback?: string) => fallback || path,
    };
  }
  return context;
}
