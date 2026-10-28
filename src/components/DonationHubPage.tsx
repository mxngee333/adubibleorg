import React, { useState, useEffect } from 'react';
import {
  DONATION_TIERS,
  MISSION_DESIGNATIONS,
  DonationFrequency,
  MissionDesignation,
  DonorSubmission,
  initiateStripeDonation,
  initiatePayPalDonation,
  saveDonorBadge,
  getSavedDonorBadge,
  DonorBadge,
} from '../services/donationService';
import { AduBibleLogo } from './AduBibleLogo';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Gift,
  BookOpen,
  Globe2,
  ExternalLink,
  Lock,
  ChevronRight,
  Flame,
  Coins,
  Church,
} from 'lucide-react';

interface DonationHubPageProps {
  onBackToReader: () => void;
  onNavigateToPassage?: (bookId: string, chapter: number) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'GHS', symbol: '₵', label: 'GHS (₵ Ghana Cedi)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€ Euro)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£ Pound)' },
  { code: 'CAD', symbol: '$', label: 'CAD ($ Canada)' },
];

export const DonationHubPage: React.FC<DonationHubPageProps> = ({
  onBackToReader,
  onNavigateToPassage,
}) => {
  const [frequency, setFrequency] = useState<DonationFrequency>('once');
  const [currency, setCurrency] = useState<string>('USD');
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [designation, setDesignation] = useState<MissionDesignation>('general');
  const [gateway, setGateway] = useState<'stripe' | 'paypal'>('stripe');

  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [tributeName, setTributeName] = useState<string>('');
  const [prayerRequest, setPrayerRequest] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status parameter from redirect
  const [donationStatus, setDonationStatus] = useState<'success' | 'cancelled' | null>(null);
  const [activeDonorBadge, setActiveDonorBadge] = useState<DonorBadge | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'success') {
        setDonationStatus('success');
        const badge: DonorBadge = {
          donorName: params.get('donor_name') || 'Beloved Scripture Partner',
          tierLabel: 'AduBible Covenant Benefactor',
          frequency: (params.get('frequency') as DonationFrequency) || 'once',
          grantedAt: Date.now(),
        };
        saveDonorBadge(badge);
        setActiveDonorBadge(badge);
      } else if (status === 'cancelled') {
        setDonationStatus('cancelled');
      }

      const existing = getSavedDonorBadge();
      if (existing) {
        setActiveDonorBadge(existing);
      }
    }
  }, []);

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const currentSymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setSubmitError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(val);
    if (val) {
      setSelectedAmount(0);
    }
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (activeAmount < 1) {
      setSubmitError('Please enter a donation amount of at least 1 unit of your selected currency.');
      return;
    }

    if (!donorEmail.trim()) {
      setSubmitError('Please enter a valid email address so we can deliver your official donation receipt.');
      return;
    }

    setIsSubmitting(true);

    const submission: DonorSubmission = {
      amount: activeAmount,
      currency,
      frequency,
      designation,
      donorName: donorName.trim() || 'Anonymous Scripture Partner',
      donorEmail: donorEmail.trim(),
      tributeName: tributeName.trim() || undefined,
      prayerRequest: prayerRequest.trim() || undefined,
      gateway,
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://adubible.org';

    try {
      if (gateway === 'stripe') {
        const result = await initiateStripeDonation(submission, origin);
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
      } else {
        const result = await initiatePayPalDonation(submission, origin);
        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
          return;
        }
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Unable to initiate checkout. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col font-sans selection:bg-[var(--green)]/30 selection:text-[var(--ink)]">
      {/* Top Banner & Navigation */}
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToReader}
              className="text-[var(--subtle)] hover:text-[var(--ink)] transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg bg-[var(--soft)] hover:bg-[var(--surface)] border border-[var(--line)]"
            >
              <span>&larr;</span>
              <span>Back to Bible Reader</span>
            </button>
            <div className="h-4 w-[1px] bg-[var(--line)] hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <AduBibleLogo size={24} className="rounded" />
              <span className="font-serif font-bold text-[var(--ink)] tracking-wide text-sm">AduBible Mission Sanctuary</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--green)] flex items-center gap-1 font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Ads-Free Covenant
            </span>
          </div>
        </div>
      </header>

      {/* Main Sanctuary Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* SUCCESS STATE ILLUMINATION */}
        {donationStatus === 'success' && (
          <div className="mb-10 rounded-2xl bg-[var(--surface)] border border-[var(--green)] p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--soft)] border border-[var(--green)] flex items-center justify-center text-[var(--green)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)] mb-2">
              God Bless You for Your Generous Offering!
            </h2>
            <p className="text-[var(--subtle)] text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
              Your offering accelerates the unhindered distribution of God&apos;s Word across 35+ languages, honoring the ministry legacy of{' '}
              <strong className="text-[var(--green)]">Apostle Kwame Adu of Nsuhia, Ghana</strong>. A digital receipt has been transmitted to your email.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--soft)] border border-[var(--line)] text-[var(--ink)] text-xs font-serif italic mb-6">
              &ldquo;God loves a cheerful giver. And God is able to make all grace abound toward you...&rdquo; &mdash; 2 Corinthians 9:7&ndash;8
            </div>
            <div>
              <button
                onClick={onBackToReader}
                className="px-6 py-2.5 rounded-xl bg-[var(--green)] hover:opacity-95 text-[var(--paper)] font-semibold text-sm shadow-lg transition-all cursor-pointer"
              >
                Return to Parallel Scripture Reading &rarr;
              </button>
            </div>
          </div>
        )}

        {/* CANCELLED STATE NOTIFICATION */}
        {donationStatus === 'cancelled' && (
          <div className="mb-8 rounded-xl bg-[var(--surface)] border border-[var(--line)] p-4 text-center text-[var(--subtle)] text-xs sm:text-sm">
            <span>Checkout was not completed. If you wish to try again or choose another payment method, you may select below anytime.</span>
          </div>
        )}

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--soft)] border border-[var(--line)] text-[var(--green)] text-xs font-semibold uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5 text-[var(--green)]" />
            <span>Planetary Scripture Distribution</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[var(--ink)] mb-4 leading-tight">
            Support the Mission of <span className="text-[var(--green)] font-serif">AduBible</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--subtle)] leading-relaxed font-light">
            Dedicated to humanity in support of <strong className="text-[var(--ink)] font-semibold">Apostle Kwame Adu of Nsuhia, Ghana</strong>.
            We provide a 100% free, unmonetized parallel study hub with Strong&apos;s Greek and Hebrew Lexicons, Twi translations, and ancient codices.
          </p>
        </div>

        {/* ACTIVE COVENANT PARTNER BADGE IF PREVIOUSLY GIVEN */}
        {activeDonorBadge && donationStatus !== 'success' && (
          <div className="mb-8 p-4 rounded-xl bg-[var(--soft)] border border-[var(--green)] flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--green)] flex-shrink-0" />
              <div>
                <span className="font-semibold text-[var(--ink)]">{activeDonorBadge.donorName}</span>
                <span className="text-[var(--subtle)] ml-2">&bull; Recognized as {activeDonorBadge.tierLabel}</span>
              </div>
            </div>
            <span className="text-xs text-[var(--green)] hidden sm:inline-block">Covenant Supporter Active</span>
          </div>
        )}

        {/* MAIN DONATION CARD */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Frequency Switcher: One-Time vs. Monthly */}
          <div className="flex justify-center mb-8">
            <div className="bg-[var(--paper)] p-1.5 rounded-2xl border border-[var(--line)] inline-flex shadow-inner">
              <button
                type="button"
                onClick={() => setFrequency('once')}
                className={`px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  frequency === 'once'
                    ? 'bg-[var(--green)] text-[var(--paper)] font-bold shadow-md'
                    : 'text-[var(--subtle)] hover:text-[var(--ink)]'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>One-Time Seed Offering</span>
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  frequency === 'monthly'
                    ? 'bg-[var(--green)] text-[var(--paper)] font-bold shadow-md'
                    : 'text-[var(--subtle)] hover:text-[var(--ink)]'
                }`}
              >
                <Heart className="w-4 h-4 fill-current text-rose-500" />
                <span>Monthly Covenant Partner</span>
              </button>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--line)]">
            <label className="text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[var(--green)]" />
              <span>Select Currency</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--green)] cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {DONATION_TIERS.map((tier) => {
              const isSelected = selectedAmount === tier.amount && !customAmount;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleSelectPreset(tier.amount)}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--soft)] border-[var(--green)] shadow-lg ring-1 ring-[var(--green)]'
                      : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--green)]/60'
                  }`}
                >
                  {tier.isPopular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[var(--green)] text-[10px] font-bold text-[var(--paper)] uppercase tracking-wider shadow">
                      Most Selected
                    </span>
                  )}
                  <div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xs text-[var(--subtle)] font-serif">{currentSymbol}</span>
                      <span className="text-2xl font-serif font-bold text-[var(--ink)]">{tier.amount}</span>
                      {frequency === 'monthly' && <span className="text-[10px] text-[var(--subtle)]">/mo</span>}
                    </div>
                    <div className="text-xs font-semibold text-[var(--green)] mb-1.5">{tier.label}</div>
                  </div>
                  <div className="text-[11px] text-[var(--subtle)] leading-snug line-clamp-2">{tier.impactDescription}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Amount Field */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-2">
              Or Specify a Custom Amount ({currentSymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-serif text-[var(--green)] font-bold">
                {currentSymbol}
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Enter custom gift amount..."
                className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl pl-10 pr-4 py-3 text-[var(--ink)] text-base font-semibold focus:outline-none focus:border-[var(--green)] placeholder:text-[var(--subtle)] transition-colors"
              />
            </div>
          </div>

          {/* Mission Designation Allocator */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--green)]" />
              <span>Designate Your Mission Focus</span>
            </label>
            <div className="space-y-2">
              {MISSION_DESIGNATIONS.map((m) => {
                const isSelected = designation === m.id;
                return (
                  <label
                    key={m.id}
                    onClick={() => setDesignation(m.id)}
                    className={`block p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--soft)] border-[var(--green)]'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="designation"
                        checked={isSelected}
                        onChange={() => setDesignation(m.id)}
                        className="mt-1 text-[var(--green)] focus:ring-[var(--green)]"
                      />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-[var(--ink)]">{m.title}</div>
                        <div className="text-xs text-[var(--subtle)] mb-1">{m.description}</div>
                        <div className="text-[11px] text-[var(--green)] font-serif italic">{m.scriptureRef}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Gateway Tabs (Stripe vs PayPal) */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--green)]" />
              <span>Select Payment Gateway &bull; 256-Bit Encrypted</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stripe Button */}
              <button
                type="button"
                onClick={() => setGateway('stripe')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                  gateway === 'stripe'
                    ? 'bg-[var(--soft)] border-[var(--green)] shadow-md ring-1 ring-[var(--green)]'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <span>Credit / Debit / Apple Pay</span>
                  </div>
                  <div className="text-[11px] text-[var(--subtle)]">Powered by Stripe &bull; Visa, MC, Amex, Apple Pay, Google Pay</div>
                </div>
              </button>

              {/* PayPal Button */}
              <button
                type="button"
                onClick={() => setGateway('paypal')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                  gateway === 'paypal'
                    ? 'bg-[var(--soft)] border-[var(--green)] shadow-md ring-1 ring-[var(--green)]'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] flex-shrink-0">
                  <span className="font-serif font-black text-sm">P</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--ink)]">PayPal / Venmo</div>
                  <div className="text-[11px] text-[var(--subtle)]">PayPal Balance, Pay in 4, Linked Bank or Cards</div>
                </div>
              </button>
            </div>
          </div>

          {/* Donor Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g., Samuel Mensah"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                  Email Address (For Tax Receipt) <span className="text-[var(--green)]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="e.g., yourname@domain.com"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                  Dedication / In Support Of (Optional)
                </label>
                <input
                  type="text"
                  value={tributeName}
                  onChange={(e) => setTributeName(e.target.value)}
                  placeholder="e.g., In support of Apostle Kwame Adu"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                  Prayer Request (Optional)
                </label>
                <input
                  type="text"
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  placeholder="Share any prayer request for our intercessors"
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)]"
                />
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            {/* Submit CTA Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || activeAmount <= 0}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--green)] hover:opacity-95 text-[var(--paper)] font-bold text-base sm:text-lg shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Connecting to {gateway === 'stripe' ? 'Stripe Secure Checkout' : 'PayPal Secure Portal'}...</span>
                ) : (
                  <>
                    <span>
                      Complete {currentSymbol}{activeAmount.toFixed(2)} {frequency === 'monthly' ? 'Monthly Partnership' : 'Offering'} via{' '}
                      {gateway === 'stripe' ? 'Stripe' : 'PayPal'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-around gap-4 text-xs text-[var(--subtle)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
              <span>100% Unmonetized Non-Profit Scripture Mission</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--green)]" />
              <span>Bank-Grade 256-Bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[var(--green)]" />
              <span>Planetary Edge Architecture</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL STEWARDSHIP & LEGACY ACCORD */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] mb-3">
              <Church className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[var(--ink)] text-base mb-2">In Support of Apostle Kwame Adu</h3>
            <p className="text-xs text-[var(--subtle)] leading-relaxed">
              Founded in honor and support of the ongoing gospel work of Apostle Kwame Adu of Nsuhia, Ghana (
              <a href="https://nsuhia.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--green)] underline">
                nsuhia.com
              </a>
              ). We carry forward the call to make God&apos;s living Word accessible to every tribe, tongue, and nation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[var(--ink)] text-base mb-2">Permanent Zero-Ad Covenant</h3>
            <p className="text-xs text-[var(--subtle)] leading-relaxed">
              Scripture reading must never be cheapened by intrusive commercial ad networks, tracking cookies, or user profile harvesting.
              AduBible is permanently clean, reverent, and focused on holy study.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--soft)] border border-[var(--line)] flex items-center justify-center text-[var(--green)] mb-3">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[var(--ink)] text-base mb-2">Global Scripture Delivery</h3>
            <p className="text-xs text-[var(--subtle)] leading-relaxed">
              Your donations directly cover zero-egress Cloudflare R2 audio & text storage, distributed D1 Edge databases, and Hetzner
              dedicated origin servers capable of serving billions of readers without financial gatekeeping.
            </p>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="mt-16">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--ink)] mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <h4 className="font-semibold text-[var(--ink)] text-sm mb-1.5">Is my donation tax-deductible?</h4>
              <p className="text-xs text-[var(--subtle)] leading-relaxed">
                Yes. Contributions go directly towards non-profit biblical translation, digital archiving, and open-source missionary software infrastructure. An official digital receipt is issued immediately via email.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <h4 className="font-semibold text-[var(--ink)] text-sm mb-1.5">Can I cancel my monthly partnership at any time?</h4>
              <p className="text-xs text-[var(--subtle)] leading-relaxed">
                Yes, absolutely. Both Stripe and PayPal provide 1-click self-service management links in your monthly receipt email to modify, pause, or cancel your monthly covenant partnership without questions.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <h4 className="font-semibold text-[var(--ink)] text-sm mb-1.5">Which payment methods are accepted?</h4>
              <p className="text-xs text-[var(--subtle)] leading-relaxed">
                Via Stripe, we accept Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, and Link. Via PayPal, you can use your PayPal balance, Venmo, linked bank accounts, or debit cards.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
