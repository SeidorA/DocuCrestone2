import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { defaultProductConfig } from '@/portal.config';
import { getDocumentationData } from '@/lib/api';
import { getLocalizedText } from '@/lib/utils';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDocumentationData();
  const product = data?.product;
  const rawTitle = product?.title_es || product?.title || defaultProductConfig.title;
  const rawDesc = product?.description_es || product?.description || defaultProductConfig.description;
  const title = getLocalizedText(rawTitle, 'es');
  const description = getLocalizedText(rawDesc, 'es');
  const favicon =
    product?.favicon || defaultProductConfig.branding.favicon || '/favicon.ico';

  return {
    title: `${title} | Documentación Oficial`,
    description: description,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-poppins bg-full text-neutral-900 dark:text-neutral-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
