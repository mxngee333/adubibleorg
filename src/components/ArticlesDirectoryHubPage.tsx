import React, { useState, useMemo } from 'react';
import { getAllArticles, getAllArticleCategories } from '../data/articlesCorpus';
import { Search, Sparkles, BookOpen, Clock, ArrowRight, Shield, Globe, Award, Check } from 'lucide-react';
import { AduBibleLogo } from './AduBibleLogo';

interface ArticlesDirectoryHubPageProps {
  onSelectArticle: (slug: string) => void;
  onOpenParallelReader: (versions: string[], bookSlug?: string, chapter?: number) => void;
  footer?: React.ReactNode;
}

export const ArticlesDirectoryHubPage: React.FC<ArticlesDirectoryHubPageProps> = ({
  onSelectArticle,
  onOpenParallelReader,
  footer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allArticles = useMemo(() => getAllArticles(), []);
  const categories = useMemo(() => ['ALL', ...getAllArticleCategories()], []);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchesCat =
        selectedCategory === 'ALL' || article.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.subtitle.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-serif selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner / Hero Header */}
      <section className="relative overflow-hidden border-b border-stone-800 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 px-4 sm:px-6 py-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto space-y-6 text-center">
          <div className="flex justify-center pt-2">
            <a href="/" className="transition hover:opacity-95" title="AduBible.org® — Sovereign Scripture Hub">
              <AduBibleLogo size="lg" />
            </a>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-sans font-bold text-amber-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AduBible Scripture Articles &amp; Expository Hub</span>
            <span className="text-stone-500">·</span>
            <span className="text-emerald-400">100% Ads-Free</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-amber-100 tracking-tight leading-tight max-w-4xl mx-auto">
            Scripture Guides, Lexical Exegesis &amp; Translation Studies
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Deep, uncompromising biblical scholarship dedicated to humanity. Explore multi-column parallel exegesis, Strong’s concordance word studies, ancient manuscript history, and the living heritage of holy scripture without commercial advertisements or paywalls.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-sans text-stone-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>15 Deep Pillar Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>51,000+ Words of Scholarship</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-400" />
              <span>35+ Global Languages Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Zero Ads &amp; Zero Paywalls</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section className="sticky top-0 z-30 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 sm:px-6 py-3 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                {cat === 'ALL' ? 'All Guides (15)' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides or topics..."
              className="w-full rounded-lg border border-stone-800 bg-stone-900 pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500/50 focus:outline-none transition"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 space-y-3 font-sans">
            <p className="text-base text-stone-400">No scripture guides matched your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-amber-400 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.slug}
                onClick={() => onSelectArticle(article.slug)}
                className="group cursor-pointer rounded-2xl border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-900/90 shadow-lg hover:shadow-2xl transition duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Thumbnail Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-stone-800/80 bg-stone-950">
                  <img
                    src={`/assets/articles/${article.slug}-1200x900.webp`}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-stone-950/80 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-sans font-bold text-amber-300">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="rounded-md bg-stone-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-sans text-stone-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-stone-400" />
                      {article.readTimeMinutes} min
                    </span>
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100 group-hover:text-amber-200 transition leading-snug line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed font-sans">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-sans text-stone-400">
                    <span className="text-stone-400">{article.wordCount.toLocaleString()} words</span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                      <span>Read Guide</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Global Mission Banner at bottom */}
        <div className="mt-16 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-stone-900 to-stone-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              The Great Commission in the Digital Age
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-emerald-200">
              Send the Word Out · Dedicated to Humanity
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Honor the legacy of Apostle Kwame Adu by exploring God’s Word in your native tongue alongside original Hebrew and Greek texts in our 4-column parallel reader.
            </p>
          </div>
          <button
            onClick={() => onOpenParallelReader(['nkjv', 'twi', 'kjv', 'bsb'], 'ephesians', 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-lg transition shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span>Open Parallel Reader</span>
          </button>
        </div>
      </main>

      {/* Shared Site Footer */}
      {footer}
    </div>
  );
};
