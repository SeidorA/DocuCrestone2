import { getDocumentationData, resolveProductConfig, flattenNavigation } from '@/lib/api';
import { ReleasesView } from '@/components/releases-view';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Release Notes | Product Documentation',
  description: 'Changelog, new features, improvements, and updates.',
};

export default async function ReleaseNotesPage() {
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const navigation = data?.navigation || [];
  const flatDocs = flattenNavigation(navigation);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ReleasesView
          config={config}
          navigation={navigation}
          flatDocs={flatDocs}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
