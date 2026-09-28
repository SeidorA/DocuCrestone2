import { notFound } from 'next/navigation';
import { getDocumentationData, resolveProductConfig, flattenNavigation } from '@/lib/api';
import { ReleaseDetailView } from '@/components/release-detail-view';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/sidebar-provider';
import { LanguageProvider } from '@/context/language-context';
import { Metadata } from 'next';

interface ReleaseDetailPageProps {
  params: Promise<{
    version: string;
  }>;
}

export async function generateMetadata({ params }: ReleaseDetailPageProps): Promise<Metadata> {
  const { version } = await params;
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const releases = config.releases || [];

  const normalizeVer = (v: string | undefined | null) =>
    (v || '').replace(/^v/i, '').trim().toLowerCase();

  const release = releases.find(
    (r) =>
      normalizeVer(r.version) === normalizeVer(version) ||
      r.id === version
  );

  const displayVer = release ? release.version.replace(/^v/i, '') : version.replace(/^v/i, '');

  return {
    title: `Release V ${displayVer} | ${config.title}`,
    description: release?.description || `Notes and features for release version ${displayVer}`,
  };
}

export default async function ReleaseDetailPage({ params }: ReleaseDetailPageProps) {
  const { version } = await params;
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const navigation = data?.navigation || [];
  const flatDocs = flattenNavigation(navigation);

  const releases = config.releases || [];
  const normalizeVer = (v: string | undefined | null) =>
    (v || '').replace(/^v/i, '').trim().toLowerCase();

  const release = releases.find(
    (r) =>
      normalizeVer(r.version) === normalizeVer(version) ||
      r.id === version
  );

  if (!release && releases.length > 0) {
    notFound();
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <ReleaseDetailView
            versionParam={version}
            config={config}
            navigation={navigation}
            flatDocs={flatDocs}
          />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
