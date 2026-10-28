import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  LogOut,
  RefreshCw,
  Download,
  Sparkles,
} from 'lucide-react';
import { AduBibleLogo } from './AduBibleLogo';
import {
  UserProfile,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePin,
} from '../types/bible';
import {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOutUser,
} from '../services/firebaseSyncService';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onForceSync: () => Promise<void>;
  highlights: VerseHighlight[];
  bookmarks: VerseBookmark[];
  pins: VersePin[];
  notes: VerseNote[];
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
  onForceSync,
  highlights,
  bookmarks,
  pins,
  notes,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithEmail(email, password);
      onUserChange(profile);
      setStatusMessage('Signed in and synced your study vault!');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please complete your name, email, and password.');
      return;
    }
    if (!consent) {
      setErrorMessage('Please accept the ad-free covenant study terms.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const profile = await registerWithEmail(name, email, password);
      onUserChange(profile);
      setStatusMessage('Account created! Your highlights, pins, and notes are now cloud-synced.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithGoogle();
      onUserChange(profile);
      setStatusMessage('Connected with Google & synced your study vault!');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      await onForceSync();
      setStatusMessage('Cloud vault synchronized across all devices.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportVaultJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'AduBible (Adubible.org)',
      user: user?.email || 'guest',
      highlights,
      bookmarks,
      pins,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adubible-study-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-gradient-to-r from-amber-950/70 via-stone-900 to-stone-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <AduBibleLogo size="md" />
            <div className="border-l border-stone-800 pl-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Cloud Study Sync
              </span>
              <p className="text-[11px] text-stone-400">
                100% Ads-Free • Sovereign Privacy
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

        <div className="p-6">
          {/* Vault Stats Banner */}
          <div className="mb-5 grid grid-cols-4 gap-2 rounded-xl border border-stone-800 bg-stone-900/70 p-3 text-center">
            <div>
              <div className="text-base font-bold text-amber-400">{pins.length}</div>
              <div className="text-[11px] text-stone-400">Pinned</div>
            </div>
            <div>
              <div className="text-base font-bold text-emerald-400">{highlights.length}</div>
              <div className="text-[11px] text-stone-400">Highlights</div>
            </div>
            <div>
              <div className="text-base font-bold text-sky-400">{bookmarks.length}</div>
              <div className="text-[11px] text-stone-400">Bookmarks</div>
            </div>
            <div>
              <div className="text-base font-bold text-rose-400">{notes.length}</div>
              <div className="text-[11px] text-stone-400">Notes</div>
            </div>
          </div>

          {statusMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-3.5 py-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200">
              {errorMessage}
            </div>
          )}

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-stone-950 font-bold text-lg">
                  {(user.displayName || user.email || 'S')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white truncate">{user.displayName}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="h-3 w-3" /> Synced
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    🔥 {user.streakDays} Day Study Streak • {user.chaptersRead} Chapters Read
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={handleExportVaultJson}
                  className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-800 transition"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  Backup JSON
                </button>
              </div>

              <button
                onClick={async () => {
                  await signOutUser();
                  onUserChange(null);
                  setStatusMessage('Signed out. Local study vault remains intact on this device.');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out of Cloud Session
              </button>
            </div>
          ) : (
            <div>
              {/* Auth Branding Hero */}
              <div className="mb-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 border border-stone-800 shadow-lg mb-2">
                  <img src="/brand/Symbol_Transparent.png" alt="AduBible" className="h-9 w-9 object-contain" />
                </div>
                <div className="flex items-center justify-center gap-1 font-serif text-base font-bold mb-1">
                  <span style={{ color: 'var(--logo-adu-color, #A8354D)' }}>Adu</span>
                  <span style={{ color: 'var(--logo-bible-color, #E8E2D6)' }}>Bible</span>
                  <span style={{ color: 'var(--logo-tld-color, #8E968F)' }}>.org</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {activeTab === 'signin' ? 'Welcome Back to AduBible' : 'Create Your Sovereign Study Vault'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Synchronize your bookmarks, pins, and study streak across all devices
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-4 grid grid-cols-2 rounded-xl bg-stone-900 p-1 border border-stone-800">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signin')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    activeTab === 'signin'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    activeTab === 'signup'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="scholar@elohimbible.org"
                        className="w-full rounded-xl border border-stone-800 bg-stone-900 pl-9 pr-3 py-2 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-stone-800 bg-stone-900 pl-9 pr-3 py-2 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 transition disabled:opacity-50"
                  >
                    {loading ? 'Signing In...' : 'Sign In & Sync Vault'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Scholar Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Kwame Elohim"
                        className="w-full rounded-xl border border-stone-800 bg-stone-900 pl-9 pr-3 py-2 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="scholar@elohimbible.org"
                        className="w-full rounded-xl border border-stone-800 bg-stone-900 pl-9 pr-3 py-2 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full rounded-xl border border-stone-800 bg-stone-900 pl-9 pr-3 py-2 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded border-stone-700 accent-amber-500"
                    />
                    <span>
                      Sync my bookmarks, pins, highlights, and notes across devices with zero tracking or ads.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating Vault...' : 'Create Free Cloud Account'}
                  </button>
                </form>
              )}

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-800" />
                <span className="text-[11px] uppercase tracking-wider text-stone-500">or</span>
                <div className="h-px flex-1 bg-stone-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-700 bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google 1-Tap Sync
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
