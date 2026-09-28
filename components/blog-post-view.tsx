'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CaralIcon } from 'iconcaral2';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ProductConfig, BlogPostItem } from '@/portal.config';
import { NavigationItem, FlatDocItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface BlogPostViewProps {
  post: BlogPostItem;
  config: ProductConfig;
  navigation: NavigationItem[];
  flatDocs: FlatDocItem[];
}

export function BlogPostView({ post, config, navigation, flatDocs }: BlogPostViewProps) {
  const { language, t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);

  const title = getLocalizedText(
    post.title_es && post.title_en
      ? { es: post.title_es, en: post.title_en }
      : post.title,
    language
  );

  const desc = getLocalizedText(
    post.description_es && post.description_en
      ? { es: post.description_es, en: post.description_en }
      : post.description,
    language
  );

  const rawContent =
    post.content_es && post.content_en
      ? (language === 'es' ? post.content_es : post.content_en)
      : post.content || desc || '';

  const authorName =
    typeof post.author === 'string'
      ? post.author
      : post.author?.name || config.author || 'SEIDOR';

  const authorRole =
    typeof post.author === 'object' ? post.author?.role : undefined;

  const authorAvatar =
    typeof post.author === 'object' && post.author?.avatar
      ? post.author.avatar
      : '/haz/a.png';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-full text-neutral-900 dark:text-neutral-100 flex flex-col justify-between font-poppins relative">
      {/* Header */}
      <Header
        config={config}
        navigation={navigation}
        flatDocs={flatDocs}
        showSidebarToggle={false}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Navigation Breadcrumbs & Back */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-info-main dark:hover:text-info-main transition-colors"
          >
            <CaralIcon name="arrowLeft" size={14} />
            <span>{t('blog.backToBlog', 'Volver a Artículos')}</span>
          </Link>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-container border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all"
          >
            <CaralIcon name={isCopied ? 'check' : 'link'} size={14} />
            <span>{isCopied ? t('docs.linkCopied', 'Enlace copiado') : t('blog.shareArticle', 'Compartir')}</span>
          </button>
        </div>

        {/* Article Meta Top */}
        <div className="mb-6">
          {post.category && (
            <div className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-info-main/10 text-info-main border border-info-main/20 mb-3">
              {post.category}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4 leading-tight">
            {title}
          </h1>
          {desc && (
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
              {desc}
            </p>
          )}

          {/* Cover Image Banner */}
          {post.cover_image && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800 shadow-sm max-h-96 w-full bg-neutral-100 dark:bg-neutral-800">
              <img
                src={post.cover_image}
                alt={title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/haz/a.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>
          )}


        </div>



        {/* Article Body Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed font-poppins">
          <MarkdownRenderer content={rawContent} />
        </article>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-2">Tags:</span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-container border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-container border border-neutral-300 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
              {t('blog.title', 'Blog & Artículos')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('blog.subtitle', 'Explora más guías, mejores prácticas y actualizaciones.')}
            </p>
          </div>
          <Link
            href="/blog"
            className="px-4 py-2 rounded-xl text-xs font-medium bg-info-main text-white hover:bg-info-main/90 transition-colors shrink-0"
          >
            {t('blog.backToBlog', 'Ver todos los artículos')}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}
