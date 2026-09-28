'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CaralIcon } from 'iconcaral2';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductConfig, BlogPostItem } from '@/portal.config';
import { NavigationItem, FlatDocItem } from '@/lib/api';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/utils';

interface BlogViewProps {
  config: ProductConfig;
  navigation: NavigationItem[];
  flatDocs: FlatDocItem[];
}

export function BlogView({ config, navigation, flatDocs }: BlogViewProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Latest');

  const blogPosts: BlogPostItem[] = config.blogPosts || [];

  // Localized page title & description
  const pageTitle =
    config.blogConfig?.title ||
    t('blog.title', 'Blog & Artículos');
  const pageDescription =
    config.blogConfig?.description ||
    t('blog.subtitle', 'Novedades, mejores prácticas, casos de uso y artículos técnicos sobre el producto.');

  // Extract unique tags and categories from blog posts
  const availableTags = useMemo(() => {
    const tagsMap = new Map<string, number>();

    blogPosts.forEach((post) => {
      const seenForPost = new Set<string>();

      // Post category (e.g. "General", "Tutorial", etc.)
      if (post.category && post.category.trim()) {
        const cat = post.category.trim();
        seenForPost.add(cat.toLowerCase());
        tagsMap.set(cat, (tagsMap.get(cat) || 0) + 1);
      }

      // Post tags
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            const trimmed = tag.trim();
            if (!seenForPost.has(trimmed.toLowerCase())) {
              seenForPost.add(trimmed.toLowerCase());
              let existingKey: string | undefined;
              for (const k of tagsMap.keys()) {
                if (k.toLowerCase() === trimmed.toLowerCase()) {
                  existingKey = k;
                  break;
                }
              }
              const keyToUse = existingKey || trimmed;
              tagsMap.set(keyToUse, (tagsMap.get(keyToUse) || 0) + 1);
            }
          }
        });
      }
    });

    return Array.from(tagsMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [blogPosts]);

  // Helper to parse dates into timestamp for chronological sorting
  const getPostTimestamp = (post: BlogPostItem): number => {
    const dateStr = post.date || post.published_at;
    if (!dateStr) return 0;
    const parsed = new Date(dateStr).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Filtered & Chronologically Sorted Posts
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = blogPosts.filter((post) => {
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

      const matchesTag =
        selectedTag === 'Latest' ||
        selectedTag === 'All' ||
        (post.category && post.category.toLowerCase() === selectedTag.toLowerCase()) ||
        (Array.isArray(post.tags) &&
          post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()));

      const matchesSearch =
        !q ||
        title.toLowerCase().includes(q) ||
        (desc && desc.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(q))) ||
        (post.category && post.category.toLowerCase().includes(q));

      return matchesTag && matchesSearch;
    });

    // Chronological order: newest / latest first
    return filtered.sort((a, b) => {
      const timeA = getPostTimestamp(a);
      const timeB = getPostTimestamp(b);
      return timeB - timeA;
    });
  }, [blogPosts, searchQuery, selectedTag, language]);

  return (
    <div className="min-h-screen bg-full text-neutral-900 dark:text-neutral-100 flex flex-col justify-between font-poppins relative">
      {/* Top Header Navbar */}
      <Header
        config={config}
        navigation={navigation}
        flatDocs={flatDocs}
        showSidebarToggle={false}
      />

      {/* Hero Header */}
      <div className="w-full bg-container py-12 md:py-16 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto flex sm:flex-col md:flex-row justify-between items-end md:items-end gap-6 px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
              {pageTitle}
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {pageDescription}
            </p>
          </div>

          {/* Search Bar */}
          <div className="sm:w-full md:w-[30%] flex items-end">
            <div className="relative w-full">
              <span className="absolute left-3.5 top-2 -translate-y-1/2 text-neutral-800">
                <CaralIcon name="search" size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('blog.searchPlaceholder', 'Buscar artículos por título o tema...')}
                className="w-full pl-10 pr-9 py-2 text-sm rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-info-main transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <CaralIcon name="x" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {blogPosts.length === 0 ? (
          <div className="text-center py-16 bg-container rounded-2xl border border-neutral-300 dark:border-neutral-800">
            <div className="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <CaralIcon name="file" size={24} />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {t('blog.noPosts', 'No se encontraron artículos publicados.')}
            </p>
          </div>
        ) : (
          <div className="flex sm:flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar: Tags / Categories Navigation */}
            <aside className="sm:w-full lg:w-64 shrink-0">
              <div className="bg-container border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 shadow-sm sticky top-24">
                <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-neutral-500 text-xs font-semibold uppercase tracking-wider text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <CaralIcon name="bookmark" size={14} />
                    {t('blog.tagsTitle', 'Etiquetas')}
                  </span>
                  <span className="text-[11px] font-normal normal-case text-neutral-400">
                    {blogPosts.length} {t('blog.articles', 'artículos')}
                  </span>
                </div>

                <nav className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {/* "Latest" Option */}
                  <button
                    onClick={() => setSelectedTag('Latest')}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all text-left ${selectedTag.toLowerCase() === 'latest' || selectedTag.toLowerCase() === 'all'
                      ? 'bg-info-main text-white font-semibold shadow-sm'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CaralIcon
                        name="clock"
                        size={15}
                        classname={
                          selectedTag.toLowerCase() === 'latest' || selectedTag.toLowerCase() === 'all'
                            ? 'text-white'
                            : 'text-neutral-400 dark:text-neutral-500'
                        }
                      />
                      <span className="truncate">{t('blog.latest', 'Latest')}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${selectedTag.toLowerCase() === 'latest' || selectedTag.toLowerCase() === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                    >
                      {blogPosts.length}
                    </span>
                  </button>

                  {/* Individual Tags & Categories */}
                  {availableTags.map(({ name, count }) => {
                    const isSelected = selectedTag.toLowerCase() === name.toLowerCase();
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedTag(name)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all text-left ${isSelected
                          ? 'bg-info-main text-white font-semibold shadow-sm'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CaralIcon
                            name="bookmark"
                            size={15}
                            classname={isSelected ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}
                          />
                          <span className="truncate">{name}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Right Area: Grid of Blog Cards */}
            <div className="flex-1 min-w-0 w-full">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-container rounded-2xl border border-neutral-300 dark:border-neutral-800">
                  <div className="w-12 h-12 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
                    <CaralIcon name="file" size={24} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                    {t('blog.noFilteredPosts', 'No se encontraron artículos con el filtro seleccionado.')}
                  </p>
                  {(selectedTag.toLowerCase() !== 'latest' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedTag('Latest');
                        setSearchQuery('');
                      }}
                      className="text-xs text-info-main hover:underline font-medium"
                    >
                      {t('blog.clearFilters', 'Ver todos los artículos (Latest)')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post, idx) => {
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

                    const hazImages = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
                    const fallbackHaz = `/haz/${hazImages[idx % hazImages.length]}.png`;
                    const coverImg = post.cover_image || fallbackHaz;

                    const authorName =
                      typeof post.author === 'string'
                        ? post.author
                        : post.author?.name || config.author || 'SEIDOR';

                    const authorRole =
                      typeof post.author === 'object' ? post.author?.role : undefined;

                    const authorAvatar =
                      typeof post.author === 'object' && post.author?.avatar
                        ? post.author.avatar
                        : `/haz/${hazImages[(idx + 3) % hazImages.length]}.png`;

                    const postSlug = post.slug || post.id || `article-${idx}`;

                    return (
                      <Link
                        key={post.id || postSlug}
                        href={`/blog/${postSlug}`}
                        className="group flex flex-col bg-container border border-neutral-300 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-info-main/40 transition-all duration-200"
                      >
                        {/* Card Cover Image */}
                        <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <img
                            src={coverImg}
                            alt={title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackHaz;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {post.category && (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTag(post.category!);
                              }}
                              className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-900/80 backdrop-blur-sm text-white border border-white/20 hover:bg-info-main transition-colors"
                            >
                              {post.category}
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Meta: Reading time & Date */}
                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-2.5">
                              {(post.date || post.published_at) && (
                                <span className="flex items-center gap-1">
                                  <CaralIcon name="calendar" size={12} />
                                  {post.date || post.published_at}
                                </span>
                              )}
                              {post.reading_time && (
                                <span className="flex items-center gap-1">
                                  <CaralIcon name="clock" size={12} />
                                  {post.reading_time} {t('blog.readTime', 'min read')}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-info-main transition-colors">
                              {title}
                            </h2>

                            {/* Description */}
                            {desc && (
                              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed mb-4">
                                {desc}
                              </p>
                            )}
                          </div>

                          {/* Tags & Author Footer */}
                          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800/80 mt-auto">
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.tags.slice(0, 4).map((tag, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedTag(tag);
                                    }}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-info-main/10 hover:text-info-main transition-colors"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2.5">
                              <img
                                src={authorAvatar}
                                alt={authorName}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/haz/a.png';
                                }}
                                className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                  {authorName}
                                </p>
                                {authorRole && (
                                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                                    {authorRole}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer config={config} />
    </div>
  );
}
