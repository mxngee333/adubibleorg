/**
 * ADUBIBLE / ELOHIM BIBLE HUB — DONATION & MISSION PARTNERSHIP ENGINE
 * Scale Target: 4 Billion Readers Worldwide
 * Dual Gateway: Stripe (Card, Apple Pay, Google Pay) + PayPal (PayPal, Venmo, Pay in 4)
 * Honoring the Gospel Ministry and Generational Legacy of Apostle Kwame Adu (Nsuhia, Ghana)
 */

export type DonationFrequency = 'once' | 'monthly';

export type MissionDesignation =
  | 'general'
  | 'apostle_kwame_adu_legacy'
  | 'indigenous_languages'
  | 'ancient_codices_interlinear'
  | 'zero_ads_infrastructure';

export interface DonationTier {
  id: string;
  amount: number;
  label: string;
  impactDescription: string;
  isPopular?: boolean;
}

export interface DonorSubmission {
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  designation: MissionDesignation;
  donorName: string;
  donorEmail: string;
  tributeName?: string;
  prayerRequest?: string;
  gateway: 'stripe' | 'paypal';
  paymentMethod?: string;
}

export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'tier-10',
    amount: 10,
    label: 'Scripture Seeker',
    impactDescription: 'Funds high-speed scripture delivery for 500 readers in low-connectivity regions.',
  },
  {
    id: 'tier-25',
    amount: 25,
    label: 'Gospel Ambassador',
    impactDescription: 'Sponsors 1 month of high-speed global scripture sanctuary access for 5,000 mobile learners.',
    isPopular: true,
  },
  {
    id: 'tier-50',
    amount: 50,
    label: 'Chapter Patron',
    impactDescription: 'Enables high-fidelity 24kHz neural audio streaming for an entire biblical book.',
  },
  {
    id: 'tier-100',
    amount: 100,
    label: 'Language Benefactor',
    impactDescription: 'Accelerates the digitizing of Asante Twi, Akuapem, Ewe, and West African translations.',
  },
  {
    id: 'tier-250',
    amount: 250,
    label: 'Codex Preserver',
    impactDescription: 'Funds the integration of Greek Textus Receptus, NA28, and Leningrad Hebrew interlinear lexicons.',
  },
  {
    id: 'tier-500',
    amount: 500,
    label: 'Mission Pillar',
    impactDescription: 'Sponsors planetary-scale ad-free biblical infrastructure in support of Apostle Kwame Adu.',
  },
];

export const MISSION_DESIGNATIONS: Array<{
  id: MissionDesignation;
  title: string;
  description: string;
  scriptureRef: string;
}> = [
  {
    id: 'general',
    title: 'General Global Scripture Mission',
    description: 'Provide 100% free, unmonetized Bible access across 35+ languages for 4 billion readers.',
    scriptureRef: 'Matthew 28:19 · "Go therefore and make disciples of all the nations..."',
  },
  {
    id: 'apostle_kwame_adu_legacy',
    title: 'Apostle Kwame Adu Gospel Translation Fund',
    description: 'Support evangelistic scripture translation, rural distribution, and gospel outreach in Nsuhia, Ghana.',
    scriptureRef: 'Hebrews 13:7 · "Remember those who led you, who spoke the word of God to you..."',
  },
  {
    id: 'indigenous_languages',
    title: 'African & Indigenous Languages Digitization',
    description: 'Expand Asante Twi, Akuapem Twi, Ewe, Ga, Fante, Yoruba, Hausa, and Swahili parallel texts.',
    scriptureRef: 'Acts 2:11 · "...we hear them speaking in our own tongues the wonderful works of God."',
  },
  {
    id: 'ancient_codices_interlinear',
    title: 'Ancient Codices & Interlinear Research',
    description: 'Support morphological tagging of Hebrew Masoretic, Greek Septuagint (LXX), and Strong\'s Lexicon.',
    scriptureRef: '2 Timothy 2:15 · "Be diligent to present yourself approved to God, rightly dividing the word of truth."',
  },
  {
    id: 'zero_ads_infrastructure',
    title: '100% Ad-Free Infrastructure Sanctuary',
    description: 'Keep AduBible permanently free of commercial advertising, intrusive popups, and user data selling.',
    scriptureRef: '2 Corinthians 2:17 · "For we are not, as so many, peddling the word of God..."',
  },
];

const LS_DONOR_BADGE = 'adubible_donor_badge_v1';
const LS_DONATION_HISTORY = 'adubible_donations_history_v1';

export interface DonorBadge {
  donorName: string;
  tierLabel: string;
  frequency: DonationFrequency;
  grantedAt: number;
}

export function getSavedDonorBadge(): DonorBadge | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_DONOR_BADGE);
    return raw ? (JSON.parse(raw) as DonorBadge) : null;
  } catch {
    return null;
  }
}

export function saveDonorBadge(badge: DonorBadge): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_DONOR_BADGE, JSON.stringify(badge));
  } catch {
    // ignore
  }
}

import { getLiveEnvConfig } from './adminService';

/**
 * Initiates Stripe Checkout for Donation
 * Supports: Cards, Apple Pay, Google Pay, Cash App, Amazon Pay, Link, and Klarna
 */
export async function initiateStripeDonation(
  submission: DonorSubmission,
  originUrl: string
): Promise<{ redirectUrl?: string; clientSecret?: string; error?: string }> {
  const liveEnvs = getLiveEnvConfig();
  const stripeKey =
    (import.meta as any).env?.VITE_STRIPE_SECRET_KEY ||
    liveEnvs.STRIPE_SECRET_KEY ||
    '';

  const backendBase =
    import.meta.env.VITE_CLOUDFLARE_EDGE_URL ||
    import.meta.env.VITE_HETZNER_ORIGIN_URL;

  // 1. Try Backend API if configured with a real host
  if (backendBase && !backendBase.includes('edge.adubible.org')) {
    try {
      const res = await fetch(`${backendBase}/api/v1/donations/checkout/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${stripeKey}`,
        },
        body: JSON.stringify({
          ...submission,
          stripeKey,
          returnUrl: `${originUrl}/donate/?status=success&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${originUrl}/donate/?status=cancelled`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return { redirectUrl: data.url };
        if (data.clientSecret) return { clientSecret: data.clientSecret };
      }
    } catch (err) {
      console.warn('[Stripe Donation API] Backend endpoint bypassed, using direct Stripe API:', err);
    }
  }

  // 2. Direct Authentic Stripe Checkout Session Creation
  if (stripeKey && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_'))) {
    try {
      const numAmount = Math.max(1, parseFloat(String(submission.amount)) || 25);
      const cur = (submission.currency || 'USD').toLowerCase();
      const unitAmount = Math.round(numAmount * 100);

      const params = new URLSearchParams();
      params.append('mode', submission.frequency === 'monthly' ? 'subscription' : 'payment');
      params.append('managed_payments[enabled]', 'false');
      params.append(
        'success_url',
        `${originUrl}/donate/?status=success&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`
      );
      params.append('cancel_url', `${originUrl}/donate/?status=cancelled`);
      if (submission.donorEmail) {
        params.append('customer_email', submission.donorEmail);
      }
      params.append('client_reference_id', `adubible_${Date.now()}`);
      params.append('metadata[designation]', submission.designation || 'general');
      params.append('metadata[donor_name]', submission.donorName || 'Beloved Scripture Partner');
      params.append('metadata[frequency]', submission.frequency);
      if (submission.prayerRequest) {
        params.append('metadata[prayer_request]', submission.prayerRequest.slice(0, 450));
      }

      params.append('line_items[0][price_data][currency]', cur);
      params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
      params.append(
        'line_items[0][price_data][product_data][name]',
        `AduBible Scripture Mission — ${
          submission.frequency === 'monthly' ? 'Monthly Sustaining Partner' : 'Seed Offering'
        }`
      );
      params.append(
        'line_items[0][price_data][product_data][description]',
        `In honor of Apostle Kwame Adu Gospel Mission · ${submission.designation || 'General Scripture Distribution'}`
      );

      if (submission.frequency === 'monthly') {
        params.append('line_items[0][price_data][recurring][interval]', 'month');
      }

      params.append('line_items[0][quantity]', '1');

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const sessionData = await stripeRes.json();
      if (sessionData?.url) {
        return { redirectUrl: sessionData.url };
      }
      if (sessionData?.error?.message) {
        throw new Error(sessionData.error.message);
      }
    } catch (directErr: any) {
      console.error('[Stripe Direct Checkout] Error creating Stripe session:', directErr);
      return { error: directErr?.message || 'Stripe checkout initialization failed.' };
    }
  }

  return { error: 'Stripe gateway credentials unavailable. Please try PayPal or reload.' };
}

/**
 * Initiates PayPal Donation Order / Subscription
 * Supports: PayPal, Venmo, Debit/Credit Card, Pay in 4
 */
export async function initiatePayPalDonation(
  submission: DonorSubmission,
  originUrl: string
): Promise<{ approvalUrl?: string; orderId?: string; error?: string }> {
  const liveEnvs = getLiveEnvConfig();
  const clientId =
    (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID ||
    liveEnvs.PAYPAL_CLIENT_ID ||
    '';
  const clientSecret =
    (import.meta as any).env?.VITE_PAYPAL_CLIENT_SECRET ||
    liveEnvs.PAYPAL_CLIENT_SECRET ||
    '';
  const mode =
    (import.meta as any).env?.VITE_PAYPAL_MODE ||
    liveEnvs.PAYPAL_MODE ||
    'sandbox';
  const baseUrl =
    mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

  const backendBase =
    import.meta.env.VITE_CLOUDFLARE_EDGE_URL ||
    import.meta.env.VITE_HETZNER_ORIGIN_URL;

  // 1. Try Backend API if configured with a real host
  if (backendBase && !backendBase.includes('edge.adubible.org')) {
    try {
      const res = await fetch(`${backendBase}/api/v1/donations/checkout/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          clientId,
          clientSecret,
          mode,
          returnUrl: `${originUrl}/donate/?status=success&gateway=paypal`,
          cancelUrl: `${originUrl}/donate/?status=cancelled`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.approvalUrl) {
          return { approvalUrl: data.approvalUrl, orderId: data.orderId };
        }
      }
    } catch (err) {
      console.warn('[PayPal Donation API] Backend endpoint bypassed, using direct PayPal API:', err);
    }
  }

  // 2. Direct Authentic PayPal Orders / Subscriptions API
  if (clientId && clientSecret) {
    try {
      const auth = btoa(`${clientId}:${clientSecret}`);
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData?.access_token;

      if (!accessToken) {
        throw new Error(tokenData?.error_description || 'Unable to authenticate with PayPal.');
      }

      const numAmount = Math.max(1, parseFloat(String(submission.amount)) || 25);
      const currency = submission.currency || 'USD';

      // A. Monthly Recurring Subscription Flow
      if (submission.frequency === 'monthly') {
        const prodRes = await fetch(`${baseUrl}/v1/catalogs/products`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'AduBible Monthly Mission Partner',
            description: `Monthly scripture mission donation · ${submission.designation || 'General'}`,
            type: 'DIGITAL',
            category: 'CHARITY',
          }),
        });
        const prodData = await prodRes.json();

        if (prodData?.id) {
          const planRes = await fetch(`${baseUrl}/v1/billing/plans`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: prodData.id,
              name: `AduBible Monthly Partner ($${numAmount})`,
              description: 'AduBible Monthly Mission Partnership Sustainer',
              billing_cycles: [
                {
                  frequency: { interval_unit: 'MONTH', interval_count: 1 },
                  tenure_type: 'REGULAR',
                  sequence: 1,
                  total_cycles: 0,
                  pricing_scheme: {
                    fixed_price: {
                      value: numAmount.toFixed(2),
                      currency_code: currency,
                    },
                  },
                },
              ],
              payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
              },
            }),
          });
          const planData = await planRes.json();

          if (planData?.id) {
            const subRes = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                plan_id: planData.id,
                application_context: {
                  brand_name: 'AduBible Scripture Mission',
                  return_url: `${originUrl}/donate/?status=success&gateway=paypal`,
                  cancel_url: `${originUrl}/donate/?status=cancelled`,
                },
              }),
            });
            const subData = await subRes.json();
            const approveLink = subData.links?.find((l: any) => l.rel === 'approve')?.href;
            if (approveLink) {
              return { approvalUrl: approveLink, orderId: subData.id };
            }
          }
        }
      }

      // B. One-Time Gift / Seed Offering Flow (or fallback for subscription)
      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: numAmount.toFixed(2),
              },
              description: `AduBible Scripture Mission — ${
                submission.frequency === 'monthly' ? 'Monthly Partner' : 'Seed Offering'
              }`,
              custom_id: `${submission.donorEmail || 'anonymous'}_${submission.designation || 'general'}`,
            },
          ],
          application_context: {
            brand_name: 'AduBible Scripture Mission',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${originUrl}/donate/?status=success&gateway=paypal`,
            cancel_url: `${originUrl}/donate/?status=cancelled`,
          },
        }),
      });

      const orderData = await orderRes.json();
      const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

      if (approveLink) {
        return { approvalUrl: approveLink, orderId: orderData.id };
      }
      if (orderData?.message) {
        throw new Error(orderData.message);
      }
    } catch (directErr: any) {
      console.error('[PayPal Direct Checkout] Error creating PayPal order:', directErr);
      return { error: directErr?.message || 'PayPal checkout initialization failed.' };
    }
  }

  return { error: 'PayPal gateway credentials unavailable. Please try Stripe or reload.' };
}
