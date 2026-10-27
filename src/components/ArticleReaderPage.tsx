import React, { useEffect, useState } from 'react';
import { PillarArticle, getAllArticles } from '../data/articlesCorpus';
import { ChevronLeft, Share2, BookOpen, Clock, Calendar, Check, ArrowRight, Sparkles, Shield, Bookmark, Tag } from 'lucide-react';

interface ArticleReaderPageProps {
  article: PillarArticle;
  onBackToDirectory: () => void;
  onOpenArticleBySlug: (slug: string) => void;
  onOpenParallelReader: (versions: string[], bookSlug?: string, chapter?: number) => void;
  footer?: React.ReactNode;
}

export const ArticleReaderPage: React.FC<ArticleReaderPageProps> = ({
  article,
  onBackToDirectory,
  onOpenArticleBySlug,
  onOpenParallelReader,
  footer,
}) => {
  const [copied, setCopied] = useState(false);
  const allArticles = getAllArticles();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = article.metaTitle;
  }, [article]);

  const handleShare = () => {
    const url = `https://adubible.org/articles/${article.slug}/`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentIndex = allArticles.findIndex((a) => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : undefined;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : undefined;
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug && (a.category === article.category || Math.random() > 0.5))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-serif selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-sans font-semibold text-stone-300 hover:border-amber-500/50 hover:bg-stone-800 hover:text-amber-300 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>All Articles</span>
            </button>
            <span className="hidden sm:inline-block text-xs font-sans text-stone-500">|</span>
            <span className="hidden sm:inline-block text-xs font-sans text-amber-400 font-medium truncate max-w-xs">
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenParallelReader(['nkjv', 'kjv', 'bsb', 'twi'], 'ephesians', 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-sans font-bold text-white shadow-lg transition"
              title="Launch 4-Column Parallel Bible Reader"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open Parallel Reader</span>
              <span className="sm:hidden">Read Bible</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-xs font-sans font-medium text-stone-300 hover:border-stone-700 hover:text-white transition"
              title="Copy clean shareable link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="text-xs font-sans mb-6 text-stone-400 flex items-center gap-2 flex-wrap">
          <a href="/" className="hover:text-amber-300 transition text-stone-400">Home</a>
          <span>›</span>
          <button onClick={onBackToDirectory} className="hover:text-amber-300 transition text-stone-400">
            Scripture Guides &amp; Articles
          </button>
          <span>›</span>
          <span className="text-amber-300 font-medium truncate max-w-xs">{article.category}</span>
        </nav>

        {/* Hero Header */}
        <header className="mb-8 space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-sans font-bold text-amber-300">
              <Sparkles className="h-3 w-3" />
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-sans font-bold text-emerald-400">
              <Shield className="h-3 w-3" />
              100% Ads-Free Covenant
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-sans text-stone-400">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              {article.readTimeMinutes} min read ({article.wordCount.toLocaleString()} words)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-amber-100 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-sans font-normal border-l-2 border-amber-500/50 pl-4 py-1 italic">
            {article.subtitle}
          </p>

          <div className="flex items-center justify-between text-xs font-sans text-stone-400 border-t border-b border-stone-800/80 py-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-300">{article.author}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated {article.dateModified}
              </span>
            </div>
            <div className="text-[11px] text-stone-500">
              AduBible.org Scripture Archive
            </div>
          </div>
        </header>

        {/* Triple-Ratio Hero Art Showcase */}
        <div className="mb-10 rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-900 shadow-2xl">
          <img
            src={`/assets/articles/${article.slug}-1600x900.webp`}
            alt={article.title}
            className="w-full h-auto object-cover max-h-[460px]"
            loading="eager"
          />
        </div>

        {/* In-Article Top CTA Bar */}
        <div className="mb-10 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 justify-center sm:justify-start">
              <BookOpen className="h-4 w-4" />
              Read Scripture in Distraction-Free Parallel
            </h4>
            <p className="text-xs text-stone-300 font-sans">
              Compare NKJV, KJV, Berean Standard Bible, Asante Twi, and Greek Textus Receptus side-by-side with zero ads.
            </p>
          </div>
          <button
            onClick={() => onOpenParallelReader(['nkjv', 'kjv', 'bsb', 'twi'], 'ephesians', 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-sans font-bold text-white shadow-md transition shrink-0"
          >
            <span>Launch Reader</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Jump Table of Contents */}
        {article.sections && article.sections.length > 0 && (
          <div className="mb-10 rounded-xl border border-stone-800 bg-stone-900/60 p-5 space-y-3 font-sans">
            <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-2">
              <Bookmark className="h-3.5 w-3.5" />
              In This Expository Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {article.sections.map((sec, idx) => (
                <a
                  key={idx}
                  href={`#${sec.id}`}
                  className="flex items-center gap-2 text-stone-300 hover:text-amber-300 transition py-1 truncate"
                >
                  <span className="text-amber-500/60 text-[10px] font-mono font-bold">0{idx + 1}.</span>
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rich Article Semantic Content */}
        <article
          className="prose prose-invert max-w-none text-stone-100 font-serif leading-relaxed space-y-6 text-base sm:text-lg"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* Mid-Article Bottom Conversion Sanctuary Box */}
        <div className="my-12 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-stone-900 to-stone-950 p-6 sm:p-8 space-y-4 text-center font-sans">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-2xl mx-auto">
            🛡️
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
            Dedicated to Humanity · 100% Ads-Free Forever
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            AduBible operates in honor of the gospel legacy of <strong>Apostle Kwame Adu</strong> of Nsuhia, Ghana. We never display commercial advertisements, never charge subscription paywalls, and never track your reading behavior.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenParallelReader(['nkjv', 'twi', 'kjv', 'bsb'], 'genesis', 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg transition"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Genesis 1 in 4 Languages</span>
            </button>
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition"
            >
              <span>More Articles</span>
            </button>
          </div>
        </div>

        {/* Tag Pills */}
        {article.tags && article.tags.length > 0 && (
          <div className="my-8 pt-4 border-t border-stone-800/80 flex items-center gap-2 flex-wrap font-sans text-xs">
            <Tag className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-stone-400">Topics:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1 text-stone-300 hover:border-amber-500/40 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Previous & Next Article Navigation */}
        <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
          {prevArticle ? (
            <button
              onClick={() => onOpenArticleBySlug(prevArticle.slug)}
              className="flex flex-col items-start gap-1 p-4 rounded-xl border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-900 text-left transition"
            >
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">← Previous Guide</span>
              <span className="font-serif font-bold text-sm text-stone-200 line-clamp-2">{prevArticle.title}</span>
            </button>
          ) : <div />}

          {nextArticle && (
            <button
              onClick={() => onOpenArticleBySlug(nextArticle.slug)}
              className="flex flex-col items-end gap-1 p-4 rounded-xl border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-900 text-right transition"
            >
              <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">Next Guide →</span>
              <span className="font-serif font-bold text-sm text-stone-200 line-clamp-2">{nextArticle.title}</span>
            </button>
          )}
        </div>

        {/* Related Articles Cards */}
        {relatedArticles.length > 0 && (
          <div className="my-12 pt-8 border-t border-stone-800 space-y-4 font-sans">
            <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Related Scripture Guides &amp; Historical Studies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.slug}
                  onClick={() => onOpenArticleBySlug(rel.slug)}
                  className="cursor-pointer rounded-xl border border-stone-800/80 bg-stone-900/60 hover:border-amber-500/40 p-4 space-y-2 transition flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400">{rel.category}</span>
                    <h4 className="font-serif font-bold text-sm text-stone-200 line-clamp-2 hover:text-amber-300 transition">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/60">
                    <span>{rel.readTimeMinutes} min read</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5">Read →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Shared Site Footer */}
      {footer}
    </div>
  );
};
