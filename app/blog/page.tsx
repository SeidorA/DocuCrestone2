import { getDocumentationData, resolveProductConfig, flattenNavigation } from '@/lib/api';
import { BlogView } from '@/components/blog-view';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Articles | Product Documentation',
  description: 'Technical insights, best practices, and product updates.',
};

export default async function BlogPage() {
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const navigation = data?.navigation || [];
  const flatDocs = flattenNavigation(navigation);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BlogView
          config={config}
          navigation={navigation}
          flatDocs={flatDocs}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
