import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import {
  getDocumentationData,
  getDocumentBySlug,
  flattenNavigation,
  getDocNavigationContext,
  resolveProductConfig,
  findSectionIndexDocBySlug,
  findNavigationItemBySlug,
  getSectionChildrenForSlug,
  DocumentItem,
} from '@/lib/api';
import { extractHeadings, calculateReadingTime, getLocalizedText, getLocalizedItemTitle } from '@/lib/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { DocPagination } from '@/components/doc-pagination';
import { TableOfContents } from '@/components/table-of-contents';
import { DocHeader } from '@/components/doc-header';
import { SectionGrid } from '@/components/section-grid';

export const dynamic = 'auto';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getDocumentationData();
  if (!data?.navigation) return [];

  const flatDocs = flattenNavigation(data.navigation);
  return flatDocs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [doc, data] = await Promise.all([
    getDocumentBySlug(slug),
    getDocumentationData(),
  ]);

  const sectionItem = findNavigationItemBySlug(data?.navigation || [], slug);
  const rawTitle = doc ? getLocalizedItemTitle(doc, 'es') : (sectionItem ? getLocalizedItemTitle(sectionItem, 'es') : '');
  const config = resolveProductConfig(doc?.product || data?.product, data?.technical_docs);
  const productTitle = getLocalizedText(config.title, 'es');

  if (!rawTitle) {
    return {
      title: `Documento no encontrado | ${productTitle} Docs`,
    };
  }

  const rawDescription = doc?.description_es || doc?.description_en || doc?.description;
  const description = rawDescription
    ? getLocalizedText(rawDescription, 'es')
    : `Guía y documentación técnica sobre ${rawTitle} en ${productTitle}.`;

  return {
    title: `${rawTitle} | Documentación de ${productTitle}`,
    description,
  };
}

export default async function DocumentSlugPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch document and full navigation data in parallel
  const [doc, data] = await Promise.all([
    getDocumentBySlug(slug),
    getDocumentationData(),
  ]);

  const navigation = data?.navigation || [];

  // If this slug belongs to a section that has a dedicated index doc, redirect to it
  const indexDoc = findSectionIndexDocBySlug(navigation, slug);
  if (indexDoc?.slug) {
    redirect(`/documentation/${indexDoc.slug}`);
  }

  const sectionItem = findNavigationItemBySlug(navigation, slug);

  // Use doc or fallback to section item metadata if doc is not in documents table
  const effectiveDoc: DocumentItem | null =
    doc ||
    (sectionItem
      ? {
        id: sectionItem.id,
        title: sectionItem.title,
        sidebar_title: sectionItem.sidebar_title,
        sidebar_name: sectionItem.sidebar_name,
        slug: sectionItem.slug || slug,
        content: '',
        icon_name: sectionItem.icon_name,
      }
      : null);

  if (!effectiveDoc) {
    notFound();
  }

  const { prevDoc, nextDoc, breadcrumbs, allFlatDocs } = getDocNavigationContext(
    navigation,
    slug
  );

  const currentFlatDoc = allFlatDocs.find((d) => d.slug === slug);
  const displaySection =
    currentFlatDoc?.sectionTitle && currentFlatDoc.sectionTitle !== 'General'
      ? currentFlatDoc.sectionTitle
      : effectiveDoc.section && !/^[0-9a-f-]{36}$/i.test(effectiveDoc.section)
        ? effectiveDoc.section
        : undefined;

  const headings = extractHeadings(effectiveDoc.content || '');
  const readingTime = calculateReadingTime(effectiveDoc.content || '');

  const hasMarkdownContent = Boolean(
    effectiveDoc.content && effectiveDoc.content.trim().length > 0
  );
  const sectionChildren = getSectionChildrenForSlug(navigation, slug);

  const iconName =
    effectiveDoc.icon_name ||
    sectionItem?.icon_name ||
    currentFlatDoc?.icon_name;

  const config = resolveProductConfig(effectiveDoc.product || data?.product);

  return (
    <div className="flex gap-8 lg:gap-12 font-poppins w-full items-start justify-between">
      {/* Central Article Container */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Dynamic Multilingual Document Header */}
        <DocHeader
          doc={effectiveDoc}
          iconName={iconName}
          displaySection={displaySection}
          readingTime={readingTime}
        />

        {/* Rendered Markdown Body if available */}
        {hasMarkdownContent && (
          <MarkdownRenderer
            content={effectiveDoc.content || ''}
            currentSectionItems={sectionChildren}
            navigation={navigation}
            allDocs={data?.documents || []}
            faq={config.faq}
          />
        )}

        {/* Section Cards Grid (if section has child articles and wasn't explicitly called inside markdown body) */}
        {sectionChildren.length > 0 &&
          !/(?:<section[-_]?grid|<sectiongrid|<section[-_]?cards|<sectioncards|<SectionGrid|<SectionCards|<TableOfContents|<SectionTOC|:::section[-_]?grid|:::section[-_]?cards|:::cards|:::toc|\[\[section[-_]?grid|\[\[toc\]\])/i.test(
            effectiveDoc.content || ''
          ) && (
            <SectionGrid
              items={sectionChildren}
              allDocs={data?.documents || []}
              title={hasMarkdownContent ? 'Contenidos de esta sección' : undefined}
            />
          )}

        {/* Bottom Prev/Next Navigation */}
        <DocPagination prevDoc={prevDoc} nextDoc={nextDoc} />
      </div>

      {/* Right Column: Floating Table of Contents */}
      <TableOfContents headings={headings} rawContent={effectiveDoc.content || ''} />
    </div>
  );
}

