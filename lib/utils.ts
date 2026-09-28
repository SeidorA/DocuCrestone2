export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Generates an anchor slug from a heading string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts Table of Contents headings (h2, h3) from markdown content.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  if (!markdown) return [];

  // Remove code blocks first to avoid picking up markdown headings inside code snippets
  const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, '');

  const lines = cleanMarkdown.split('\n');
  const headings: TocHeading[] = [];
  const seenSlugs = new Map<string, number>();

  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      // Strip formatting like bold, italic, links from heading text
      const rawText = match[2]
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();

      if (!rawText) continue;

      let id = slugify(rawText);
      if (!id) id = `heading-${headings.length + 1}`;

      const count = seenSlugs.get(id) || 0;
      seenSlugs.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count}`;
      }

      headings.push({
        id,
        text: rawText,
        level,
      });
    }
  }

  return headings;
}

/**
 * Parses markdown that might have multilingual delimiter sections like:
 * ---
 * es
 * ---
 * [content]
 * ---
 * en
 * ---
 */
export function parseMultilingualMarkdown(
  markdown: string,
  preferredLang: 'es' | 'en' = 'es'
): { content: string; availableLanguages: ('es' | 'en')[] } {
  if (!markdown) return { content: '', availableLanguages: [] };

  const pattern = /---\s*\r?\n\s*(es|en)\s*\r?\n\s*---/gi;
  const matches = [...markdown.matchAll(pattern)];

  if (matches.length === 0) {
    return { content: markdown, availableLanguages: [] };
  }

  const sections: { lang: 'es' | 'en'; content: string }[] = [];
  const availableLanguages: ('es' | 'en')[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const lang = match[1].toLowerCase() as 'es' | 'en';
    if (!availableLanguages.includes(lang)) {
      availableLanguages.push(lang);
    }

    const startIndex = match.index! + match[0].length;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? nextMatch.index! : markdown.length;

    const sectionContent = markdown.slice(startIndex, endIndex).trim();
    sections.push({ lang, content: sectionContent });
  }

  // Find preferred language section, fallback to first non-empty section
  const preferredSection = sections.find(
    (s) => s.lang === preferredLang && s.content.length > 0
  );
  if (preferredSection) {
    return { content: preferredSection.content, availableLanguages };
  }

  const firstValid = sections.find((s) => s.content.length > 0);
  if (firstValid) {
    return { content: firstValid.content, availableLanguages };
  }

  return { content: markdown, availableLanguages };
}

/**
 * Extracts a localized string from a value that may be:
 * - A multilingual string with delimiters (--- es --- ... --- en --- ...)
 * - An object { es?: string, en?: string }
 * - A plain string
 */
export function getLocalizedText(
  value: string | { es?: string; en?: string } | Record<string, any> | undefined | null,
  preferredLang: 'es' | 'en' = 'es',
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'object') {
    const localized = value[preferredLang] || value.es || value.en;
    if (typeof localized === 'string' && localized.trim()) {
      return getLocalizedText(localized, preferredLang, fallback);
    }
    return fallback;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/---\s*\r?\n\s*(?:es|en)\s*\r?\n\s*---/i.test(trimmed)) {
      const parsed = parseMultilingualMarkdown(trimmed, preferredLang);
      return parsed.content.trim() || fallback;
    }
    return trimmed || fallback;
  }
  return String(value);
}

/**
 * Extracts the first H1 heading from a markdown string.
 */
export function extractFirstH1(markdown: string): string | null {
  if (!markdown) return null;
  // Remove code blocks first
  const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, '');
  const match = cleanMarkdown.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1]
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^!(?:icon|brand)-[\w-]+!\s*/i, '')
      .trim();
  }
  return null;
}

/**
 * Resolves the display title for a navigation item or document, considering
 * sidebar preference, language, language-specific properties, and markdown content.
 */
export function getLocalizedItemTitle(
  item: {
    title?: string;
    sidebar_title?: string;
    sidebar_name?: string;
    title_es?: string;
    title_en?: string;
    name?: string;
    content?: string;
  } | undefined | null,
  preferredLang: 'es' | 'en' = 'es',
  options?: { isSidebar?: boolean }
): string {
  if (!item) return '';

  // 1. If for sidebar, check sidebar-specific fields first
  if (options?.isSidebar) {
    const sidebarVal = item.sidebar_title || item.sidebar_name || item.name;
    if (sidebarVal) {
      const localizedSidebar = getLocalizedText(sidebarVal, preferredLang);
      if (localizedSidebar) return localizedSidebar;
    }
  }

  // 2. Check language-specific title properties (e.g. title_es / title_en)
  if (preferredLang === 'es' && item.title_es) {
    return getLocalizedText(item.title_es, preferredLang);
  }
  if (preferredLang === 'en' && item.title_en) {
    return getLocalizedText(item.title_en, preferredLang);
  }

  // 3. Check item.title
  if (item.title) {
    const localized = getLocalizedText(item.title, preferredLang);
    if (localized) return localized;
  }

  // 4. Fallback to name or empty string
  return item.name || '';
}

/**
 * Calculates approximate reading time in minutes.
 */
export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
