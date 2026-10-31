import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  BookmarkPlus,
  Compass,
  Languages,
  Scroll,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Flame,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import {
  askAduBibleAI,
  getSanctuaryFallbackAnswer,
  AskAduBibleContext,
  AskAduBibleMessage,
} from '../services/askAduBibleService';
import { AduBibleLogo } from './AduBibleLogo';

interface AskAduBiblePageProps {
  onBackToReader: () => void;
  onNavigateToPassage?: (bookSlug: string, chapter: number, verse?: number) => void;
  onSaveToVaultNotes?: (title: string, noteBody: string, passageRef: string) => void;
  footer?: React.ReactNode;
}

interface AncientWisdomInquiry {
  id: string;
  badge: string;
  title: string;
  query: string;
  preview: string;
  bookContext: { bookSlug: string; chapter: number; verse?: number; bookNameEn: string };
}

const CURATED_ANCIENT_INQUIRIES: AncientWisdomInquiry[] = [
  {
    id: 'yhwh-name',
    badge: '👑 The Divine Name',
    title: 'The Sacred Name YHWH (יהוה) & The Tetragrammaton',
    query: 'What is the ancient linguistic and theological meaning of the divine Name YHWH (יהוה) in Exodus 3:14 and the Hebrew Masoretic scriptures?',
    preview: 'Unpack the covenantal self-existence of "I AM THAT I AM" (Ehyeh Asher Ehyeh) and how YHWH reveals God\'s unchangeable fidelity.',
    bookContext: { bookSlug: 'exodus', chapter: 3, verse: 14, bookNameEn: 'Exodus' },
  },
  {
    id: 'shalom-covenant',
    badge: '🕊️ Hebrew Exegesis',
    title: 'The Covenant of Shalom (שָׁלוֹם): Beyond Peace to Total Wholeness',
    query: 'Explain the Hebrew root and biblical covenant of Shalom (שָׁלוֹם, H7965). How does it mean more than the absence of conflict?',
    preview: 'Discover the ancient root shalam—completeness, divine restoration, restitution, and holistic reconciliation with God and man.',
    bookContext: { bookSlug: 'numbers', chapter: 6, verse: 24, bookNameEn: 'Numbers' },
  },
  {
    id: 'agape-phileo',
    badge: '📜 Greek Nuance',
    title: 'Agape (ἀγάπη) vs. Phileo (φιλέω) in John 21',
    query: 'How does original Greek distinguish between Agape (G26) and Phileo (G5368) in Jesus’ restoration of Peter in John 21:15-17?',
    preview: 'Analyze the profound dialogue on the Sea of Tiberias where sacrificial divine covenant love meets brotherly affection.',
    bookContext: { bookSlug: 'john', chapter: 21, verse: 15, bookNameEn: 'John' },
  },
  {
    id: 'tetelestai',
    badge: '⚡ Covenant Victory',
    title: 'Tetelestai (τετέλεσται): "It is Finished" — The Legal Receipt',
    query: 'What is the historical, commercial, and theological meaning of Tetelestai (G5055) as uttered by Jesus in John 19:30?',
    preview: 'Explore the ancient papyrological receipts stamped "Tetelestai" meaning "Paid in Full," confirming humanity’s sin-debt was forever cleared.',
    bookContext: { bookSlug: 'john', chapter: 19, verse: 30, bookNameEn: 'John' },
  },
  {
    id: 'beatitudes',
    badge: '🌿 Kingdom Ethics',
    title: 'The Beatitudes in Matthew 5: The Charter of the Kingdom of Heaven',
    query: 'Provide an in-depth exegetical breakdown of the Beatitudes in Matthew 5:1-12. What does "Makarios" (blessed) mean in ancient Greek?',
    preview: 'Understand Makarios as divine favor and inner tranquility untethered to external circumstances, ushering in God’s heavenly reign.',
    bookContext: { bookSlug: 'matthew', chapter: 5, verse: 3, bookNameEn: 'Matthew' },
  },
  {
    id: 'asante-twi-adom',
    badge: '🇬🇭 African Heritage',
    title: 'Tweduampɔn Nyame & Adom (Grace) in Asante Twi Heritage',
    query: 'How does the Asante Twi translation (Twerɛ Kronkron) translate and express "Tweduampɔn Nyame", "Adom", and "Asomdwoeɛ"?',
    preview: 'Explore the profound Akan theological ontology: Tweduampɔn as the dependable tree of eternity upon which one leans without slipping.',
    bookContext: { bookSlug: 'ephesians', chapter: 1, verse: 2, bookNameEn: 'Ephesians' },
  },
  {
    id: 'psalm-91-elyon',
    badge: '🛡️ Ancient Sanctuary',
    title: 'Psalm 91: The Secret Place of the Most High (Elyon & Shaddai)',
    query: 'Break down Psalm 91:1 in Hebrew: What are the divine titles Elyon (H5945) and Shaddai (H7706), and what is the Seter (secret place)?',
    preview: 'Journey into the four divine names of God in Psalm 91: Elyon, Shaddai, Yahweh, and Elohim—the fortress of sovereign protection.',
    bookContext: { bookSlug: 'psalms', chapter: 91, verse: 1, bookNameEn: 'Psalms' },
  },
  {
    id: 'ephesians-armor',
    badge: '⚔️ Spiritual Exegesis',
    title: 'The Full Armor of God in Ephesians 6: Panoplia (πανοπλία)',
    query: 'What is the Greek exegesis of the Full Armor of God (Panoplia, G3833) in Ephesians 6:10-18, and how does it relate to Isaiah?',
    preview: 'Analyze each piece of armor as God’s own garments from Isaiah 59:17 conferred upon believers in covenant union with Christ.',
    bookContext: { bookSlug: 'ephesians', chapter: 6, verse: 11, bookNameEn: 'Ephesians' },
  },
];

const FAQS = [
  {
    q: 'What is YHWH AI and how was its biblical intelligence developed?',
    a: 'YHWH AI (Ask AduBible) is a sovereign, unmonetized artificial intelligence engine specially trained on the 66 canonical books of the Holy Bible, ancient Hebrew Masoretic codices, Greek Textus Receptus, Brenton Septuagint, Strong’s Concordance numbering, Brown-Driver-Briggs, and Thayer lexicons. Created in honor of the gospel legacy of Apostle Kwame Adu (Nsuhia, Ghana), it provides rigorous textual exegesis with zero commercial advertisements or behavioral data tracking.',
  },
  {
    q: 'How does YHWH AI handle original Hebrew and Greek root words?',
    a: 'Every biblical inquiry cross-references original language manuscripts, providing exact Strong\'s Concordance numbering (e.g. H7965 for Shalom, G26 for Agape), original script glyphs, transliterations, and nuanced definitions, preventing shallow interpretations and unlocking deep lexical clarity.',
  },
  {
    q: 'Can YHWH AI analyze the Asante Twi and African Bible translations?',
    a: 'Yes. YHWH AI uniquely incorporates the linguistic richness of the Asante Twi Holy Bible (Twerɛ Kronkron), Akuapem Twi, Ewe (Eʋegbe), Gã, and Yoruba, revealing how indigenous theological terms—such as Tweduampɔn Nyame (The Dependable Almighty) and Adom (Grace)—faithfully articulate eternal biblical truths.',
  },
  {
    q: 'How do I jump directly from an AI answer into the 4-column parallel reader?',
    a: 'Every answer that cites a passage features a direct "Open in 4-Column Reader" button. Tapping it instantly navigates to that exact book, chapter, and verse side-by-side across NKJV, KJV, Asante Twi, and Greek/Hebrew texts with real-time verse alignment.',
  },
  {
    q: 'Is my theological research and chat history private?',
    a: '100% private. In alignment with our strict Ads-Free Covenant, your chats and theological questions are never logged for commercial advertising profiling, never sold to data brokers, and never used to target marketing campaigns. Your personal study remains a sacred sanctuary between you and God.',
  },
];

export const AskAduBiblePage: React.FC<AskAduBiblePageProps> = ({
  onBackToReader,
  onNavigateToPassage,
  onSaveToVaultNotes,
  footer,
}) => {
  const [messages, setMessages] = useState<AskAduBibleMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcoming ancient wisdom intro
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'intro-welcome',
          sender: 'assistant',
          timestamp: Date.now(),
          text: `### ✦ Akwaaba to YHWH AI — Ancient Biblical Wisdom & Exegesis
I am **YHWH AI (Ask AduBible)**, your dedicated biblical intelligence and exegetical scholar. I have been trained on the full counsel of God's Word:
- **The 66 Canonical Scriptures** across parallel global translations.
- **Original Languages**: Hebrew Westminster Leningrad Codex (WLC) & Greek Textus Receptus with Strong’s Concordance (H1–H8674, G1–G5624).
- **The Living Heritage** of the Asante Twi Holy Bible (*Twerɛ Kronkron*) honoring Apostle Kwame Adu of Nsuhia, Ghana.
- **Classic Theological Expositions**: Matthew Henry, Charles Ellicott, Jamieson-Fausset-Brown, and ancient apostolic manuscripts.

Select one of the curated ancient wisdom inquiries below, or type any verse, theological question, or passage reference to begin!`,
          bookContext: 'General Exegesis',
        },
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText?: string, explicitContext?: AskAduBibleContext) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: AskAduBibleMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    const activeCtx: AskAduBibleContext = explicitContext || {
      bookNameEn: 'Holy Scripture',
      bookSlug: 'john',
      chapter: 1,
      selectedVerse: 1,
      activeVersions: ['nkjv', 'kjv', 'twi'],
    };

    try {
      const historyPayload = [...messages, userMsg];
      const answer = await askAduBibleAI(q, activeCtx, historyPayload);

      const aiMsg: AskAduBibleMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: Date.now(),
        bookContext: `${activeCtx.bookNameEn} ${activeCtx.chapter}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallback = getSanctuaryFallbackAnswer(q, activeCtx);
      const fallbackMsg: AskAduBibleMessage = {
        id: `ai-fb-${Date.now()}`,
        sender: 'assistant',
        text: fallback,
        timestamp: Date.now(),
        bookContext: `${activeCtx.bookNameEn} ${activeCtx.chapter}`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCuratedInquiry = (inquiry: AncientWisdomInquiry) => {
    setSelectedInquiryId(inquiry.id);
    const ctx: AskAduBibleContext = {
      bookNameEn: inquiry.bookContext.bookNameEn,
      bookSlug: inquiry.bookContext.bookSlug,
      chapter: inquiry.bookContext.chapter,
      selectedVerse: inquiry.bookContext.verse,
      activeVersions: ['nkjv', 'kjv', 'twi', 'tr-gk', 'wlc'],
    };
    handleSendQuery(inquiry.query, ctx);
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n\n— YHWH AI Exegesis · AduBible.org®`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSaveToVault = (id: string, text: string, context?: string) => {
    if (onSaveToVaultNotes) {
      onSaveToVaultNotes(`YHWH AI Exegesis: ${context || 'Scripture Wisdom'}`, text, context || 'Scripture');
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setSelectedInquiryId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--green)] selection:text-[var(--paper)]">
      {/* 1. TOP SANCTUARY BAR */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)] px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToReader}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--soft)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-bold transition shadow-sm cursor-pointer"
              title="Return to 4-Column Parallel Scripture Reader"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Back to Bible Reader</span>
              <span className="sm:hidden">Reader</span>
            </button>
            <div className="h-4 w-[1px] bg-[var(--line)] hidden md:block" />
            <div className="flex items-center gap-2">
              <AduBibleLogo size={24} className="rounded" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-[var(--ink)] tracking-wide leading-none">
                  AduBible Sanctuary
                </span>
                <span className="text-[10px] text-amber-500 font-semibold tracking-wider uppercase mt-0.5">
                  YHWH AI Biblical Wisdom Engine
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Multi-Model AI Failover</span>
            </span>
            <span className="flex items-center gap-1 text-[var(--green)] font-medium text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">100% Ads-Free</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN SANCTUARY BODY */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-10">
        {/* HERO TITLE & THEOLOGICAL MISSION */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Trained Exegetical AI · Ancient Wisdom</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[var(--ink)] mb-4 leading-tight">
            Ask <span className="text-amber-500 font-serif">YHWH AI</span> for Ancient Biblical Wisdom
          </h1>
          <p className="text-base sm:text-lg text-[var(--subtle)] leading-relaxed font-light">
            Unpack the deep counsel of God’s Word with an AI trained on the{' '}
            <strong className="text-[var(--ink)] font-semibold">Hebrew Westminster Leningrad Codex</strong>,{' '}
            <strong className="text-[var(--ink)] font-semibold">Greek Textus Receptus</strong>, Strong’s Lexicons, and the historic gospel legacy of{' '}
            <strong className="text-emerald-500 font-semibold">Apostle Kwame Adu of Nsuhia, Ghana</strong>. Zero commercial clutter. Pure scripture.
          </p>
        </section>

        {/* 3. INTERACTIVE WISDOM TERMINAL (CHAT + INQUIRY CHIPS) */}
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col min-h-[580px] max-h-[820px]">
          {/* TERMINAL TOP STATUS BAR */}
          <div className="bg-[var(--soft)] border-b border-[var(--line)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-mono text-[var(--ink)]">
                YHWH AI Terminal · Online &amp; Armed with Sacred Texts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--subtle)] hover:text-[var(--ink)] text-xs font-medium transition cursor-pointer"
                title="Clear current session and reset chat"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES SCROLL REGION */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 divide-y divide-[var(--line)]/40"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`pt-5 first:pt-0 ${
                  m.sender === 'user'
                    ? 'flex justify-end'
                    : 'flex flex-col gap-2'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-amber-500 text-stone-950 p-4 font-medium text-sm sm:text-base leading-relaxed shadow-lg">
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className="block text-[10px] text-stone-900/80 font-mono mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <div className="w-full rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-4 sm:p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--line)]/60 text-xs text-[var(--subtle)]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-[var(--ink)]">YHWH AI Exegetical Scholar</span>
                        {m.bookContext && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--soft)] text-[10px] font-mono text-emerald-400 border border-[var(--line)]">
                            {m.bookContext}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[var(--ink)] font-serif space-y-3 whitespace-pre-wrap">
                      {m.text}
                    </div>

                    {/* ACTION STRIP ON EACH AI RESPONSE */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--line)]/60 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)] transition cursor-pointer"
                          title="Copy this answer to clipboard"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Exegesis</span>
                            </>
                          )}
                        </button>

                        {onSaveToVaultNotes && (
                          <button
                            type="button"
                            onClick={() => handleSaveToVault(m.id, m.text, m.bookContext)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)] transition cursor-pointer"
                            title="Save this answer directly into your private Study Vault Notes"
                          >
                            {savedId === m.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Saved in Vault</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
                                <span>Save in Vault</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {onNavigateToPassage && (
                        <button
                          type="button"
                          onClick={() => {
                            // Extract passage from bookContext or fallback to Genesis
                            const match = m.bookContext?.match(/^([a-z\s]+)\s+(\d+)/i);
                            if (match) {
                              const bSlug = match[1].toLowerCase().trim().replace(/\s+/g, '-');
                              const ch = parseInt(match[2], 10) || 1;
                              onNavigateToPassage(bSlug, ch);
                            } else {
                              onNavigateToPassage('john', 1);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open in 4-Column Parallel</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="w-full rounded-2xl bg-[var(--paper)] border border-[var(--line)] p-4 sm:p-5 flex items-center gap-3 text-xs sm:text-sm text-[var(--subtle)]">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-mono">
                  Consulting ancient Hebrew Masoretic text, Greek Textus Receptus, and Strong&apos;s Lexicons...
                </span>
              </div>
            )}
          </div>

          {/* CURATED ANCIENT WISDOM FAST-INQUIRY STRIP */}
          <div className="bg-[var(--soft)]/80 border-t border-[var(--line)] p-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-500 whitespace-nowrap pl-1">
                ✦ Tap Curated Wisdom:
              </span>
              <div className="flex items-center gap-2">
                {CURATED_ANCIENT_INQUIRIES.map((inq) => (
                  <button
                    key={inq.id}
                    type="button"
                    onClick={() => handleSelectCuratedInquiry(inq)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedInquiryId === inq.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-[var(--surface)] hover:bg-[var(--paper)] border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    {inq.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CHAT INPUT AREA */}
          <div className="p-3 sm:p-4 bg-[var(--surface)] border-t border-[var(--line)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask any question about holy scripture, original Greek/Hebrew, or theology..."
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--subtle)] text-sm focus:border-amber-500 focus:outline-none transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send inquiry to YHWH AI"
              >
                <span>Ask AI</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* 4. THE 4 FOUNDATIONAL PILLARS OF YHWH AI TRAINING */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)] mb-2">
              The 4 Pillars of YHWH AI Training
            </h2>
            <p className="text-sm text-[var(--subtle)] leading-relaxed">
              Engineered with uncompromising reverence for biblical orthodoxy, manuscript fidelity, and linguistic precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
                📜
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                1. Original Language Primacy (Hebrew &amp; Greek)
              </h3>
              <p className="text-sm text-[var(--subtle)] leading-relaxed">
                Trained on the Westminster Leningrad Codex (Masoretic Hebrew) and Textus Receptus (Koine Greek), mapping every word directly to Strong’s Concordance numbering, Brown-Driver-Briggs, and Thayer lexicons to preserve unpolluted root meanings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                ⚖️
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                2. Whole-Counsel Covenant Hermeneutics
              </h3>
              <p className="text-sm text-[var(--subtle)] leading-relaxed">
                Scripture interprets scripture. YHWH AI refuses isolated proof-texting, synthesizing Old and New Testament covenants, Messianic fulfillment in Christ, and apostolic doctrine with wholeness and contextual integrity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                🏛️
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                3. Classic Expository Commentary Synthesis
              </h3>
              <p className="text-sm text-[var(--subtle)] leading-relaxed">
                Integrates Matthew Henry’s Complete Commentary, Charles Ellicott, Jamieson-Fausset-Brown, and ancient patristic sources alongside parallel world editions (NKJV, KJV, BSB, Asante Twi, French, Hausa, Yoruba).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                4. Sovereign Sanctuary Privacy &amp; Zero Ads
              </h3>
              <p className="text-sm text-[var(--subtle)] leading-relaxed">
                100% free forever in honor of Apostle Kwame Adu. Zero commercial display ads, zero tracking pixels, and zero monetization barriers. Your queries and spiritual devotions remain private between you and God.
              </p>
            </div>
          </div>
        </section>

        {/* 5. FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <section className="space-y-4 max-w-4xl mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[var(--subtle)] mt-1">
              Everything you need to know about the YHWH AI biblical exegesis engine.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[var(--ink)] hover:text-amber-500 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--subtle)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm leading-relaxed text-[var(--subtle)] border-t border-[var(--line)]/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. CALL TO ACTION: READ IN PARALLEL */}
        <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[var(--surface)] to-emerald-500/10 p-6 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)]">
            Explore Holy Scripture in Synchronized 4-Column Parallel
          </h2>
          <p className="text-sm sm:text-base text-[var(--subtle)] max-w-2xl mx-auto leading-relaxed">
            Experience the living Word of God across English, Asante Twi, Hebrew, and Greek side-by-side with instant Strong’s popovers, Matthew Henry commentaries, and 24kHz Google Studio voice narration.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToReader}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <span>Launch 4-Column Parallel Bible</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* 7. SHARED FOOTER */}
      {footer}
    </div>
  );
};
