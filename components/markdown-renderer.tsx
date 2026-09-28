'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { CaralIcon, Brand } from 'iconcaral2';
import {
  NavigationItem,
  DocumentItem,
  findNavigationItemBySlug,
  findSectionItems,
} from '@/lib/api';
import { parseMultilingualMarkdown } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { ProductFaqItem, defaultProductConfig } from '@/portal.config';
import { SectionGrid } from './section-grid';
import { FaqAccordion } from './faq-accordion';
import { DocIndex } from './doc-index';

interface MarkdownRendererProps {
  content: string;
  currentSectionItems?: NavigationItem[];
  navigation?: NavigationItem[];
  allDocs?: DocumentItem[];
  faq?: ProductFaqItem[];
}

const extractText = (children: any): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return '';
};

const renderTitleWithIcon = (Tag: any, children: React.ReactNode, props: any, className: string) => {
  let iconName = '';
  let isBrand = false;

  const extractIcon = (nodes: any): any => {
    return React.Children.map(nodes, (child) => {
      if (typeof child === 'string') {
        let match = child.match(/^!icon-([\w-]+)!\s*/i);
        if (match) {
          iconName = match[1];
          return child.replace(match[0], '');
        }
        match = child.match(/^!brand-([\w-]+)!\s*/i);
        if (match) {
          iconName = match[1];
          isBrand = true;
          return child.replace(match[0], '');
        }
      }
      return child;
    });
  };

  const cleanChildren = extractIcon(children);

  return (
    <Tag className={className} {...props}>
      <span className="inline-flex items-center gap-2 align-middle">
        {iconName &&
          (isBrand ? (
            <Brand name={iconName as any} size={Tag === 'h1' ? 32 : Tag === 'h2' ? 28 : 24} />
          ) : (
            <CaralIcon
              name={iconName as any}
              classname="text-blue-500 shrink-0"
              size={Tag === 'h1' ? 32 : Tag === 'h2' ? 28 : 24}
            />
          ))}
        <span>{cleanChildren}</span>
      </span>
    </Tag>
  );
};

const preprocessSectionGrid = (text: string) => {
  if (!text) return '';
  let result = text;

  // 1. Convert :::section-grid, :::section-cards, :::cards, :::toc
  result = result.replace(
    /(?:^|\n)[ \t]*:::(?:section[-_]?grid|section[-_]?cards|cards|toc)(?:\(([\s\S]*?)\)|[ \t]+([^\n\r]*))?[ \t]*(?:\n|$)/gi,
    (match, arg1, arg2) => {
      const rawArg = (arg1 || arg2 || '').trim();
      let sectionAttr = '';
      let titleAttr = '';
      if (rawArg) {
        if (rawArg.includes('=')) {
          const secMatch = rawArg.match(/section=["']?([^"']+)["']?/i);
          const titleMatch = rawArg.match(/title=["']?([^"']+)["']?/i);
          if (secMatch) sectionAttr = ` section="${secMatch[1]}"`;
          if (titleMatch) titleAttr = ` title="${titleMatch[1]}"`;
        } else {
          titleAttr = ` title="${rawArg}"`;
        }
      }
      return `\n\n<section-grid${sectionAttr}${titleAttr}></section-grid>\n\n`;
    }
  );

  // 2. Convert JSX/HTML self-closing or paired tags like <SectionGrid ... /> or <TableOfContents />
  result = result.replace(
    /<(?:SectionGrid|section_grid|SectionCards|section_cards|TableOfContents|SectionTOC|TocGrid)([^>]*?)(?:\/>|>(?:<\/SectionGrid>|<\/section_grid>|<\/SectionCards>|<\/section_cards>|<\/TableOfContents>|<\/SectionTOC>|<\/TocGrid>)?)/gi,
    (match, attrs) => {
      return `\n\n<section-grid${attrs || ''}></section-grid>\n\n`;
    }
  );

  // 3. Convert [[section-grid]] or [[section-grid section-slug]] or [[toc]]
  result = result.replace(
    /\[\[(?:section[-_]?grid|section[-_]?cards|toc)(?:\s+([^\]]+))?\]\]/gi,
    (match, arg) => {
      const raw = arg ? ` section="${arg.trim()}"` : '';
      return `\n\n<section-grid${raw}></section-grid>\n\n`;
    }
  );

  return result;
};

const preprocessFaq = (text: string) => {
  if (!text) return '';
  let result = text;

  // 1. Convert :::faq or :::faq(...)
  result = result.replace(
    /(?:^|\n)[ \t]*:::(?:faq|faq[-_]?accordion|faq[-_]?section)(?:\(([\s\S]*?)\)|[ \t]+([^\n\r]*))?[ \t]*(?:\n|$)/gi,
    (match, arg1, arg2) => {
      const rawArg = (arg1 || arg2 || '').trim();
      let titleAttr = '';
      if (rawArg) {
        titleAttr = ` title="${rawArg}"`;
      }
      return `\n\n<faq-accordion${titleAttr}></faq-accordion>\n\n`;
    }
  );

  // 2. Convert JSX/HTML self-closing or paired tags
  result = result.replace(
    /<(?:Faq|faq|FaqAccordion|faq_accordion|FaqSection|faq_section)([^>]*?)(?:\/>|>(?:<\/Faq>|<\/faq>|<\/FaqAccordion>|<\/faq_accordion>|<\/FaqSection>|<\/faq_section>)?)/gi,
    (match, attrs) => {
      return `\n\n<faq-accordion${attrs || ''}></faq-accordion>\n\n`;
    }
  );

  // 3. Convert [[faq]]
  result = result.replace(
    /\[\[(?:faq|faqs|faq[-_]?section)\]\]/gi,
    () => `\n\n<faq-accordion></faq-accordion>\n\n`
  );

  return result;
};

const preprocessDocIndex = (text: string) => {
  if (!text) return '';
  let result = text;

  // 1. Convert :::index or :::doc-index
  result = result.replace(
    /(?:^|\n)[ \t]*:::(?:doc[-_]?index|index|directory|doc[-_]?directory)(?:\(([\s\S]*?)\)|[ \t]+([^\n\r]*))?[ \t]*(?:\n|$)/gi,
    (match, arg1, arg2) => {
      const rawArg = (arg1 || arg2 || '').trim();
      let titleAttr = '';
      if (rawArg) {
        titleAttr = ` title="${rawArg}"`;
      }
      return `\n\n<doc-index${titleAttr}></doc-index>\n\n`;
    }
  );

  // 2. Convert JSX/HTML self-closing or paired tags
  result = result.replace(
    /<(?:DocIndex|doc_index|doc-index|DocumentIndex|document_index|DocDirectory|doc_directory)([^>]*?)(?:\/>|>(?:<\/DocIndex>|<\/doc_index>|<\/doc-index>|<\/DocumentIndex>|<\/DocDirectory>)?)/gi,
    (match, attrs) => {
      return `\n\n<doc-index${attrs || ''}></doc-index>\n\n`;
    }
  );

  // 3. Convert [[index]] or [[doc-index]]
  result = result.replace(
    /\[\[(?:index|doc[-_]?index|directory)\]\]/gi,
    () => `\n\n<doc-index></doc-index>\n\n`
  );

  return result;
};

const preprocessAdmonitions = (text: string) => {
  if (!text) return '';
  // Convert :::type [title] or :::type(title) to blockquotes with magic tag
  return text.replace(
    /^:::(\w+)(?:\((.*?)\)|[ \t]+(.*?))?\s*\n([\s\S]*?)\n:::/gm,
    (match, type, title1, title2, body) => {
      const rawTitle = title1 || title2;
      const safeTitle = rawTitle ? rawTitle.trim() : type.toUpperCase();
      const encodedTitle = encodeURIComponent(safeTitle);
      const bodyWithQuotes = body
        .split('\n')
        .map((line: string) => `> ${line}`)
        .join('\n');
      return `> !ADMONITION:${type}:${encodedTitle}!\n${bodyWithQuotes}`;
    }
  );
};

const preprocessLineBreaks = (text: string) => {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        return line;
      }
      return line.replace(/<br\s*\/?>/gi, '  \n');
    })
    .join('\n');
};

const preprocessBullets = (text: string) => {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');

      if (isTableRow) {
        const cells = line.split('|');
        const processedCells = cells.map((cell, idx) => {
          if (idx === 0 || idx === cells.length - 1) {
            return cell;
          }
          return cell.replace(/(<br\s*\/?>\s*)?•\s*/gi, (match, hasBr, offset) => {
            const textBefore = cell.slice(0, offset).trim();
            if (!textBefore) return '• ';
            return '<br/>• ';
          });
        });
        return processedCells.join('|');
      }

      return line.replace(/(<br\s*\/?>\s*)?•\s*/gi, (match, hasBr, offset) => {
        const textBefore = line.slice(0, offset).trim();
        if (!textBefore) return '• ';
        return '<br/>• ';
      });
    })
    .join('\n');
};

const PreContext = React.createContext<boolean>(false);

export function MarkdownRenderer({
  content,
  currentSectionItems = [],
  navigation = [],
  allDocs = [],
  faq = [],
}: MarkdownRendererProps) {
  const { language } = useLanguage();

  const { content: rawLocalized } = parseMultilingualMarkdown(content, language);
  // Strip leading H1 since DocHeader handles the primary title header
  const bodyWithoutLeadingH1 = (rawLocalized || '').replace(/^\s*#\s+[^\r\n]+(?:\r?\n|$)/, '');
  const processedContent = preprocessBullets(
    preprocessLineBreaks(
      preprocessAdmonitions(
        preprocessDocIndex(preprocessFaq(preprocessSectionGrid(bodyWithoutLeadingH1)))
      )
    )
  );

  const renderSectionGrid = (props: any) => {
    const { section, title, description } = props;
    let targetItems = currentSectionItems;
    if (section && navigation && navigation.length > 0) {
      targetItems = findSectionItems(navigation, section);
    }
    if (!targetItems || targetItems.length === 0) {
      targetItems = currentSectionItems;
    }
    if (!targetItems || targetItems.length === 0) {
      return null;
    }
    return (
      <div className="not-prose my-8">
        <SectionGrid
          items={targetItems}
          allDocs={allDocs}
          title={title}
          description={description}
        />
      </div>
    );
  };

  const renderFaq = (props: any) => {
    const { title, description } = props;
    const faqItems = faq && faq.length > 0 ? faq : defaultProductConfig.faq;
    return (
      <div className="not-prose my-8">
        <FaqAccordion
          items={faqItems}
          title={title}
          description={description}
        />
      </div>
    );
  };

  const renderDocIndex = (props: any) => {
    const { title, description } = props;
    return (
      <div className="not-prose my-8">
        <DocIndex
          navigation={navigation}
          allDocs={allDocs}
          title={title}
          description={description}
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-poppins">
      <div className="doc-content prose prose-neutral dark:prose-invert max-w-none text-neutral-900 dark:text-neutral-200 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={{
            // Horizontal rule
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-t border-neutral-300 dark:border-neutral-700/80" {...props} />
            ),

            // Iframes / Videos
            iframe: ({ node, style, ...props }) => (
              <div className="w-full aspect-video rounded-xl overflow-hidden my-6 shadow-md border border-neutral-200 dark:border-neutral-800">
                <iframe className="w-full h-full border-0" {...props} />
              </div>
            ),

            // Code blocks and inline code
            pre: ({ node, children, ...props }: any) => {
              return (
                <PreContext.Provider value={true}>
                  <div className="my-6">{children}</div>
                </PreContext.Provider>
              );
            },
            code({ className, children, ...props }: any) {
              const isInsidePre = React.useContext(PreContext);
              const match = /language-(\w+)/.exec(className || '');
              const codeText = String(children).replace(/\n$/, '');

              if (isInsidePre || match || String(children).includes('\n')) {
                return <CodeBlock language={match ? match[1] : ''} code={codeText} />;
              }

              return (
                <code
                  className="bg-neutral-100 dark:bg-neutral-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-[0.875em] font-mono font-normal border border-neutral-200 dark:border-neutral-700/60 inline align-baseline"
                  {...props}
                >
                  {children}
                </code>
              );
            },

            // Blockquote component with alert/callout and admonition support
            blockquote: ({ node, children, ...props }) => {
              const rawText = extractText(children).trim();
              const legacyMatch = rawText.match(/^!ADMONITION:(\w+):(.*?)(?:!)/);
              const githubAlertMatch = rawText.match(
                /^\[!(NOTE|TIP|INFO|WARNING|CAUTION|DANGER|IMPORTANT)\]/i
              );

              if (legacyMatch || githubAlertMatch) {
                let type = '';
                let title = '';
                let tagToRemove = '';

                if (legacyMatch) {
                  type = legacyMatch[1].toLowerCase();
                  const encodedTitle = legacyMatch[2];
                  try {
                    title = decodeURIComponent(encodedTitle).trim().replace(/^<|>$/g, '');
                  } catch {
                    title = encodedTitle.trim().replace(/^<|>$/g, '');
                  }
                  tagToRemove = `!ADMONITION:${legacyMatch[1]}:${encodedTitle}!`;
                } else if (githubAlertMatch) {
                  type = githubAlertMatch[1].toLowerCase();
                  if (type === 'caution') type = 'danger';

                  const line = rawText.split('\n')[0];
                  const titleMatch = line.match(/^\[!.*?\]\s*(.*)$/i);
                  title =
                    titleMatch && titleMatch[1]
                      ? titleMatch[1].trim()
                      : type.toUpperCase();

                  tagToRemove = githubAlertMatch[0];
                }

                let removed = false;
                const cleanChildren = (nodes: any): any => {
                  return React.Children.map(nodes, (child) => {
                    if (removed) return child;
                    if (typeof child === 'string') {
                      if (child.includes(tagToRemove)) {
                        removed = true;
                        const cleaned = child.replace(tagToRemove, '').replace(/^\s+/, '');
                        return cleaned;
                      }
                      return child;
                    }
                    if (React.isValidElement(child)) {
                      return React.cloneElement(
                        child,
                        {},
                        cleanChildren((child.props as any).children)
                      );
                    }
                    return child;
                  });
                };

                const admonitionStyles: Record<string, any> = {
                  note: {
                    bgDark: 'bg-neutral-800',
                    bgLight: 'bg-neutral-100 dark:bg-neutral-800/80',
                    textDark: 'text-neutral-800 dark:text-neutral-200',
                    textLight: 'text-neutral-700 dark:text-neutral-300',
                    icon: 'circleInfo',
                    defaultTitle: 'NOTA',
                  },
                  tip: {
                    bgDark: 'bg-success-main',
                    bgLight: 'bg-success-light/30',
                    textDark: 'text-success-main',
                    textLight: 'text-neutral-900',
                    icon: 'leaf',
                    defaultTitle: 'TIP',
                  },
                  info: {
                    bgDark: 'bg-info-main',
                    bgLight: 'bg-info-light/30',
                    textDark: 'text-info-main',
                    textLight: 'text-neutral-900',
                    icon: 'circleInfo',
                    defaultTitle: 'INFORMACIÓN',
                  },
                  important: {
                    bgDark: 'bg-purple-600 dark:bg-purple-500',
                    bgLight: 'bg-purple-50 dark:bg-purple-950/25',
                    textDark: 'text-purple-800 dark:text-purple-300',
                    textLight: 'text-purple-700 dark:text-purple-200/90',
                    icon: 'circleInfo',
                    defaultTitle: 'IMPORTANTE',
                  },
                  warning: {
                    bgDark: 'bg-warning-main',
                    bgLight: 'bg-warning-light/30',
                    textDark: 'text-warning-main',
                    textLight: 'text-neutral-900',
                    icon: 'triangleExclamation',
                    defaultTitle: 'ADVERTENCIA',
                  },
                  danger: {
                    bgDark: 'bg-danger-main',
                    bgLight: 'bg-danger-light/30',
                    textDark: 'text-danger-main',
                    textLight: 'text-neutral-900',
                    icon: 'xCircle',
                    defaultTitle: 'PELIGRO',
                  },
                };

                const style = admonitionStyles[type] || admonitionStyles.note;
                const displayTitle = title && title !== type.toUpperCase() ? title : (admonitionStyles[type]?.defaultTitle || title || 'NOTA');

                return (
                  <div className={`my-6 flex overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs ${style.bgLight}`}>
                    <div className={`shrink-0 flex items-center justify-center w-12 text-white ${style.bgDark}`}>
                      <CaralIcon name={style.icon} size={22} color="white" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className={`font-bold text-sm sm:text-base mb-1.5 ${style.textDark}`}>
                        {displayTitle}
                      </div>
                      <div className={`text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${style.textLight}`}>
                        {cleanChildren(children)}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <blockquote
                  className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-neutral-700 dark:text-neutral-300 my-5 bg-blue-50/50 dark:bg-blue-950/20 py-3 pr-4 rounded-r-xl"
                  {...props}
                >
                  {children}
                </blockquote>
              );
            },

            // Table styling
            table({ children }) {
              return (
                <div className="my-6 w-full overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                  <table className="w-full text-left text-sm border-collapse">
                    {children}
                  </table>
                </div>
              );
            },
            thead({ children }) {
              return (
                <thead className="bg-neutral-100/80 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100">
                  {children}
                </thead>
              );
            },
            th({ children, ...props }) {
              return <th className="px-4 py-3 text-xs uppercase tracking-wider font-semibold" {...props}>{children}</th>;
            },
            td({ children, ...props }) {
              return (
                <td className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800/60 text-neutral-700 dark:text-neutral-300" {...props}>
                  {children}
                </td>
              );
            },

            // Headings with anchor link styling and icon support
            h1({ children, id, ...props }) {
              return renderTitleWithIcon(
                'h1',
                children,
                { ...props, id },
                'text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mt-8 mb-4 tracking-tight'
              );
            },
            h2({ children, id, ...props }) {
              const rawText = extractText(children);
              const computedId =
                id ||
                rawText
                  .replace(/[*_`]/g, '')
                  .replace(/!(?:icon|brand)-[\w-]+!/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');

              return renderTitleWithIcon(
                'h2',
                children,
                { ...props, id: computedId },
                'group flex items-center gap-2 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-10 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-800 tracking-tight scroll-mt-[90px]'
              );
            },
            h3({ children, id, ...props }) {
              const rawText = extractText(children);
              const computedId =
                id ||
                rawText
                  .replace(/[*_`]/g, '')
                  .replace(/!(?:icon|brand)-[\w-]+!/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');

              return renderTitleWithIcon(
                'h3',
                children,
                { ...props, id: computedId },
                'group flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white mt-7 mb-2 tracking-tight scroll-mt-[90px]'
              );
            },
            h4({ children, id, ...props }) {
              return renderTitleWithIcon(
                'h4',
                children,
                { ...props, id },
                'text-base font-bold text-neutral-900 dark:text-white mt-5 mb-2 scroll-mt-[90px]'
              );
            },

            // Paragraphs and lists
            p({ children, ...props }: any) {
              const childrenArray = React.Children.toArray(children);
              const containsBlock = childrenArray.some((child: any) => {
                if (!child || typeof child !== 'object') return false;
                const tagName = child.props?.node?.tagName || child.type;
                if (
                  typeof tagName === 'string' &&
                  /^(section-grid|sectiongrid|section-cards|sectioncards|table-of-contents|toc-grid|div|hr)$/i.test(
                    tagName
                  )
                ) {
                  return true;
                }
                return false;
              });

              if (containsBlock) {
                return <div className="mb-4 text-sm sm:text-base leading-7" {...props}>{children}</div>;
              }

              const rawText = extractText(children).trim();
              if (/^!(?:icon|brand)-([\w-]+)!/i.test(rawText)) {
                return renderTitleWithIcon(
                  'p',
                  children,
                  props,
                  'mb-4 flex items-center gap-1.5 align-middle text-sm sm:text-base leading-7'
                );
              }
              return <p className="mb-4 text-sm sm:text-base leading-7" {...props}>{children}</p>;
            },
            ul({ children, ...props }) {
              return <ul className="mb-4 pl-6 list-disc space-y-1.5 text-sm sm:text-base text-neutral-700 dark:text-neutral-300" {...props}>{children}</ul>;
            },
            ol({ children, ...props }) {
              return <ol className="mb-4 pl-6 list-decimal space-y-1.5 text-sm sm:text-base text-neutral-700 dark:text-neutral-300" {...props}>{children}</ol>;
            },
            li({ children, ...props }) {
              return <li className="leading-relaxed" {...props}>{children}</li>;
            },

            // Links
            a({ href, children, ...props }) {
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500 transition-colors"
                  {...props}
                >
                  {children}
                </a>
              );
            },

            // Images with alignment, layout preservation (CLS prevention) and loading skeleton
            img({ src, alt, ...props }) {
              return <MarkdownImage src={src} alt={alt} {...props} />;
            },

            // Section Cards, FAQ, and DocIndex components embedded directly in Markdown
            ...({
              'section-grid': (props: any) => renderSectionGrid(props),
              'sectiongrid': (props: any) => renderSectionGrid(props),
              'section-cards': (props: any) => renderSectionGrid(props),
              'sectioncards': (props: any) => renderSectionGrid(props),
              'table-of-contents': (props: any) => renderSectionGrid(props),
              'toc-grid': (props: any) => renderSectionGrid(props),
              'faq-accordion': (props: any) => renderFaq(props),
              'faq': (props: any) => renderFaq(props),
              'faq-section': (props: any) => renderFaq(props),
              'doc-index': (props: any) => renderDocIndex(props),
              'docindex': (props: any) => renderDocIndex(props),
              'doc-directory': (props: any) => renderDocIndex(props),
            } as any),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-neutral-800 bg-[#090d16] text-neutral-200 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1322] border-b border-neutral-800 text-xs text-neutral-400 font-mono">
        <span className="uppercase tracking-wider font-semibold text-[11px] text-blue-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-neutral-400 hover:text-white bg-neutral-800/70 hover:bg-neutral-800 transition-colors"
          title="Copiar código"
        >
          {copied ? (
            <>
              <CaralIcon name="check" size={14} classname="text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copiado</span>
            </>
          ) : (
            <>
              <CaralIcon name="copy" size={14} />
              <span className="text-[11px]">Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function MarkdownImage({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src?: any; alt?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) return <img alt={alt} {...props} />;

  const srcStr = typeof src === 'string' ? src : '';
  const [url, hash] = srcStr.split('#');

  let alignClass = 'mx-auto block';
  if (hash === 'align-center') alignClass = 'mx-auto block';
  else if (hash === 'align-left') alignClass = 'mr-auto block';
  else if (hash === 'align-right') alignClass = 'ml-auto block';
  else if (hash === 'full-width') alignClass = 'w-full block';

  let styleObj: React.CSSProperties = {};
  const isScaleAlt = alt && !isNaN(Number(alt));
  if (isScaleAlt) {
    const scale = Number(alt);
    styleObj.width = `${scale * 100}%`;
  }

  const captionText = alt && !isScaleAlt ? alt : undefined;

  return (
    <span
      className={`my-6 block rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs bg-neutral-100/80 dark:bg-neutral-900/80 ${alignClass}`}
      style={styleObj}
    >
      <span className="relative w-full min-h-[220px] sm:min-h-[280px] flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {/* Placeholder skeleton con animación sutil mientras descarga la imagen */}
        {!isLoaded && !hasError && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-neutral-400 dark:text-neutral-500 bg-neutral-200/40 dark:bg-neutral-800/40 animate-pulse">
            <svg
              className="w-9 h-9 stroke-current opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="text-xs font-medium tracking-wide opacity-50">Cargando imagen...</span>
          </span>
        )}

        {/* Fallback en caso de que la imagen falle */}
        {hasError ? (
          <span className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500 flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z"
              />
            </svg>
            <span>No se pudo cargar la imagen</span>
          </span>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url || srcStr}
            alt={captionText || 'Imagen de documentación'}
            className={`w-full h-auto object-contain max-h-[600px] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            {...props}
          />
        )}
      </span>

      {captionText && (
        <span className="block text-center text-xs text-neutral-500 dark:text-neutral-400 py-2.5 px-4 border-t border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
          {captionText}
        </span>
      )}
    </span>
  );
}



