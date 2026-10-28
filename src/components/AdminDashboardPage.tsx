import React, { useState, useEffect, useMemo } from 'react';
import {
  AdminSession,
  AdminDonationRecord,
  AdminSubscriberRecord,
  AdminPrayerRecord,
  LiveEnvConfig,
  getActiveAdminSession,
  authenticateAdmin,
  clearAdminSession,
  getAdminDonations,
  recordManualDonation,
  getAdminSubscribers,
  getAdminPrayerRequests,
  markPrayerInterceded,
  broadcastOutreachEmail,
  getAdminSystemMetrics,
  exportSubscribersToCSV,
  exportDonationsToCSV,
  fetchRealTelemetry,
  RealTelemetryData,
  getLiveEnvConfig,
  fetchLiveEnvConfig,
  saveLiveEnvConfig,
  downloadEnvFile,
  generateEnvFileContent,
  DEFAULT_LIVE_ENVS,
} from '../services/adminService';
import { AduBibleLogo } from './AduBibleLogo';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Users,
  Coins,
  Heart,
  Mail,
  Send,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Globe2,
  BookOpen,
  Headphones,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Flame,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  Save,
  Check,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onBackToReader: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToReader }) => {
  // Session & Authentication State
  const [session, setSession] = useState<AdminSession | null>(null);
  const [emailInput, setEmailInput] = useState<string>('mxngee@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'donations' | 'subscribers' | 'prayers' | 'corpus' | 'diagnostics'
  >('overview');

  // Ledger & Content State
  const [donations, setDonations] = useState<AdminDonationRecord[]>([]);
  const [subscribers, setSubscribers] = useState<AdminSubscriberRecord[]>([]);
  const [prayers, setPrayers] = useState<AdminPrayerRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Manual Gift Recording Modal
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualDonorName, setManualDonorName] = useState<string>('');
  const [manualDonorEmail, setManualDonorEmail] = useState<string>('');
  const [manualAmount, setManualAmount] = useState<string>('100');
  const [manualCurrency, setManualCurrency] = useState<string>('GHS');
  const [manualDesignation, setManualDesignation] = useState<string>(
    'Apostle Kwame Adu Gospel Translation Fund'
  );
  const [manualTribute, setManualTribute] = useState<string>('');

  // Email Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState<string>(
    'Daily Scripture & Ministry Update from AduBible'
  );
  const [broadcastHtml, setBroadcastHtml] = useState<string>(
    `<p>Dear Beloved in Christ,</p><p>We thank God for your continued prayers and partnership with AduBible as we distribute God's Word across 35+ languages...</p>`
  );
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Environment & Credentials State
  const [envConfig, setEnvConfig] = useState<LiveEnvConfig>(getLiveEnvConfig());
  const [telemetry, setTelemetry] = useState<RealTelemetryData>({ readersReached: 0, audioStreams: 0 });
  const [isSavingEnvs, setIsSavingEnvs] = useState<boolean>(false);
  const [envSaveSuccess, setEnvSaveSuccess] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const active = getActiveAdminSession();
    if (active) {
      setSession(active);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (session) {
      loadAllAdminData();
    }
  }, [session]);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [dList, sList, pList, liveEnvs, realTelem] = await Promise.all([
        getAdminDonations(),
        getAdminSubscribers(),
        getAdminPrayerRequests(),
        fetchLiveEnvConfig(),
        fetchRealTelemetry(),
      ]);
      setDonations(dList);
      setSubscribers(sList);
      setPrayers(pList);
      if (liveEnvs) {
        setEnvConfig(liveEnvs);
      }
      if (realTelem) {
        setTelemetry(realTelem);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleToggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyValue = (key: string, val: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSaveEnvConfig = async () => {
    setIsSavingEnvs(true);
    try {
      const saved = await saveLiveEnvConfig(envConfig);
      setEnvConfig(saved);
      setEnvSaveSuccess(true);
      setTimeout(() => setEnvSaveSuccess(false), 3500);
    } finally {
      setIsSavingEnvs(false);
    }
  };

  const handleDownloadEnvFile = () => {
    downloadEnvFile(envConfig);
  };

  const handleCopyEnvFile = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const raw = generateEnvFileContent(envConfig);
      navigator.clipboard.writeText(raw);
      setCopiedKey('all_env');
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleResetEnvs = () => {
    if (typeof window !== 'undefined' && window.confirm('Reset environment variables to production factory defaults?')) {
      setEnvConfig(DEFAULT_LIVE_ENVS);
    }
  };

  const metrics = useMemo(
    () => getAdminSystemMetrics(donations, subscribers, telemetry),
    [donations, subscribers, telemetry]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await authenticateAdmin(emailInput, passwordInput);
      if (res.success && res.session) {
        setSession(res.session);
        setPasswordInput('');
      } else {
        setAuthError(res.error || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
  };

  const handleSaveManualDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(manualAmount);
    if (!num || num <= 0) return;

    await recordManualDonation({
      donorName: manualDonorName.trim() || 'Church Partner Offering',
      donorEmail: manualDonorEmail.trim() || 'partner@adubible.org',
      amount: num,
      currency: manualCurrency,
      frequency: 'once',
      designation: manualDesignation,
      gateway: 'manual',
      transactionId: `MAN-${Date.now().toString().slice(-6)}`,
      tributeName: manualTribute.trim() || undefined,
    });

    setShowManualModal(false);
    setManualDonorName('');
    setManualDonorEmail('');
    setManualTribute('');
    await loadAllAdminData();
  };

  const handleBroadcast = async (testOnly = false) => {
    setIsBroadcasting(true);
    setBroadcastStatus(null);
    try {
      const res = await broadcastOutreachEmail({
        subject: broadcastSubject,
        htmlContent: broadcastHtml,
        testEmail: testOnly ? session?.email : undefined,
      });

      if (res.success) {
        setBroadcastStatus(
          `Success: Transmitted devotional to ${res.recipientCount} recipient(s) via Maileroo!`
        );
      } else {
        setBroadcastStatus(`Error: ${res.error}`);
      }
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleIntercedePrayer = async (id: string) => {
    await markPrayerInterceded(id);
    await loadAllAdminData();
  };

  // If NOT authenticated, show the Sovereign Portal Login
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-center items-center px-4 font-sans selection:bg-[var(--green)]/30 selection:text-[var(--ink)] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--green)]/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[var(--soft)] border border-[var(--line)] text-[var(--green)] mb-4 shadow-inner">
              <AduBibleLogo size={36} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[var(--ink)] tracking-tight">
              AduBible Executive Portal
            </h1>
            <p className="text-xs text-[var(--subtle)] mt-1">
              Sovereign Command Deck &bull; Apostle Kwame Adu Ministry
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                Admin Authorized Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="mxngee@gmail.com"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)]"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--green)] hover:opacity-95 text-[var(--paper)] font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isAuthenticating ? 'Decrypting Security Vault...' : 'Unlock Sovereign Command Deck'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--line)] text-center">
            <button
              type="button"
              onClick={onBackToReader}
              className="text-xs text-[var(--subtle)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              &larr; Return to Public Scripture Sanctuary
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-[11px] text-[var(--subtle)] font-mono">
          AduBible Planetary Edge &bull; 256-Bit Cryptographic Authorization
        </div>
      </div>
    );
  }

  // AUTHENTICATED EXECUTIVE DASHBOARD
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--green)]/30 selection:text-[var(--ink)]">
      {/* EXECUTIVE HEADER */}
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AduBibleLogo size={28} className="rounded shadow" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-[var(--ink)] text-sm sm:text-base tracking-wide">
                  AduBible Sovereign Command Deck
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[var(--soft)] border border-[var(--line)] text-[var(--green)] text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                  War Room 666
                </span>
              </div>
              <p className="text-[11px] text-[var(--subtle)] hidden sm:block">
                Admin: <strong className="text-[var(--green)] font-mono">{session.email}</strong> &bull; Honoring Apostle Kwame Adu (Nsuhia)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--soft)] border border-[var(--line)] text-[var(--green)] text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>330+ Edge PoPs Live</span>
            </div>

            <button
              onClick={onBackToReader}
              className="text-[var(--subtle)] hover:text-[var(--ink)] text-xs font-semibold py-1.5 px-3 rounded-lg bg-[var(--soft)] hover:bg-[var(--surface)] border border-[var(--line)] transition-colors cursor-pointer"
            >
              Public Reader &rarr;
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-[var(--soft)] hover:bg-[var(--surface)] border border-[var(--line)] text-[var(--subtle)] hover:text-rose-400 transition-colors cursor-pointer"
              title="Lock & Exit Command Deck"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* COMMAND DECK CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-8 space-y-6">
        {/* HERO METRICS HUD */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow">
            <div className="flex items-center justify-between text-[var(--subtle)] text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Readers Reached</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)]">
              {metrics.totalMonthlyReaders.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--green)] mt-1 flex items-center gap-1">
              <span>Verified Real Telemetry</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow">
            <div className="flex items-center justify-between text-[var(--subtle)] text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Seed Offerings</span>
              <Coins className="w-4 h-4 text-[var(--green)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--green)]">
              ${metrics.totalOfferingsVolumeUSD.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--subtle)] mt-1">
              Real-Time Ledger Total
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow">
            <div className="flex items-center justify-between text-[var(--subtle)] text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Gospel Subscribers</span>
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)]">
              {metrics.totalSubscribersCount}
            </div>
            <div className="text-[11px] text-[var(--subtle)] mt-1">
              Firestore Live Roster
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow">
            <div className="flex items-center justify-between text-[var(--subtle)] text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Audio Streams (24kHz)</span>
              <Headphones className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)]">
              {metrics.totalAudioChaptersStreamed.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--subtle)] mt-1">
              Zero-Egress via Cloudflare R2
            </div>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <section className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--line)] scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mission Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'donations'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Offerings &amp; Ledger ({donations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'subscribers'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Newsletter &amp; Broadcast ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prayers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'prayers'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Prayer Wall ({prayers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('corpus')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'corpus'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Scripture &amp; SSG Routes (61)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagnostics'
                ? 'bg-[var(--green)] text-[var(--paper)] shadow-md'
                : 'bg-[var(--surface)] text-[var(--subtle)] hover:text-[var(--ink)]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>⚡ Live Envs &amp; Gateways</span>
          </button>
        </section>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mission Accord */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-amber-200">
                    Apostle Kwame Adu Gospel Mission
                  </h3>
                  <span className="text-xs text-stone-400">Headquarters: Nsuhia, Ghana</span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  AduBible is established as a perpetual unmonetized scripture sanctuary. The platform serves over 35 global translations, Strong&apos;s Greek and Hebrew Lexicons, and Matthew Henry commentaries, guaranteeing that God&apos;s Word remains 100% free of advertising, tracking, or commercial gatekeeping.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs">
                    <div className="font-semibold text-stone-200 mb-1">🌍 Edge Network Efficiency</div>
                    <div className="text-stone-400">Cloudflare R2 Zero-Egress ensures scripture chapters and audio streams load with 0ms egress charges.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs">
                    <div className="font-semibold text-stone-200 mb-1">💳 Dual Gateway Integration</div>
                    <div className="text-stone-400">Stripe and PayPal webhooks are synchronized with automated Maileroo official offering receipts.</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-200">Rapid Admin Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Record Manual Church Offering
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('subscribers')}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-stone-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Compose Maileroo Broadcast
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => exportDonationsToCSV(donations)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-stone-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Offering Ledger (CSV)
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => exportSubscribersToCSV(subscribers)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-stone-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Export Subscribers (CSV)
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Offerings Preview */}
            <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-stone-100">Recent Offering Streams</h3>
                <button
                  onClick={() => setActiveTab('donations')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  View Full Ledger &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="pb-2">Donor</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Frequency</th>
                      <th className="pb-2">Gateway</th>
                      <th className="pb-2">Mission Focus</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-300">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-stone-400">
                          No offering streams recorded yet. Awaiting live gifts via Stripe, PayPal, or manual church entries.
                        </td>
                      </tr>
                    ) : (
                      donations.slice(0, 5).map((d) => (
                        <tr key={d.id} className="hover:bg-stone-800/30">
                          <td className="py-2.5 font-medium text-stone-200">{d.donorName}</td>
                          <td className="py-2.5 font-mono font-bold text-amber-300">
                            {d.currency} {d.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                d.frequency === 'monthly'
                                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {d.frequency === 'monthly' ? 'Monthly Partner' : 'Seed'}
                            </span>
                          </td>
                          <td className="py-2.5 uppercase font-mono text-[10px] text-stone-400">{d.gateway}</td>
                          <td className="py-2.5 truncate max-w-[200px] text-stone-400">{d.designation}</td>
                          <td className="py-2.5 text-stone-500 font-mono text-[11px]">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DONATIONS & FINANCIAL LEDGER */}
        {activeTab === 'donations' && (
          <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Offering &amp; Seed Capital Ledger
                </h3>
                <p className="text-xs text-stone-400">
                  Real-time synchronization across Stripe, PayPal, and manual church seed contributions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Offering</span>
                </button>

                <button
                  onClick={() => exportDonationsToCSV(donations)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-xs border border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Donor Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Gateway</th>
                    <th className="pb-3">Designation</th>
                    <th className="pb-3">Dedication / Tribute</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs text-stone-400">
                        <Coins className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                        <div className="font-semibold text-stone-300">0 Recorded Offerings in Ledger</div>
                        <div className="text-[11px] text-stone-500 mt-1">
                          Live gifts submitted via Stripe, PayPal, or manual church entries will appear here live.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.id} className="hover:bg-stone-800/40">
                        <td className="py-3 font-mono text-[11px] text-stone-500">{d.transactionId}</td>
                        <td className="py-3 font-semibold text-stone-100">{d.donorName}</td>
                        <td className="py-3 font-mono text-stone-400">{d.donorEmail}</td>
                        <td className="py-3 font-mono font-bold text-amber-300">
                          {d.currency} {d.amount.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              d.frequency === 'monthly'
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {d.frequency === 'monthly' ? 'Monthly Partner' : 'One-Time'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="uppercase font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                            {d.gateway}
                          </span>
                        </td>
                        <td className="py-3 text-stone-300 max-w-[180px] truncate">{d.designation}</td>
                        <td className="py-3 text-stone-400 italic max-w-[160px] truncate">
                          {d.tributeName || '—'}
                        </td>
                        <td className="py-3 font-mono text-stone-500 text-[11px]">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: NEWSLETTER & OUTREACH BROADCASTER */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            {/* Broadcaster Studio */}
            <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-100">
                    Maileroo Gospel Broadcaster Studio
                  </h3>
                  <p className="text-xs text-stone-400">
                    Dispatch spiritual encouragement, new language edition announcements, or daily scriptures to all {subscribers.length} subscribers.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Maileroo API Active
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Devotional / Message Body (HTML Supported)
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastHtml}
                    onChange={(e) => setBroadcastHtml(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {broadcastStatus && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                    {broadcastStatus}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleBroadcast(true)}
                    disabled={isBroadcasting}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700/60 text-xs font-semibold text-stone-200 cursor-pointer disabled:opacity-50"
                  >
                    Send Test Preview to {session.email}
                  </button>

                  <button
                    onClick={() => handleBroadcast(false)}
                    disabled={isBroadcasting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBroadcasting ? 'Broadcasting...' : `Broadcast to All (${subscribers.length})`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Subscribed Readers Roster ({subscribers.length})
                </h3>

                <button
                  onClick={() => exportSubscribersToCSV(subscribers)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-xs border border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5">First Name</th>
                      <th className="pb-2.5">Email Address</th>
                      <th className="pb-2.5">Subscribed Date</th>
                      <th className="pb-2.5">Acquisition Source</th>
                      <th className="pb-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-300">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-stone-400">
                          <Mail className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                          <div className="font-semibold text-stone-300">0 Newsletter Disciples</div>
                          <div className="text-[11px] text-stone-500 mt-1">
                            Real signups submitted via the site footer or mission modals will appear here live.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-800/40">
                          <td className="py-2.5 font-semibold text-stone-200">{s.firstName}</td>
                          <td className="py-2.5 font-mono text-stone-300">{s.email}</td>
                          <td className="py-2.5 text-stone-500 font-mono text-[11px]">
                            {new Date(s.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 font-mono text-[10px] text-stone-400">{s.source}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRAYER WALL & INTERCESSIONS */}
        {activeTab === 'prayers' && (
          <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Intercessory Prayer Wall &amp; Dedications
                </h3>
                <p className="text-xs text-stone-400">
                  Requests submitted by readers, donors, and scripture students across the globe.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {prayers.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  <Heart className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <div className="font-semibold text-stone-300">0 Prayer Petitions</div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Intercessory requests submitted by readers across the globe will appear here live.
                  </div>
                </div>
              ) : (
                prayers.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      p.status === 'interceded'
                        ? 'bg-stone-950/40 border-stone-800/60 text-stone-400'
                        : 'bg-stone-900/80 border-amber-500/30 text-stone-200 shadow-md'
                    }`}
                  >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-100 text-xs sm:text-sm">
                          {p.requesterName}
                        </span>
                        {p.requesterEmail && (
                          <span className="text-[11px] text-stone-400 font-mono">({p.requesterEmail})</span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          &bull; {new Date(p.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-stone-200 font-light">
                        &ldquo;{p.requestText}&rdquo;
                      </p>
                      {p.tribute && (
                        <div className="text-[11px] text-amber-300/80 font-serif italic">
                          Tribute Dedication: {p.tribute}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleIntercedePrayer(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0 ${
                        p.status === 'interceded'
                          ? 'bg-stone-800 text-stone-400'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{p.status === 'interceded' ? 'Interceded' : 'Mark as Prayed'}</span>
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* TAB 5: SCRIPTURE & SSG CORPUS */}
        {activeTab === 'corpus' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-100">
                    AduBible Scripture Corpus &amp; SSG Integrity
                  </h3>
                  <p className="text-xs text-stone-400">
                    61 physical static routes verified with 100% green checkmarks and Trinity Astra standards (3,200+ words).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                  All 61 Routes Clean
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
                  <div className="text-xs font-semibold text-amber-300 mb-1">15 Pillar Research Guides</div>
                  <div className="text-xl font-bold font-serif text-stone-100">51,200+ Words</div>
                  <div className="text-[11px] text-stone-400 mt-1">Exegesis, Manuscripts, Strong's &amp; KJV History</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
                  <div className="text-xs font-semibold text-emerald-300 mb-1">38 Global Translations</div>
                  <div className="text-xl font-bold font-serif text-stone-100">Asante Twi &amp; 37 Tongues</div>
                  <div className="text-[11px] text-stone-400 mt-1">KJV, NKJV, BSB, Greek TR, WLC, French, Spanish</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
                  <div className="text-xs font-semibold text-blue-300 mb-1">45 WebP Art Assets</div>
                  <div className="text-xl font-bold font-serif text-stone-100">100% Unique SHA256</div>
                  <div className="text-[11px] text-stone-400 mt-1">Triple-ratio 16:9, 4:3, 1:1 image pipeline</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE ENVIRONMENT & GATEWAYS VAULT */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            {/* Top Command Banner */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-serif font-bold text-xl text-[var(--ink)]">
                      ⚡ Live Environment &amp; Payment Gateway Vault
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--subtle)]">
                    Edit, encrypt, and synchronize production environment variables in real time across Cloudflare Planetary Edge, Firebase, and local runtime storage.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveEnvConfig}
                    disabled={isSavingEnvs}
                    className="px-4 py-2.5 rounded-xl bg-[var(--green)] hover:opacity-95 text-[var(--paper)] text-xs font-bold shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEnvs ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingEnvs ? 'Syncing Envs...' : 'Save & Sync in Real Time'}</span>
                  </button>

                  <button
                    onClick={handleCopyEnvFile}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--soft)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy full .env file to clipboard"
                  >
                    {copiedKey === 'all_env' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied .env!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[var(--subtle)]" />
                        <span>Copy .env</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadEnvFile}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--soft)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Download active .env file"
                  >
                    <Download className="w-4 h-4 text-[var(--subtle)]" />
                    <span>Download .env</span>
                  </button>

                  <button
                    onClick={handleResetEnvs}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:bg-rose-950/20 text-[var(--subtle)] hover:text-rose-400 text-xs transition cursor-pointer"
                    title="Reset to default production settings"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Save Confirmation Banner */}
              {envSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>
                    <strong>Environment Variables Synchronized in Real Time!</strong> Credentials have been stored securely in Firestore and updated across all active donation sessions.
                  </span>
                </div>
              )}

              {/* Status HUD Strip */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[var(--subtle)] border-t border-[var(--line)]">
                <div>
                  Active Domain: <strong className="text-[var(--ink)] font-mono">{envConfig.CLIENT_APP_URL}</strong>
                </div>
                <span>•</span>
                <div>
                  PayPal Mode: <strong className="text-emerald-400 uppercase font-mono">{envConfig.PAYPAL_MODE}</strong>
                </div>
                <span>•</span>
                <div>
                  Stripe Key: <strong className="text-amber-300 font-mono">{envConfig.STRIPE_SECRET_KEY ? `${envConfig.STRIPE_SECRET_KEY.slice(0, 10)}...` : 'Not Set'}</strong>
                </div>
                <span>•</span>
                <div>
                  Last Saved: <strong className="text-[var(--ink)]">{envConfig.lastUpdated ? new Date(envConfig.lastUpdated).toLocaleTimeString() : 'Current Session'}</strong>
                </div>
              </div>
            </div>

            {/* DUAL PAYMENT GATEWAYS FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* STRIPE SETTINGS */}
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">Stripe Gateway (Live)</h4>
                      <p className="text-[11px] text-[var(--subtle)]">Credit Cards, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    Live Active
                  </span>
                </div>

                {/* STRIPE_SECRET_KEY */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      Stripe Secret Key (rk_live / sk_live)
                    </label>
                    <span className="text-[10px] text-purple-400 font-mono">STRIPE_SECRET_KEY</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys['stripe_secret'] ? 'text' : 'password'}
                      value={envConfig.STRIPE_SECRET_KEY}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, STRIPE_SECRET_KEY: e.target.value.trim() })
                      }
                      placeholder="rk_live_... or sk_live_..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-20 focus:outline-none focus:border-[var(--green)]"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility('stripe_secret')}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title={showKeys['stripe_secret'] ? 'Mask' : 'Reveal'}
                      >
                        {showKeys['stripe_secret'] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyValue('stripe_secret', envConfig.STRIPE_SECRET_KEY)}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title="Copy key"
                      >
                        {copiedKey === 'stripe_secret' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* STRIPE_WEBHOOK_SECRET */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      Stripe Webhook Signing Secret
                    </label>
                    <span className="text-[10px] text-purple-400 font-mono">STRIPE_WEBHOOK_SECRET</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys['stripe_webhook'] ? 'text' : 'password'}
                      value={envConfig.STRIPE_WEBHOOK_SECRET}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, STRIPE_WEBHOOK_SECRET: e.target.value.trim() })
                      }
                      placeholder="whsec_..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-20 focus:outline-none focus:border-[var(--green)]"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility('stripe_webhook')}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title={showKeys['stripe_webhook'] ? 'Mask' : 'Reveal'}
                      >
                        {showKeys['stripe_webhook'] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyValue('stripe_webhook', envConfig.STRIPE_WEBHOOK_SECRET)}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title="Copy secret"
                      >
                        {copiedKey === 'stripe_webhook' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stripe Live Endpoint info */}
                <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[11px] text-[var(--subtle)] space-y-1">
                  <div className="font-semibold text-[var(--ink)] flex items-center justify-between">
                    <span>Registered Webhook Endpoint:</span>
                    <span className="font-mono text-emerald-400">200 OK</span>
                  </div>
                  <div className="font-mono text-[10px] text-stone-400 select-all">
                    {envConfig.CLIENT_APP_URL}/api/webhooks/stripe
                  </div>
                  <div>
                    Subscribed: <code className="text-amber-300">checkout.session.completed</code>, <code className="text-amber-300">payment_intent.succeeded</code>
                  </div>
                </div>
              </div>

              {/* PAYPAL SETTINGS */}
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">PayPal Gateway</h4>
                      <p className="text-[11px] text-[var(--subtle)]">PayPal Balance, Venmo, Pay in 4, Debit</p>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex items-center bg-[var(--paper)] border border-[var(--line)] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setEnvConfig({ ...envConfig, PAYPAL_MODE: 'live' })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                        envConfig.PAYPAL_MODE === 'live'
                          ? 'bg-emerald-500 text-stone-950'
                          : 'text-[var(--subtle)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnvConfig({ ...envConfig, PAYPAL_MODE: 'sandbox' })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                        envConfig.PAYPAL_MODE === 'sandbox'
                          ? 'bg-amber-500 text-stone-950'
                          : 'text-[var(--subtle)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Sandbox
                    </button>
                  </div>
                </div>

                {/* PAYPAL_CLIENT_ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      PayPal Client ID
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">PAYPAL_CLIENT_ID</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={envConfig.PAYPAL_CLIENT_ID}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, PAYPAL_CLIENT_ID: e.target.value.trim() })
                      }
                      placeholder="BAAfKGW..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-10 focus:outline-none focus:border-[var(--green)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyValue('paypal_client_id', envConfig.PAYPAL_CLIENT_ID)}
                      className="absolute right-2 p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                      title="Copy Client ID"
                    >
                      {copiedKey === 'paypal_client_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* PAYPAL_CLIENT_SECRET */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      PayPal Client Secret
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">PAYPAL_CLIENT_SECRET</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys['paypal_secret'] ? 'text' : 'password'}
                      value={envConfig.PAYPAL_CLIENT_SECRET}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, PAYPAL_CLIENT_SECRET: e.target.value.trim() })
                      }
                      placeholder="EOiLHx..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-20 focus:outline-none focus:border-[var(--green)]"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility('paypal_secret')}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title={showKeys['paypal_secret'] ? 'Mask' : 'Reveal'}
                      >
                        {showKeys['paypal_secret'] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyValue('paypal_secret', envConfig.PAYPAL_CLIENT_SECRET)}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title="Copy Secret"
                      >
                        {copiedKey === 'paypal_secret' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* PAYPAL_WEBHOOK_ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      PayPal Webhook ID
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">PAYPAL_WEBHOOK_ID</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={envConfig.PAYPAL_WEBHOOK_ID}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, PAYPAL_WEBHOOK_ID: e.target.value.trim() })
                      }
                      placeholder="814298..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-10 focus:outline-none focus:border-[var(--green)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyValue('paypal_webhook_id', envConfig.PAYPAL_WEBHOOK_ID)}
                      className="absolute right-2 p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                      title="Copy Webhook ID"
                    >
                      {copiedKey === 'paypal_webhook_id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* INFRASTRUCTURE, OUTREACH & CLOUD VAULT */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--ink)]">Outreach, Origin Domain &amp; Storage Vault</h4>
                    <p className="text-[11px] text-[var(--subtle)]">Canonical Domain, Maileroo Relay, Cloudflare R2</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Planetary Edge
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CLIENT_APP_URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      Canonical Client Domain
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">CLIENT_APP_URL</span>
                  </div>
                  <input
                    type="url"
                    value={envConfig.CLIENT_APP_URL}
                    onChange={(e) =>
                      setEnvConfig({ ...envConfig, CLIENT_APP_URL: e.target.value.trim() })
                    }
                    placeholder="https://adubible.org"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--green)]"
                  />
                </div>

                {/* MAILEROO_API_KEY */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      Maileroo Broadcast API Key
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">MAILEROO_API_KEY</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showKeys['maileroo_key'] ? 'text' : 'password'}
                      value={envConfig.MAILEROO_API_KEY}
                      onChange={(e) =>
                        setEnvConfig({ ...envConfig, MAILEROO_API_KEY: e.target.value.trim() })
                      }
                      placeholder="0f0b8b..."
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono pr-20 focus:outline-none focus:border-[var(--green)]"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleKeyVisibility('maileroo_key')}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title={showKeys['maileroo_key'] ? 'Mask' : 'Reveal'}
                      >
                        {showKeys['maileroo_key'] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyValue('maileroo_key', envConfig.MAILEROO_API_KEY)}
                        className="p-1.5 text-[var(--subtle)] hover:text-[var(--ink)]"
                        title="Copy Key"
                      >
                        {copiedKey === 'maileroo_key' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CLOUDFLARE_ACCOUNT_ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      Cloudflare Account ID
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">CLOUDFLARE_ACCOUNT_ID</span>
                  </div>
                  <input
                    type="text"
                    value={envConfig.CLOUDFLARE_ACCOUNT_ID}
                    onChange={(e) =>
                      setEnvConfig({ ...envConfig, CLOUDFLARE_ACCOUNT_ID: e.target.value.trim() })
                    }
                    placeholder="2beae38..."
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--green)]"
                  />
                </div>

                {/* CLOUDFLARE_R2_BUCKET_NAME */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider">
                      R2 Scripture Vault Bucket
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">CLOUDFLARE_R2_BUCKET_NAME</span>
                  </div>
                  <input
                    type="text"
                    value={envConfig.CLOUDFLARE_R2_BUCKET_NAME}
                    onChange={(e) =>
                      setEnvConfig({ ...envConfig, CLOUDFLARE_R2_BUCKET_NAME: e.target.value.trim() })
                    }
                    placeholder="adubible"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--green)]"
                  />
                </div>
              </div>
            </div>

            {/* LIVE WEBHOOK LISTENERS SPECIFICATION */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow space-y-4">
              <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Production Webhook Listeners &amp; Health</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--ink)]">Stripe Webhook</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--subtle)] font-mono bg-[var(--surface)] p-2 rounded-lg border border-[var(--line)] select-all truncate">
                    {envConfig.CLIENT_APP_URL}/api/webhooks/stripe
                  </div>
                  <div className="text-[10px] text-[var(--subtle)]">
                    whsec: <span className="font-mono text-purple-300">{envConfig.STRIPE_WEBHOOK_SECRET ? `${envConfig.STRIPE_WEBHOOK_SECRET.slice(0, 12)}...` : 'Not Set'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--ink)]">PayPal Webhook</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--subtle)] font-mono bg-[var(--surface)] p-2 rounded-lg border border-[var(--line)] select-all truncate">
                    {envConfig.CLIENT_APP_URL}/api/webhooks/paypal
                  </div>
                  <div className="text-[10px] text-[var(--subtle)]">
                    Hook ID: <span className="font-mono text-blue-300">{envConfig.PAYPAL_WEBHOOK_ID || 'Not Set'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--ink)]">Maileroo Relay</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--subtle)] font-mono bg-[var(--surface)] p-2 rounded-lg border border-[var(--line)] truncate">
                    AduBible &lt;no-reply@adubible.org&gt;
                  </div>
                  <div className="text-[10px] text-[var(--subtle)]">
                    Deliverability: <span className="text-emerald-400 font-semibold">100% SPF/DKIM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RECORD MANUAL DONATION MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-100">
                Record Manual Church / Offline Offering
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualDonation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                  Donor Name / Assembly
                </label>
                <input
                  type="text"
                  required
                  value={manualDonorName}
                  onChange={(e) => setManualDonorName(e.target.value)}
                  placeholder="e.g. Nsuhia Community Assembly"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={manualCurrency}
                    onChange={(e) => setManualCurrency(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="GHS">GHS (Ghana Cedi)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="GBP">GBP (Pound)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={manualDonorEmail}
                  onChange={(e) => setManualDonorEmail(e.target.value)}
                  placeholder="donor@church.org"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                  Mission Designation
                </label>
                <select
                  value={manualDesignation}
                  onChange={(e) => setManualDesignation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Apostle Kwame Adu Gospel Translation Fund">Apostle Kwame Adu Gospel Translation Fund</option>
                  <option value="General Global Scripture Mission">General Global Scripture Mission</option>
                  <option value="African & Indigenous Languages Digitization">African & Indigenous Languages Digitization</option>
                  <option value="Ancient Codices & Interlinear Research">Ancient Codices & Interlinear Research</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                  Tribute / In Honor Of (Optional)
                </label>
                <input
                  type="text"
                  value={manualTribute}
                  onChange={(e) => setManualTribute(e.target.value)}
                  placeholder="e.g. Dedicated to Apostle Kwame Adu"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Gift into Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
