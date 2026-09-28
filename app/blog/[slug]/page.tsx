import { notFound } from 'next/navigation';
import { getDocumentationData, resolveProductConfig, flattenNavigation } from '@/lib/api';
import { BlogPostView } from '@/components/blog-post-view';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const post = config.blogPosts?.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.description || 'Article from technical documentation blog.',
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const data = await getDocumentationData();
  const config = resolveProductConfig(data?.product, data?.technical_docs);
  const navigation = data?.navigation || [];
  const flatDocs = flattenNavigation(navigation);

  const post = config.blogPosts?.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    notFound();
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BlogPostView
          post={post}
          config={config}
          navigation={navigation}
          flatDocs={flatDocs}
        />
      </LanguageProvider>
    </ThemeProvider>
  );
}
