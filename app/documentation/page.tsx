import { redirect } from 'next/navigation';
import { getDocumentationData, flattenNavigation } from '@/lib/api';

export const dynamic = 'auto';
export const revalidate = 0;

export default async function DocumentationRootPage() {
  const data = await getDocumentationData();
  const navigation = data?.navigation || [];
  const productVersion = data?.product?.version;

  const defaultModule =
    navigation.find((m) => {
      const t = m.title?.trim().toLowerCase();
      if (t === 'current' || t === 'curren') return true;
      if (productVersion && m.title?.includes(productVersion)) return true;
      return false;
    }) ||
    navigation[0];

  const flatDocs = flattenNavigation(defaultModule ? [defaultModule] : navigation);

  if (flatDocs.length > 0) {
    redirect(`/documentation/${flatDocs[0].slug}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <h1 className="text-2xl font-bold mb-2">Documentación no disponible</h1>
      <p className="text-slate-500 text-sm">
        No se encontraron documentos públicos en el CMS para este producto.
      </p>
    </div>
  );
}
