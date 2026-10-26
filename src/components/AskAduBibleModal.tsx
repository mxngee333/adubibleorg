import React, { useState, useEffect, useRef } from 'react';
import {
  X,
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
} from 'lucide-react';
import {
  askAduBibleAI,
  AskAduBibleContext,
  AskAduBibleMessage,
} from '../services/askAduBibleService';

export interface AskAduBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: AskAduBibleContext;
  onNavigateToVerse?: (bookSlug: string, chapter: number, verse?: number) => void;
  onSaveToVaultNotes?: (title: string, noteBody: string, passageRef: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    label: 'Explain Passage',
    prompt: 'Provide a verse-by-verse exegetical breakdown and historical context of this passage.',
  },
  {
    icon: Languages,
    label: 'Asante Twi Meaning',
    prompt: 'Explain the deeper Asante Twi (Twerɛ Kronkron) linguistic and theological meaning of the key words in this passage.',
  },
  {
    icon: Scroll,
    label: "Greek / Hebrew Roots",
    prompt: "Break down the original Greek or Hebrew root words, Strong's numbers, and nuanced theological definitions for this passage.",
  },
  {
    icon: Compass,
    label: 'Cross-References',
    prompt: 'What are the most significant cross-references in the Old and New Testaments that illuminate this scripture?',
  },
  {
    icon: HelpCircle,
    label: 'Life Application',
    prompt: 'How can believers apply the truth and promises of this chapter to their daily spiritual walk, prayer life, and faith?',
  },
];

export const AskAduBibleModal: React.FC<AskAduBibleModalProps> = ({
  isOpen,
  onClose,
  context,
  onNavigateToVerse,
  onSaveToVaultNotes,
}) => {
  const [messages, setMessages] = useState<AskAduBibleMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when modal opens or context changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: AskAduBibleMessage = {
        id: 'welcome-msg',
        sender: 'assistant',
        timestamp: Date.now(),
        text: `### ✦ Akwaaba to Ask AduBible
I am your dedicated **AI Exegetical Scripture Scholar & Language Companion**, created in honor of the **Legacy of Apostle Kwame Adu** (Nsuhia, Ghana).

You are currently reading **${context.bookNameEn} ${context.chapter}** ${
          context.bookNameTw ? `(*${context.bookNameTw}*)` : ''
        }.

Ask any question about this passage, explore the original **Greek (Textus Receptus)** and **Hebrew (Masoretic)** root words, or uncover the rich theological depth of **Asante Twi (Twerɛ Kronkron)**. Tap any quick topic below or type your inquiry!`,
        bookContext: `${context.bookNameEn} ${context.chapter}`,
      };
      setMessages([welcome]);
    }
  }, [isOpen, context, messages.length]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AskAduBibleMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      bookContext: `${context.bookNameEn} ${context.chapter}`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const assistantResponse = await askAduBibleAI(textToSend, context, messages);

      const botMsg: AskAduBibleMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: assistantResponse,
        timestamp: Date.now(),
        bookContext: `${context.bookNameEn} ${context.chapter}`,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: AskAduBibleMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### Exegetical Reflection on ${context.bookNameEn} ${context.chapter}
The living Word of God (*Hebrews 4:12*) speaks with covenantal authority across English and Asante Twi.

**Key Truths:**
- **Divine Sovereignty**: The eternal purpose of God accomplished in Christ.
- **Adom ne Asomdwoeɛ (Grace and Peace)**: Rest in the full measure of Christ's finished work.
- **Continual Meditation**: Keep searching scripture (*Acts 17:11*) side-by-side without distractions.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePinToNotes = (msg: AskAduBibleMessage) => {
    if (onSaveToVaultNotes) {
      const title = `AduBible AI Note: ${msg.bookContext || `${context.bookNameEn} ${context.chapter}`}`;
      onSaveToVaultNotes(title, msg.text, msg.bookContext || `${context.bookNameEn} ${context.chapter}`);
      setPinnedId(msg.id);
      setTimeout(() => setPinnedId(null), 2500);
    }
  };

  const handleResetChat = () => {
    const freshWelcome: AskAduBibleMessage = {
      id: 'welcome-reset',
      sender: 'assistant',
      timestamp: Date.now(),
      text: `### ✦ Ask AduBible Reset
Ready for your next question on **${context.bookNameEn} ${context.chapter}** (${context.activeVersions.join(', ').toUpperCase()}). How may I assist your scripture study today?`,
      bookContext: `${context.bookNameEn} ${context.chapter}`,
    };
    setMessages([freshWelcome]);
  };

  // Format markdown helper (bold, italic, headers, bullet points, quotes)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-amber-300 mt-2.5 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400 inline" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2 / 1
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-white mt-3 mb-1.5 border-b border-stone-800 pb-1">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-amber-400/80 bg-amber-950/20 px-3 py-1.5 rounded-r my-2 text-stone-200 italic text-sm">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemContent = line.replace(/^[\s*-]+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-stone-200 my-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemContent) }} />
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={idx} className="ml-4 list-decimal text-sm text-stone-200 my-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s*/, '')) }} />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm text-stone-200 leading-relaxed my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str: string): string => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-200">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-stone-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-stone-800 text-amber-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl flex flex-col h-[90vh] max-h-[780px] rounded-2xl border border-amber-500/30 bg-stone-950 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.15)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-800/90 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 shadow-md shadow-amber-500/20 text-white font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  ✦ Ask AduBible
                </h3>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  AI Scripture Scholar
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Context: <strong className="text-amber-200">{context.bookNameEn} {context.chapter}</strong>
                {context.bookNameTw ? ` (${context.bookNameTw})` : ''} • Parallel: {context.activeVersions.join(', ').toUpperCase()} • 100% Ads Free
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
              title="Close (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-800/80 bg-stone-900/50 px-3 py-2 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0 ml-1">
            Prompt Ideas:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-700/80 bg-stone-800/60 px-2.5 py-1 text-xs font-medium text-stone-200 hover:border-amber-400/60 hover:bg-amber-950/30 hover:text-amber-200 transition disabled:opacity-50"
              >
                <Icon className="h-3 w-3 text-amber-400" />
                {qp.label}
              </button>
            );
          })}
        </div>

        {/* Chat History Messages Scroll Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-950/80"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-150`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none'
                      : 'border border-stone-800 bg-stone-900/90 text-stone-100 rounded-tl-none shadow-black/40'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}
                </div>

                {/* Assistant Message Actions (Copy & Pin to Vault) */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-1.5 px-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 transition"
                      title="Copy response to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Insight</span>
                        </>
                      )}
                    </button>

                    {onSaveToVaultNotes && (
                      <button
                        type="button"
                        onClick={() => handlePinToNotes(msg)}
                        className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 transition"
                        title="Save note to Study Vault"
                      >
                        {pinnedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Saved to Vault!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="h-3 w-3" />
                            <span>Pin to Notes Vault</span>
                          </>
                        )}
                      </button>
                    )}

                    {msg.bookContext && onNavigateToVerse && (
                      <button
                        type="button"
                        onClick={() => onNavigateToVerse(context.bookSlug, context.chapter)}
                        className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-300 transition"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>{msg.bookContext}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-2 px-3 rounded-xl bg-stone-900/60 border border-stone-800 w-fit animate-pulse">
              <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
              <span>Ask AduBible is examining the Greek, Hebrew, and Asante Twi scriptures...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-stone-800 bg-stone-900/90 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask about ${context.bookNameEn} ${context.chapter}, Greek/Hebrew root words, or Twi meanings...`}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-sm text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-stone-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition shadow-md shadow-amber-500/20"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span>Honoring Apostle Kwame Adu • Nsuhia, Ghana</span>
            <span>100% Ads-Free • Greek/Hebrew • Asante Twi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
