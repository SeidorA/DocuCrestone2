import React from 'react';
import { getDocumentationData, flattenNavigation, resolveProductConfig } from '@/lib/api';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/sidebar-provider';
import { LanguageProvider } from '@/context/language-context';

export default async function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDocumentationData();

  const navigation = data?.navigation || [];
  const product = data?.product;
  const config = resolveProductConfig(product, data?.technical_docs);
  const flatDocs = flattenNavigation(navigation);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col bg-full text-neutral-900 dark:text-neutral-100 transition-colors font-poppins">
            {/* Top Header / Navbar */}
            <Header
              config={config}
              navigation={navigation}
              flatDocs={flatDocs}
            />

            {/* Content Area with Flex Layout */}
            <div className="w-full flex-1 flex items-start">
              {/* Left Desktop Sidebar */}
              <Sidebar config={config} navigation={navigation} />

              {/* Main Central Content Area */}
              <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12 w-full">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
