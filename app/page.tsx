import { getDocumentationData, resolveProductConfig } from '@/lib/api';
import { HomeView } from '@/components/home-view';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';

export default async function HomePage() {
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <HomeView
          config={config}
          navigation={data?.navigation || []}
          documents={data?.documents || []}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
