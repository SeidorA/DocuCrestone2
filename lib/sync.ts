import fs from 'fs';
import path from 'path';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DocsApiResponse, normalizeDocsData } from './api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || process.env.NEXT_PUBLIC_PORTAL_API || '';
const PRODUCT_SLUG = process.env.NEXT_PUBLIC_PRODUCT_SLUG || 'docuportal';

export interface SyncResult {
  success: boolean;
  productSlug: string;
  totalDocuments?: number;
  totalModules?: number;
  durationMs: number;
  error?: string;
}

/**
 * Fetches fresh documentation, blog, and release data directly from Portal CMS,
 * updates the local data/docs-cache.json snapshot, and triggers Next.js cache revalidations.
 */
export async function syncAndRevalidateDocs(productSlug = PRODUCT_SLUG): Promise<SyncResult> {
  const startTime = Date.now();
  const slug = productSlug || PRODUCT_SLUG;

  try {
    const fetchOptions: RequestInit = {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    };

    const [docsRes, blogRes, releasesRes] = await Promise.all([
      fetch(
        `${API_BASE_URL}/api/public/docs?product=${encodeURIComponent(slug)}&include_content=true`,
        fetchOptions
      ).catch(() => null),
      fetch(
        `${API_BASE_URL}/api/public/blog?product=${encodeURIComponent(slug)}`,
        fetchOptions
      ).catch(() => null),
      fetch(
        `${API_BASE_URL}/api/public/releases?product=${encodeURIComponent(slug)}`,
        fetchOptions
      ).catch(() => null),
    ]);

    if (!docsRes || !docsRes.ok) {
      throw new Error(
        `Failed to fetch docs from Portal API: ${docsRes ? docsRes.statusText : 'Network error'}`
      );
    }

    const data: DocsApiResponse = await docsRes.json();

    if (!data.success && !data.product) {
      throw new Error(data.error || 'Portal API returned invalid product data');
    }

    if (!data.technical_docs) {
      data.technical_docs = {};
    }

    // Merge blog posts if available
    if (
      (!data.technical_docs.blog ||
        (Array.isArray(data.technical_docs.blog) && data.technical_docs.blog.length === 0)) &&
      blogRes &&
      blogRes.ok
    ) {
      try {
        const blogData = await blogRes.json();
        if (blogData && Array.isArray(blogData.posts) && blogData.posts.length > 0) {
          data.technical_docs.blog = blogData.posts;
        }
      } catch {
        // Ignore blog parse error
      }
    }

    // Merge releases if available
    if (
      (!data.technical_docs.releases ||
        (Array.isArray(data.technical_docs.releases) && data.technical_docs.releases.length === 0)) &&
      releasesRes &&
      releasesRes.ok
    ) {
      try {
        const relData = await releasesRes.json();
        if (relData && Array.isArray(relData.releases) && relData.releases.length > 0) {
          data.technical_docs.releases = relData.releases;
        }
      } catch {
        // Ignore releases parse error
      }
    }

    const normalizedData = normalizeDocsData(data);

    // Save to local cache file if running on server filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const cacheFilePath = path.join(dataDir, 'docs-cache.json');
      fs.writeFileSync(cacheFilePath, JSON.stringify(normalizedData, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write to local data/docs-cache.json:', fsErr);
    }

    // Invalidate Next.js cache
    try {
      revalidateTag('portal-docs', 'max');
      revalidateTag(`docs-${slug}`, 'max');
      revalidatePath('/', 'layout');
      revalidatePath('/documentation', 'layout');
      revalidatePath('/blog', 'layout');
      revalidatePath('/release-notes', 'layout');
    } catch (revalErr) {
      console.warn('Cache revalidation trigger note:', revalErr);
    }

    const durationMs = Date.now() - startTime;
    return {
      success: true,
      productSlug: slug,
      totalDocuments: normalizedData.total_documents || normalizedData.documents?.length || 0,
      totalModules: normalizedData.modules?.length || 0,
      durationMs,
    };
  } catch (error: any) {
    console.error('Error during syncAndRevalidateDocs:', error);
    return {
      success: false,
      productSlug: slug,
      durationMs: Date.now() - startTime,
      error: error?.message || 'Unknown error occurred during synchronization',
    };
  }
}
