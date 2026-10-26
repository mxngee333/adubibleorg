import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Globe,
  Plus,
  Check,
  Search,
  Sparkles,
  Upload,
  Trash2,
  BookPlus,
  Layers,
  CloudDownload,
} from 'lucide-react';
import {
  BibleBook,
  BibleVersion,
  CustomBibleAddon,
  LanguageMetadata,
  VerseData,
} from '../types/bible';

interface LanguageAddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: LanguageMetadata[];
  allVersions: BibleVersion[];
  activeVersionIds: string[];
  onToggleVersionInParallel: (versionId: string) => void;
  customAddons: CustomBibleAddon[];
  onSaveCustomAddon: (addon: CustomBibleAddon) => Promise<void>;
  onDeleteCustomAddon: (addonId: string) => Promise<void>;
  books: BibleBook[];
  currentBookId: string;
  currentChapter: number;
}

interface RemoteTranslationItem {
  id: string;
  name: string;
  englishName: string;
  shortName: string;
  language: string;
  languageName: string;
  languageEnglishName: string;
  textDirection: 'ltr' | 'rtl';
}

export const LanguageAddonModal: React.FC<LanguageAddonModalProps> = ({
  isOpen,
  onClose,
  languages,
  allVersions,
  activeVersionIds,
  onToggleVersionInParallel,
  customAddons,
  onSaveCustomAddon,
  onDeleteCustomAddon,
  books,
  currentBookId,
  currentChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'live-repo' | 'create-addon'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');

  // Live Open-Source Repository state
  const [remoteTranslations, setRemoteTranslations] = useState<RemoteTranslationItem[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [remoteQuery, setRemoteQuery] = useState('');

  // Custom Addon Builder state
  const [addonName, setAddonName] = useState('');
  const [addonShortName, setAddonShortName] = useState('');
  const [addonLangCode, setAddonLangCode] = useState('tw');
  const [addonLangName, setAddonLangName] = useState('Twi (Akan)');
  const [addonNativeName, setAddonNativeName] = useState('Twerɛ Kronkron');
  const [addonDir, setAddonDir] = useState<'ltr' | 'rtl'>('ltr');
  const [addonBookId, setAddonBookId] = useState(currentBookId || 'EPH');
  const [addonChapter, setAddonChapter] = useState(currentChapter || 1);
  const [addonRawText, setAddonRawText] = useState(
    `1 Paulo, Yesu Kristo somafoɔ a ɛnam Onyankopɔn pɛ so, de kɔma akronkronfoɔ a wɔwɔ Efeso ne Kristo Yesu mu agyidifoɔ:\n2 Adom ne asomdwoeɛ a efi yɛn Agya Onyankopɔn ne Awurade Yesu Kristo nka mo.\n3 Nhyira nka yɛn Awurade Yesu Kristo Nyankopɔn ne Agya a ɔnam Kristo so ahyira yɛn honhom mu nhyira nyinaa wɔ soro hɔnom.`
  );
  const [addonStatus, setAddonStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'live-repo' && remoteTranslations.length === 0) {
      setLoadingRemote(true);
      fetch('https://bible.helloao.org/api/available_translations.json')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.translations)) {
            setRemoteTranslations(data.translations);
          }
        })
        .catch(() => {
          // Offline or blocked; gracefully handled
        })
        .finally(() => setLoadingRemote(false));
    }
  }, [isOpen, activeTab, remoteTranslations.length]);

  const filteredVersions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVersions.filter((v) => {
      if (selectedLangFilter !== 'all' && v.languageCode !== selectedLangFilter) {
        return false;
      }
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.shortName.toLowerCase().includes(q) ||
        v.languageName.toLowerCase().includes(q) ||
        v.nativeLanguageName.toLowerCase().includes(q) ||
        v.languageCode.toLowerCase().includes(q)
      );
    });
  }, [allVersions, searchQuery, selectedLangFilter]);

  const filteredRemote = useMemo(() => {
    const q = remoteQuery.trim().toLowerCase();
    if (!q) return remoteTranslations.slice(0, 60);
    return remoteTranslations
      .filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.englishName && t.englishName.toLowerCase().includes(q)) ||
          (t.languageName && t.languageName.toLowerCase().includes(q)) ||
          (t.languageEnglishName && t.languageEnglishName.toLowerCase().includes(q)) ||
          (t.shortName && t.shortName.toLowerCase().includes(q))
      )
      .slice(0, 80);
  }, [remoteTranslations, remoteQuery]);

  if (!isOpen) return null;

  const parseRawVerses = (raw: string): VerseData[] => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const verses: VerseData[] = [];
    lines.forEach((line, idx) => {
      const match = line.match(/^(\d+)[\s.:)-]+(.+)$/);
      if (match) {
        verses.push({
          verse: parseInt(match[1], 10),
          text: match[2].trim(),
        });
      } else {
        verses.push({
          verse: idx + 1,
          text: line,
        });
      }
    });
    return verses;
  };

  const handleSaveNewAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName.trim() || !addonShortName.trim()) return;
    const cleanCode = addonShortName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    const id = `custom-${cleanCode}`;
    const existing = customAddons.find((a) => a.id === id);
    const chapterKey = `${addonBookId}.${addonChapter}`;
    const parsedVerses = parseRawVerses(addonRawText);

    const updatedAddon: CustomBibleAddon = {
      id,
      code: cleanCode,
      name: addonName.trim(),
      shortName: addonShortName.trim().toUpperCase(),
      languageCode: addonLangCode.trim() || 'custom',
      languageName: addonLangName.trim() || 'Custom Language',
      nativeLanguageName: addonNativeName.trim() || addonLangName.trim(),
      dir: addonDir,
      description: `User-installed translation pack (${addonLangName})`,
      addedAt: Date.now(),
      chapters: {
        ...(existing?.chapters || {}),
        [chapterKey]: parsedVerses,
      },
    };

    await onSaveCustomAddon(updatedAddon);
    if (!activeVersionIds.includes(id)) {
      onToggleVersionInParallel(id);
    }
    setAddonStatus(
      `Saved "${updatedAddon.name}" (${parsedVerses.length} verses for ${addonBookId} ${addonChapter}) and added to Parallel Reader!`
    );
    setTimeout(() => setAddonStatus(null), 4000);
  };

  const handleUploadJsonAddon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && parsed.name && parsed.chapters) {
          const id = parsed.id || `custom-${Date.now()}`;
          const addon: CustomBibleAddon = {
            id,
            code: parsed.code || id,
            name: parsed.name,
            shortName: (parsed.shortName || parsed.code || 'CUST').toUpperCase(),
            languageCode: parsed.languageCode || 'custom',
            languageName: parsed.languageName || 'Custom Language',
            nativeLanguageName: parsed.nativeLanguageName || parsed.languageName || 'Custom',
            dir: parsed.dir === 'rtl' ? 'rtl' : 'ltr',
            description: parsed.description || 'Imported JSON Bible Add-on Pack',
            addedAt: Date.now(),
            chapters: parsed.chapters,
          };
          await onSaveCustomAddon(addon);
          onToggleVersionInParallel(addon.id);
          setAddonStatus(`Imported "${addon.name}" JSON translation pack into Parallel Reader!`);
        }
      } catch {
        setAddonStatus('Invalid JSON format. Please check the structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleInstallRemoteTranslation = async (item: RemoteTranslationItem) => {
    const id = `helloao-${item.id.toLowerCase()}`;
    const addon: CustomBibleAddon = {
      id,
      code: item.id,
      name: item.englishName || item.name,
      shortName: item.shortName || item.id.toUpperCase(),
      languageCode: item.language || 'en',
      languageName: item.languageEnglishName || item.languageName || item.language,
      nativeLanguageName: item.languageName || item.languageEnglishName || item.language,
      dir: item.textDirection === 'rtl' ? 'rtl' : 'ltr',
      description: `Live Open-Source Stream via Free Use Bible API (${item.id})`,
      addedAt: Date.now(),
      chapters: {},
    };
    await onSaveCustomAddon(addon);
    if (!activeVersionIds.includes(id)) {
      onToggleVersionInParallel(id);
    }
    setAddonStatus(`Connected "${addon.name}" (${addon.languageName}) to Parallel Reader!`);
    setTimeout(() => setAddonStatus(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200">
                Multilingual & Parallel Version Add-on Engine
              </h2>
              <p className="text-xs text-stone-400">
                Twi (Twerɛ Kronkron) • 24 Mega-Multilingual SEO Languages • Original Hebrew/Greek • 1,000+ Live Translations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 bg-stone-900/70 px-5 py-2.5">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Built-In & Parallel Languages ({allVersions.length})
            </button>
            <button
              onClick={() => setActiveTab('live-repo')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'live-repo'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <CloudDownload className="h-3.5 w-3.5" />
              1,000+ Global Open-Source Repo
            </button>
            <button
              onClick={() => setActiveTab('create-addon')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'create-addon'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <BookPlus className="h-3.5 w-3.5" />
              + Add New Language / Custom Version
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Active Parallel Panes: {activeVersionIds.length}/4</span>
          </div>
        </div>

        {addonStatus && (
          <div className="mx-5 mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-2.5 text-xs font-medium text-emerald-200 flex items-center justify-between">
            <span>{addonStatus}</span>
            <button onClick={() => setAddonStatus(null)} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Built-in 35+ Languages & Versions Catalog */}
        {activeTab === 'catalog' && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            {/* Search & Language Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Twi, NKJV, KJV, Hebrew, Greek, Yoruba, Hausa, Swahili, French, Arabic..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <select
                value={selectedLangFilter}
                onChange={(e) => setSelectedLangFilter(e.target.value)}
                className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs sm:text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Languages ({languages.length})</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} — {lang.nativeName} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Language Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedLangFilter('all')}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  selectedLangFilter === 'all'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                All
              </button>
              {languages.slice(0, 18).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLangFilter(lang.code)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    selectedLangFilter === lang.code
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Versions Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1">
              {filteredVersions.map((ver) => {
                const isActive = activeVersionIds.includes(ver.id);
                const isCustom = ver.sourceType === 'custom';
                return (
                  <div
                    key={ver.id}
                    className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/10 shadow-md'
                        : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-800 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-300">
                            {ver.shortName}
                          </span>
                          <span className="ml-2 text-xs text-stone-400">
                            {ver.languageName} ({ver.nativeLanguageName})
                          </span>
                        </div>
                        {ver.hasStrongs && (
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                            Strong&apos;s
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 font-bold text-sm text-white">{ver.name}</h4>
                      <p className="mt-1 text-xs text-stone-400 line-clamp-2">{ver.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        {ver.dir === 'rtl' ? 'RTL Script' : 'LTR Script'} • {ver.year || 'Canon'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isCustom && (
                          <button
                            onClick={() => onDeleteCustomAddon(ver.id)}
                            className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-950/50 hover:text-rose-400 transition"
                            title="Delete custom add-on"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onToggleVersionInParallel(ver.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            isActive
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-200 hover:bg-amber-500/20 hover:text-amber-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Active in Parallel
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" /> Add Pane
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: 1,000+ Live Open-Source Bible Repository */}
        {activeTab === 'live-repo' && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  Open-Source Global Bible Cloud Catalog (Free Use Bible API)
                </h3>
                <p className="text-xs text-stone-400">
                  Connect any additional world language or regional Bible version directly into your parallel columns with 1 click.
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={remoteQuery}
                  onChange={(e) => setRemoteQuery(e.target.value)}
                  placeholder="Filter 1,000+ translations by language or name..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {loadingRemote ? (
              <div className="flex-1 flex items-center justify-center text-sm text-stone-400">
                Loading global open-source Bible translations catalog...
              </div>
            ) : remoteTranslations.length === 0 ? (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 text-center text-xs text-stone-400">
                You are currently browsing in Offline Vault Mode. Use the <strong>Built-In &amp; Parallel Languages</strong> tab (40+ versions ready offline) or <strong>+ Add New Language / Custom Version</strong> tab!
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1">
                {filteredRemote.map((item) => {
                  const addonId = `helloao-${item.id.toLowerCase()}`;
                  const isConnected = activeVersionIds.includes(addonId);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-stone-800 bg-stone-900/60 p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-300">
                            {item.shortName || item.id}
                          </span>
                          <span className="text-xs text-stone-400">
                            {item.languageEnglishName || item.languageName}
                          </span>
                        </div>
                        <h4 className="mt-2 font-bold text-sm text-white">
                          {item.englishName || item.name}
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5">{item.name}</p>
                      </div>
                      <button
                        onClick={() => handleInstallRemoteTranslation(item)}
                        className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                          isConnected
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-stone-800 text-amber-300 hover:bg-amber-500 hover:text-stone-950'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Connected in Parallel
                          </>
                        ) : (
                          <>
                            <CloudDownload className="h-3.5 w-3.5" /> Install &amp; Read in Parallel
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Create or Import Custom Language / Translation Addon */}
        {activeTab === 'create-addon' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleSaveNewAddon} className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 space-y-4">
                  <h3 className="text-sm font-bold text-amber-200">
                    Create or Extend a Custom Language / Bible Version Add-on
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">
                        Version Full Name *
                      </label>
                      <input
                        type="text"
                        value={addonName}
                        onChange={(e) => setAddonName(e.target.value)}
                        placeholder="e.g. Asante Twi Exegetical Study Bible"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">
                        Short Code / Badge *
                      </label>
                      <input
                        type="text"
                        value={addonShortName}
                        onChange={(e) => setAddonShortName(e.target.value)}
                        placeholder="e.g. TWI-EXEG"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">
                        Language Name (English)
                      </label>
                      <input
                        type="text"
                        value={addonLangName}
                        onChange={(e) => setAddonLangName(e.target.value)}
                        placeholder="e.g. Twi / Fante / Ga / Dagbani"
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">
                        Native Language Name &amp; ISO Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={addonNativeName}
                          onChange={(e) => setAddonNativeName(e.target.value)}
                          placeholder="e.g. Akan / Mfantse"
                          className="flex-1 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={addonLangCode}
                          onChange={(e) => setAddonLangCode(e.target.value)}
                          placeholder="tw"
                          className="w-16 rounded-xl border border-stone-700 bg-stone-950 px-2.5 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Target Book</label>
                      <select
                        value={addonBookId}
                        onChange={(e) => setAddonBookId(e.target.value)}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                      >
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.names.en} ({b.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Chapter #</label>
                      <input
                        type="number"
                        min={1}
                        max={150}
                        value={addonChapter}
                        onChange={(e) => setAddonChapter(Number(e.target.value) || 1)}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Script Direction</label>
                      <select
                        value={addonDir}
                        onChange={(e) => setAddonDir(e.target.value as 'ltr' | 'rtl')}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white"
                      >
                        <option value="ltr">Left-to-Right (LTR)</option>
                        <option value="rtl">Right-to-Left (RTL - Arabic/Hebrew)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1">
                      Paste Verses (One verse per line, e.g. &ldquo;1 In the beginning...&rdquo;)
                    </label>
                    <textarea
                      rows={6}
                      value={addonRawText}
                      onChange={(e) => setAddonRawText(e.target.value)}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-3 text-xs font-serif text-stone-100 leading-relaxed focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-xs sm:text-sm font-bold text-stone-950 hover:bg-amber-400 transition"
                  >
                    Save Language / Version Add-on &amp; Activate in Parallel Reader
                  </button>
                </div>
              </form>

              {/* Right Column: JSON Pack Upload & Installed Add-ons */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Bulk JSON Bible Pack Importer
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Have a full JSON Bible translation file for a new language or dialect? Upload it directly to register all books &amp; chapters offline.
                  </p>
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-stone-900 py-2.5 text-xs font-bold text-amber-300 hover:bg-stone-800 transition">
                    <Upload className="h-4 w-4" />
                    <span>Upload .JSON Bible Add-on</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadJsonAddon}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Your Installed Custom Add-ons ({customAddons.length})
                  </h4>
                  {customAddons.length === 0 ? (
                    <p className="text-xs text-stone-500">
                      No custom translation packs added yet.
                    </p>
                  ) : (
                    customAddons.map((ca) => (
                      <div
                        key={ca.id}
                        className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-950 p-2.5 text-xs"
                      >
                        <div>
                          <div className="font-bold text-amber-200">
                            {ca.shortName} • {ca.name}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            {ca.languageName} ({Object.keys(ca.chapters).length} local chapters)
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteCustomAddon(ca.id)}
                          className="rounded-lg p-1.5 text-stone-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
