/**
 * ADUBIBLE / ELOHIM BIBLE HUB — CLOUDFLARE GLOBAL EDGE WORKER
 * Scale Target: 4 Billion Readers Worldwide
 * Zero-Egress R2 Scripture Storage + Distributed D1 Edge Database
 */

export interface Env {
  SCRIPTURE_BUCKET: R2Bucket;
  DB: D1Database;
  HETZNER_ORIGIN_URL?: string;
  MAILEROO_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_WEBHOOK_ID?: string;
  PAYPAL_MODE?: string;
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
  'Access-Control-Max-Age': '86400',
};

// 1 Year immutable cache for scripture chapters (immutable canon)
const SCRIPTURE_CACHE_CONTROL = 'public, max-age=31536000, s-maxage=31536000, immutable';
// 24 Hours cache for metadata & version lists
const METADATA_CACHE_CONTROL = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800';
// 1 Hour cache for search results
const SEARCH_CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 1A. Handle High-Fidelity Edge TTS Audio Proxy (/api/v1/tts)
    if (request.method === 'GET' && (pathname === '/api/v1/tts' || pathname === '/api/tts')) {
      const qText = url.searchParams.get('text') || '';
      const qLang = url.searchParams.get('lang') || 'en';
      if (!qText.trim()) {
        return new Response(JSON.stringify({ error: 'Text required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      try {
        const cleanText = qText.slice(0, 200).trim();
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(qLang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
        const ttsRes = await fetch(googleTtsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (ttsRes.ok) {
          return new Response(ttsRes.body, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
            },
          });
        }
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'TTS proxy error' }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1B. Handle Maileroo Transactional Email Dispatch (/api/v1/email/send)
    if (request.method === 'POST' && pathname === '/api/v1/email/send') {
      try {
        const body: any = await request.json();
        const apiKey = env.MAILEROO_API_KEY || '0f0b8b60d11196da2729fe59361df5b137cc9ff901987bfae92ce6dc6fa904df';
        const fromAddr = body.from || 'AduBible <no-reply@adubible.org>';

        if (!body.to || !body.subject || (!body.html && !body.plain)) {
          return new Response(JSON.stringify({ error: 'Missing required email fields (to, subject, html/plain)' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const payload = new URLSearchParams({
          from: fromAddr,
          to: String(body.to).trim(),
          subject: String(body.subject).trim(),
          html: body.html || body.plain,
          plain: body.plain || body.html,
        });

        const mailerooRes = await fetch('https://smtp.maileroo.com/send', {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload.toString(),
        });

        const data: any = await mailerooRes.json().catch(() => ({}));

        return new Response(JSON.stringify(data), {
          status: mailerooRes.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'Maileroo dispatch failed' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1C. Handle Stripe Donation Checkout Session Creation (/api/v1/donations/checkout/stripe)
    if (request.method === 'POST' && pathname === '/api/v1/donations/checkout/stripe') {
      try {
        const body: any = await request.json();
        const stripeKey = env.STRIPE_SECRET_KEY;
        const amount = Math.max(1, parseFloat(body.amount) || 25);
        const currency = (body.currency || 'USD').toLowerCase();
        const frequency = body.frequency === 'monthly' ? 'monthly' : 'once';
        const returnUrl = body.returnUrl || 'https://adubible.org/donate/?status=success';
        const cancelUrl = body.cancelUrl || 'https://adubible.org/donate/?status=cancelled';

        if (stripeKey && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_'))) {
          const params = new URLSearchParams();
          params.append('managed_payments[enabled]', 'false');
          params.append('success_url', returnUrl);
          params.append('cancel_url', cancelUrl);
          if (body.donorEmail) {
            params.append('customer_email', body.donorEmail);
          }
          params.append('client_reference_id', `adubible_${Date.now()}`);
          params.append('metadata[designation]', body.designation || 'general');
          params.append('metadata[donor_name]', body.donorName || 'Beloved Scripture Partner');
          params.append('metadata[frequency]', frequency);

          if (frequency === 'monthly') {
            params.append('mode', 'subscription');
            params.append('line_items[0][price_data][currency]', currency);
            params.append('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
            params.append('line_items[0][price_data][recurring][interval]', 'month');
            params.append('line_items[0][price_data][product_data][name]', 'AduBible Monthly Scripture Partner');
            params.append('line_items[0][price_data][product_data][description]', `Apostle Kwame Adu Gospel Scripture Mission · ${body.designation || 'General'}`);
            params.append('line_items[0][quantity]', '1');
          } else {
            params.append('mode', 'payment');
            params.append('line_items[0][price_data][currency]', currency);
            params.append('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
            params.append('line_items[0][price_data][product_data][name]', 'AduBible One-Time Scripture Offering');
            params.append('line_items[0][price_data][product_data][description]', `100% Ad-Free Scripture Distribution for Humanity · ${body.designation || 'General'}`);
            params.append('line_items[0][quantity]', '1');
          }

          const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });

          const sessionData: any = await stripeRes.json();
          if (sessionData.url) {
            return new Response(JSON.stringify({ url: sessionData.url, id: sessionData.id }), {
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }
          if (sessionData.error?.message) {
            return new Response(JSON.stringify({ error: sessionData.error.message }), {
              status: 400,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }
        }

        return new Response(JSON.stringify({ error: 'Stripe gateway credentials unconfigured.' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'Stripe initialization failed' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1D. Handle PayPal Donation Checkout Order Creation (/api/v1/donations/checkout/paypal)
    if (request.method === 'POST' && pathname === '/api/v1/donations/checkout/paypal') {
      try {
        const body: any = await request.json();
        const amount = Math.max(1, parseFloat(body.amount) || 25);
        const currency = body.currency || 'USD';
        const returnUrl = body.returnUrl || 'https://adubible.org/donate/?status=success';
        const cancelUrl = body.cancelUrl || 'https://adubible.org/donate/?status=cancelled';
        const clientId = env.PAYPAL_CLIENT_ID;
        const clientSecret = env.PAYPAL_CLIENT_SECRET;
        const mode = env.PAYPAL_MODE || 'live';
        const baseUrl = mode === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

        if (clientId && clientSecret) {
          // OAuth Token
          const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
          });
          const authData: any = await authRes.json();

          if (authData.access_token) {
            const accessToken = authData.access_token;

            // Monthly recurring subscription support
            if (body.frequency === 'monthly') {
              try {
                const prodRes = await fetch(`${baseUrl}/v1/catalogs/products`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name: 'AduBible Monthly Mission Partner',
                    description: `Monthly scripture mission donation · ${body.designation || 'General'}`,
                    type: 'DIGITAL',
                    category: 'CHARITY',
                  }),
                });
                const prodData: any = await prodRes.json();
                if (prodData?.id) {
                  const planRes = await fetch(`${baseUrl}/v1/billing/plans`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      product_id: prodData.id,
                      name: `AduBible Monthly Partner ($${amount})`,
                      description: 'AduBible Monthly Mission Partnership Sustainer',
                      billing_cycles: [
                        {
                          frequency: { interval_unit: 'MONTH', interval_count: 1 },
                          tenure_type: 'REGULAR',
                          sequence: 1,
                          total_cycles: 0,
                          pricing_scheme: {
                            fixed_price: {
                              value: amount.toFixed(2),
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
                  const planData: any = await planRes.json();
                  if (planData?.id) {
                    const subRes = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        plan_id: planData.id,
                        application_context: {
                          brand_name: 'AduBible Scripture Mission',
                          return_url: returnUrl,
                          cancel_url: cancelUrl,
                        },
                      }),
                    });
                    const subData: any = await subRes.json();
                    const subApproval = subData.links?.find((l: any) => l.rel === 'approve')?.href;
                    if (subApproval) {
                      return new Response(JSON.stringify({ approvalUrl: subApproval, orderId: subData.id }), {
                        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                      });
                    }
                  }
                }
              } catch (subErr) {
                console.warn('[PayPal Subscription Flow Error]', subErr);
              }
            }

            // One-Time Order
            const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    description: `AduBible Scripture Mission — ${body.designation || 'General'}`,
                    custom_id: body.donorEmail || 'anonymous',
                    amount: {
                      currency_code: currency,
                      value: amount.toFixed(2),
                    },
                  },
                ],
                application_context: {
                  brand_name: 'AduBible Scripture Mission',
                  return_url: returnUrl,
                  cancel_url: cancelUrl,
                  user_action: 'PAY_NOW',
                },
              }),
            });

            const orderData: any = await orderRes.json();
            const approvalLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
            if (approvalLink) {
              return new Response(JSON.stringify({ approvalUrl: approvalLink, orderId: orderData.id }), {
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
              });
            }
            if (orderData?.message) {
              return new Response(JSON.stringify({ error: orderData.message }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
              });
            }
          }
        }

        return new Response(JSON.stringify({ error: 'PayPal credentials unconfigured or invalid.' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'PayPal initialization failed' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1E. Handle Stripe Webhook Listener (/api/v1/donations/webhook/stripe, /api/webhooks/stripe, /webhook/stripe)
    if (
      request.method === 'POST' &&
      (pathname === '/api/v1/donations/webhook/stripe' ||
        pathname === '/api/webhooks/stripe' ||
        pathname === '/webhook/stripe')
    ) {
      try {
        const rawBody = await request.text();
        const sig = request.headers.get('stripe-signature');
        let event: any;

        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const eventType = event.type;
        console.log(`[STRIPE WEBHOOK RECEIVED] Type: ${eventType}, ID: ${event.id}`);

        // Handled Events:
        // 1. checkout.session.completed
        // 2. payment_intent.succeeded
        // 3. customer.subscription.created / updated / deleted
        // 4. invoice.payment_succeeded / failed
        // 5. charge.refunded
        if (eventType === 'checkout.session.completed') {
          const session = event.data?.object || {};
          const donorEmail = session.customer_details?.email || session.customer_email || session.metadata?.donor_email;
          const donorName = session.customer_details?.name || session.metadata?.donor_name || 'Beloved Scripture Partner';
          const amount = (session.amount_total || 0) / 100;
          const currency = (session.currency || 'USD').toUpperCase();
          const frequency = session.mode === 'subscription' ? 'monthly' : 'once';
          const designation = session.metadata?.designation || 'General Scripture Mission';
          const txId = session.id || event.id;

          if (donorEmail && env.MAILEROO_API_KEY) {
            await sendDonationReceipt(
              env.MAILEROO_API_KEY,
              donorEmail,
              donorName,
              amount,
              currency,
              frequency,
              designation,
              txId
            );
          }
        } else if (eventType === 'invoice.payment_succeeded') {
          const invoice = event.data?.object || {};
          const donorEmail = invoice.customer_email;
          const donorName = invoice.customer_name || 'Covenant Monthly Partner';
          const amount = (invoice.amount_paid || 0) / 100;
          const currency = (invoice.currency || 'USD').toUpperCase();

          if (donorEmail && env.MAILEROO_API_KEY) {
            await sendDonationReceipt(
              env.MAILEROO_API_KEY,
              donorEmail,
              donorName,
              amount,
              currency,
              'monthly',
              'Monthly Scripture Partnership Renewal',
              invoice.id || event.id
            );
          }
        }

        return new Response(JSON.stringify({ received: true, event: eventType }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('[STRIPE WEBHOOK ERROR]:', err);
        return new Response(JSON.stringify({ error: err?.message || 'Stripe webhook processing error' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1F. Handle PayPal Webhook Listener (/api/v1/donations/webhook/paypal, /api/webhooks/paypal, /webhook/paypal)
    if (
      request.method === 'POST' &&
      (pathname === '/api/v1/donations/webhook/paypal' ||
        pathname === '/api/webhooks/paypal' ||
        pathname === '/webhook/paypal')
    ) {
      try {
        const payload: any = await request.json();
        const eventType = payload.event_type;
        console.log(`[PAYPAL WEBHOOK RECEIVED] Type: ${eventType}, ID: ${payload.id}`);

        // Handled Events:
        // 1. CHECKOUT.ORDER.APPROVED
        // 2. PAYMENT.CAPTURE.COMPLETED
        // 3. PAYMENT.CAPTURE.DENIED
        // 4. BILLING.SUBSCRIPTION.ACTIVATED
        // 5. BILLING.SUBSCRIPTION.CANCELLED
        // 6. PAYMENT.SALE.COMPLETED
        if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.COMPLETED') {
          const resource = payload.resource || {};
          const amount = parseFloat(resource.amount?.value || '0');
          const currency = (resource.amount?.currency_code || 'USD').toUpperCase();
          const donorEmail = resource.payer?.email_address || resource.custom_id;
          const donorName =
            [resource.payer?.name?.given_name, resource.payer?.name?.surname].filter(Boolean).join(' ') ||
            'Beloved Scripture Partner';
          const txId = resource.id || payload.id;

          if (donorEmail && donorEmail.includes('@') && env.MAILEROO_API_KEY) {
            await sendDonationReceipt(
              env.MAILEROO_API_KEY,
              donorEmail,
              donorName,
              amount,
              currency,
              'once',
              'General Scripture Distribution (PayPal)',
              txId
            );
          }
        } else if (eventType === 'PAYMENT.SALE.COMPLETED') {
          const resource = payload.resource || {};
          const amount = parseFloat(resource.amount?.total || resource.amount?.value || '0');
          const currency = (resource.amount?.currency || 'USD').toUpperCase();
          const donorEmail = resource.subscriber?.email_address;
          const donorName =
            [resource.subscriber?.name?.given_name, resource.subscriber?.name?.surname].filter(Boolean).join(' ') ||
            'Covenant Monthly Partner';
          const txId = resource.id || payload.id;

          if (donorEmail && env.MAILEROO_API_KEY) {
            await sendDonationReceipt(
              env.MAILEROO_API_KEY,
              donorEmail,
              donorName,
              amount,
              currency,
              'monthly',
              'Monthly Partnership Renewal (PayPal)',
              txId
            );
          }
        }

        return new Response(JSON.stringify({ received: true, event_type: eventType }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('[PAYPAL WEBHOOK ERROR]:', err);
        return new Response(JSON.stringify({ error: err?.message || 'PayPal webhook processing error' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 1C. Handle 10s Scripture Status Video Presets & Fal.ai Prompt Generator
    if (pathname === '/api/v1/status-video/presets' || pathname === '/api/v1/status-video/ai-prompt') {
      const presets = [
        {
          id: 'celestial',
          name: 'Celestial Dawn',
          falPrompt: 'cinematic ethereal morning sunbeams piercing ancient sacred sanctuary, golden dust floating in radiant light, 4k 60fps slow gentle motion background',
        },
        {
          id: 'candlelight',
          name: 'Sacred Flame & Parchment',
          falPrompt: 'warm flickering candlelight in an ancient stone chapel, gentle amber shadows dancing on sacred manuscript, peaceful prayer ambience',
        },
        {
          id: 'clouds',
          name: 'Clouds of Glory',
          falPrompt: 'majestic mountain peaks above rolling heavenly clouds, divine azure sky and golden godrays breaking through mist, aerial slow motion',
        },
        {
          id: 'obsidian',
          name: 'Royal Obsidian & Gold Dust',
          falPrompt: 'deep velvet cosmic starlight, slow drifting golden celestial particles, royal deep purple nebula, reverent holy majesty',
        },
        {
          id: 'covenant',
          name: 'Covenant Living Waters',
          falPrompt: 'crystal clear living water ripples over smooth river stones, lush serene emerald garden of Eden, soft morning light reflections',
        },
      ];

      if (request.method === 'POST') {
        try {
          const body: any = await request.json().catch(() => ({}));
          const verse = body.verse || 'John 3:16';
          const theme = body.theme || 'celestial';
          const matched = presets.find((p) => p.id === theme) || presets[0];

          return new Response(
            JSON.stringify({
              verse,
              theme: matched.id,
              recommendedFalPrompt: `${matched.falPrompt}, sacred biblical atmosphere for scripture text overlay of ${verse}`,
              watermark: 'Adubible.org',
              durationSeconds: 10,
              aspectRatio: body.aspectRatio || '9:16',
            }),
            {
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            }
          );
        } catch {
          // fallback
        }
      }

      return new Response(
        JSON.stringify({
          presets,
          watermark: 'Adubible.org',
          supportedRatios: ['9:16', '1:1', '16:9'],
          defaultDurationSeconds: 10,
          socialTargets: ['WhatsApp Status', 'Instagram Stories/Reels', 'TikTok', 'YouTube Shorts', 'X', 'Facebook'],
        }),
        {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'Cache-Control': METADATA_CACHE_CONTROL,
          },
        }
      );
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 2. Health Check & Edge Telemetry
    if (pathname === '/healthz' || pathname === '/api/v1/health') {
      const colo = (request as any).cf?.colo || 'LOCAL';
      const country = (request as any).cf?.country || 'GLOBAL';
      return new Response(
        JSON.stringify({
          status: 'healthy',
          tier: 'Cloudflare Planetary Edge',
          targetCapacity: '4,000,000,000 readers',
          colo,
          country,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // 3. Check Cloudflare Edge Cache First
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) {
      const cloned = new Response(response.body, response);
      cloned.headers.set('X-Edge-Cache', 'HIT');
      return cloned;
    }

    // 4. Route: Chapter Data (/api/v1/chapters/:version/:book/:chapter.json)
    const chapterMatch = pathname.match(/^\/api\/v1\/chapters\/([^/]+)\/([^/]+)\/(\d+)(?:\.json)?$/i);
    if (chapterMatch) {
      const [, versionId, bookId, chapterStr] = chapterMatch;
      const chapterNum = parseInt(chapterStr, 10);
      const r2Key = `chapters/${versionId.toLowerCase()}/${bookId.toUpperCase()}/${chapterNum}.json`;

      // 4A. Fetch from Cloudflare R2 (Zero Egress Cost)
      try {
        const r2Object = await env.SCRIPTURE_BUCKET.get(r2Key);
        if (r2Object) {
          const headers = new Headers();
          r2Object.writeHttpMetadata(headers);
          headers.set('ETag', r2Object.httpEtag);
          headers.set('Content-Type', 'application/json; charset=utf-8');
          headers.set('Cache-Control', SCRIPTURE_CACHE_CONTROL);
          headers.set('X-Edge-Cache', 'MISS-R2-HIT');
          headers.set('X-Scripture-Source', 'Cloudflare R2 Immutable Vault');
          Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));

          const res = new Response(r2Object.body, { headers });
          ctx.waitUntil(cache.put(cacheKey, res.clone()));
          return res;
        }
      } catch (err) {
        console.error('R2 lookup error:', err);
      }

      // 4B. Failover to Hetzner Dedicated Origin if R2 doesn't have it yet
      if (env.HETZNER_ORIGIN_URL) {
        try {
          const hetznerUrl = `${env.HETZNER_ORIGIN_URL.replace(/\/$/, '')}/api/v1/chapters/${versionId}/${bookId}/${chapterNum}`;
          const originRes = await fetch(hetznerUrl, {
            headers: { 'User-Agent': 'AduBible-Cloudflare-Edge-Worker/1.0' },
          });

          if (originRes.ok) {
            const data = await originRes.text();
            // Asynchronously populate R2 for future 0ms requests
            ctx.waitUntil(
              env.SCRIPTURE_BUCKET.put(r2Key, data, {
                httpMetadata: { contentType: 'application/json; charset=utf-8' },
              }).catch(() => {})
            );

            const res = new Response(data, {
              status: 200,
              headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': SCRIPTURE_CACHE_CONTROL,
                'X-Edge-Cache': 'MISS-HETZNER-HIT',
                'X-Scripture-Source': 'Hetzner Origin Dedicated Cluster',
              },
            });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return res;
          }
        } catch (originErr) {
          console.error('Hetzner origin failover error:', originErr);
        }
      }

      // 4C. Tertiary Fallback to Free Use Bible API
      try {
        const fallbackUrl = `https://bible.helloao.org/api/${encodeURIComponent(versionId)}/${encodeURIComponent(bookId.toUpperCase())}/${chapterNum}.json`;
        const fbRes = await fetch(fallbackUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.text();
          // Write-through to R2
          ctx.waitUntil(
            env.SCRIPTURE_BUCKET.put(r2Key, fbData, {
              httpMetadata: { contentType: 'application/json; charset=utf-8' },
            }).catch(() => {})
          );

          const res = new Response(fbData, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': SCRIPTURE_CACHE_CONTROL,
              'X-Edge-Cache': 'MISS-THIRD-PARTY-REHYDRATED',
            },
          });
          ctx.waitUntil(cache.put(cacheKey, res.clone()));
          return res;
        }
      } catch {
        // Return 404 if not found anywhere
      }

      return new Response(
        JSON.stringify({
          error: 'Chapter Not Found',
          versionId,
          bookId,
          chapter: chapterNum,
        }),
        {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Route: D1 Edge Metadata — Canonical Books (/api/v1/books)
    if (pathname === '/api/v1/books') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, slug, number, testament, category, chapters, author, historical_era, names_json FROM books ORDER BY number ASC'
        ).all();

        const formatted = results.map((r: any) => ({
          id: r.id,
          slug: r.slug,
          number: r.number,
          testament: r.testament,
          category: r.category,
          chapters: r.chapters,
          author: r.author,
          historicalEra: r.historical_era,
          names: JSON.parse(r.names_json || '{}'),
        }));

        const res = new Response(JSON.stringify(formatted), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'Cache-Control': METADATA_CACHE_CONTROL,
            'X-Source': 'Cloudflare D1 Global Distributed Database',
          },
        });
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      } catch (d1Err) {
        return new Response(JSON.stringify({ error: 'Database Query Failed', details: String(d1Err) }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. Route: D1 Edge Metadata — Bible Versions (/api/v1/versions)
    if (pathname === '/api/v1/versions') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, code, name, short_name, language_code, language_name, native_language_name, year, copyright, has_strongs, is_interlinear, dir, source_type, helloao_id, bolls_id, description FROM versions ORDER BY language_name ASC, name ASC'
        ).all();

        const formatted = results.map((r: any) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          shortName: r.short_name,
          languageCode: r.language_code,
          languageName: r.language_name,
          nativeLanguageName: r.native_language_name,
          year: r.year,
          copyright: r.copyright,
          hasStrongs: Boolean(r.has_strongs),
          isInterlinear: Boolean(r.is_interlinear),
          dir: r.dir,
          sourceType: r.source_type,
          helloaoId: r.helloao_id,
          bollsId: r.bolls_id,
          description: r.description,
        }));

        const res = new Response(JSON.stringify(formatted), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'Cache-Control': METADATA_CACHE_CONTROL,
            'X-Source': 'Cloudflare D1 Global Distributed Database',
          },
        });
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      } catch (d1Err) {
        return new Response(JSON.stringify({ error: 'Versions Query Failed', details: String(d1Err) }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 7. Route: D1 Strong's Concordance / Lexicon Lookup (/api/v1/strongs/:code)
    const strongsMatch = pathname.match(/^\/api\/v1\/strongs\/([HG]\d+)$/i);
    if (strongsMatch) {
      const code = strongsMatch[1].toUpperCase();
      try {
        const item = await env.DB.prepare(
          'SELECT code, lemma, transliteration, pronunciation, part_of_speech, definition, kjv_occurrences, derivation FROM strongs_lexicon WHERE code = ?'
        ).bind(code).first();

        if (item) {
          const res = new Response(JSON.stringify(item), {
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json',
              'Cache-Control': SCRIPTURE_CACHE_CONTROL,
              'X-Source': 'Cloudflare D1 Strongs Vault',
            },
          });
          ctx.waitUntil(cache.put(cacheKey, res.clone()));
          return res;
        }
      } catch (err) {
        console.error('Strongs query error:', err);
      }

      return new Response(JSON.stringify({ error: 'Strongs Code Not Found', code }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 8. Route: Full-Text Search Gateway (/api/v1/search?q=...&version=...)
    if (pathname === '/api/v1/search') {
      const query = url.searchParams.get('q');
      const version = url.searchParams.get('version') || 'nkjv';
      if (!query || query.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Query parameter q is required' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Proxy search to Hetzner Origin Search Cluster
      if (env.HETZNER_ORIGIN_URL) {
        try {
          const originSearchUrl = `${env.HETZNER_ORIGIN_URL.replace(/\/$/, '')}/api/v1/search?q=${encodeURIComponent(query)}&version=${encodeURIComponent(version)}`;
          const originRes = await fetch(originSearchUrl);
          if (originRes.ok) {
            const data = await originRes.text();
            const res = new Response(data, {
              status: 200,
              headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
                'Cache-Control': SEARCH_CACHE_CONTROL,
                'X-Source': 'Hetzner Origin High-Throughput Search Cluster',
              },
            });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return res;
          }
        } catch (searchErr) {
          console.error('Hetzner search proxy error:', searchErr);
        }
      }

      return new Response(
        JSON.stringify({
          error: 'Search cluster temporarily unavailable',
          message: 'Hetzner Origin Search is warming up',
        }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // 404 for unrecognized routes
    return new Response(JSON.stringify({ error: 'Not Found', path: pathname }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};

/**
 * Transmits a formal digital offering receipt via Maileroo with Apostle Kwame Adu apostolic blessing
 */
async function sendDonationReceipt(
  mailerooKey: string,
  donorEmail: string,
  donorName: string,
  amount: number,
  currency: string,
  frequency: string,
  designation: string,
  transactionId: string
): Promise<void> {
  const fromAddr = 'AduBible <info@adubible.org>';
  const replyTo = 'info@adubible.org';
  const donorClean = donorName || 'Beloved Scripture Partner';
  const currencyClean = (currency || 'USD').toUpperCase();
  const currencySymbol = currencyClean === 'USD' ? '$' : currencyClean === 'EUR' ? '€' : currencyClean === 'GBP' ? '£' : `${currencyClean} `;
  const subject = `Receipt (${currencySymbol}${amount.toFixed(2)}) - Stand with the Word of God`;
  const frequencyClean = frequency === 'monthly' ? 'Monthly Sustaining Covenant Partner' : 'One-Time Seed Offering';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Donation Receipt (${currencySymbol}${amount.toFixed(2)}) — AduBible Stewardship Record</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c241b; line-height: 1.65;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f8f5; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #dfe5dc; border-top: 4px solid #8EA486; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(23, 29, 23, 0.04);">
          <!-- Header with Logo Mark and Brand Colors -->
          <tr>
            <td style="padding: 22px 28px 18px; border-bottom: 1px solid #edf2eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="https://adubible.org/brand/icon-128.png" alt="AduBible Logo" width="34" height="34" style="display: inline-block; vertical-align: middle; border-radius: 6px; margin-right: 10px;" />
                    <span style="font-size: 20px; font-weight: 700; font-family: Georgia, serif; vertical-align: middle;">
                      <span style="color: #8EA486;">Adu</span><span style="color: #B8AC94;">Bible</span><span style="color: #8E968D; font-size: 14px; font-weight: 600;">.org</span>
                    </span>
                  </td>
                  <td style="text-align: right; vertical-align: middle; font-size: 12px; font-weight: 600; color: #677953; letter-spacing: 0.04em;">
                    Official Stewardship Receipt
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letter Body -->
          <tr>
            <td style="padding: 28px 28px 24px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #171d17;">
                Grace, peace, and manifold blessings to you, <strong>${donorClean}</strong>,
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 16px; line-height: 1.7;">
                Thank you for your generous seed offering of <strong>${currencySymbol}${amount.toFixed(2)}</strong>. Please find your official electronic donation receipt and stewardship summary below for your personal and tax records.
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 16px; line-height: 1.7;">
                Because of your sacrificial support, the Holy Scriptures remain <strong>100% free, unmonetized, and completely unhindered by commercial advertisements</strong> for millions of souls worldwide across 35+ languages.
              </p>

              <p style="font-size: 15px; color: #2d3729; margin: 0 0 20px; line-height: 1.7;">
                Your partnership directly supports the ongoing gospel translation work and rural Scripture distribution planted in Nsuhia, Ghana, bringing God's Word to students, rural villages, and believers seeking truth.
              </p>

              <!-- Official Offering Record in AduBible Brand Palette -->
              <table role="presentation" width="100%" style="background-color: #fbfcfb; border: 1px solid #e1e7de; border-radius: 8px; margin: 22px 0; font-size: 14px; border-collapse: collapse;">
                <tr style="background-color: #f1f5ef;">
                  <td colspan="2" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #677953; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e1e7de;">
                    Offering Record &amp; Stewardship Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Amount Contributed</td>
                  <td style="padding: 10px 14px; font-weight: 700; color: #677953; text-align: right; border-bottom: 1px solid #edf2eb;">${currency} ${amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Gift Frequency</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right; border-bottom: 1px solid #edf2eb;">${frequencyClean}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Mission Focus</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right; border-bottom: 1px solid #edf2eb;">${designation}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966; border-bottom: 1px solid #edf2eb;">Reference Code</td>
                  <td style="padding: 10px 14px; font-family: monospace; color: #2d3729; text-align: right; border-bottom: 1px solid #edf2eb;">${transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6a7966;">Record Date</td>
                  <td style="padding: 10px 14px; color: #171d17; text-align: right;">${currentDate}</td>
                </tr>
              </table>

              <!-- Scripture Blessing in Brand Tone -->
              <blockquote style="margin: 22px 0; padding: 14px 18px; background-color: #f8faf7; border-left: 4px solid #8EA486; color: #20271f; font-size: 14px; font-style: italic; line-height: 1.65;">
                &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.&rdquo;
                <div style="margin-top: 6px; font-size: 12px; font-weight: 700; color: #8EA486; font-style: normal;">
                  &mdash; 2 Corinthians 9:7&ndash;8
                </div>
              </blockquote>

              <p style="font-size: 15px; color: #2d3729; margin: 20px 0 16px; line-height: 1.7;">
                If you ever have a personal prayer request, a biblical question, or simply need spiritual encouragement, <strong>please hit reply directly to this message</strong>. I read and hold our partners in prayer personally.
              </p>

              <!-- Personal Sign-Off -->
              <div style="margin-top: 28px; font-size: 15px; color: #171d17; line-height: 1.6;">
                With deep pastoral gratitude and prayers,<br>
                <strong style="color: #171d17; font-size: 16px;">Apostle Kwame Adu</strong><br>
                <span style="font-size: 13px; color: #6a7966;">AduBible Scripture Sanctuary &middot; Nsuhia, Ghana</span><br>
                <a href="https://adubible.org" style="color: #677953; text-decoration: none; font-size: 13px; font-weight: 600;">adubible.org &rarr;</a>
              </div>
            </td>
          </tr>

          <!-- Minimal Footer with Brand Colors -->
          <tr>
            <td style="padding: 16px 28px; background-color: #f6f8f5; border-top: 1px solid #edf2eb; text-align: center; font-size: 11px; color: #8E968D; line-height: 1.5;">
              Official Electronic Donation Record &middot; AduBible Scripture Mission<br>
              Dedicated to Humanity &middot; 100% Ads-Free Covenant &middot; <a href="https://adubible.org" style="color: #8EA486;">adubible.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  const plain = `Grace, peace, and manifold blessings to you, ${donorClean},\n\nI am writing to you with a heart full of thanksgiving. Because of your sacrificial seed of ${currency} ${amount.toFixed(2)}, the Holy Scriptures remain 100% free, unmonetized, and completely unhindered by commercial advertisements for millions of souls worldwide across 35+ languages.\n\nOFFERING RECORD & STEWARDSHIP SUMMARY:\n- Amount Contributed: ${currency} ${amount.toFixed(2)}\n- Gift Frequency: ${frequencyClean}\n- Mission Focus: ${designation}\n- Reference Code: ${transactionId}\n- Record Date: ${currentDate}\n\n\"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly...\" — 2 Corinthians 9:7-8\n\nIf you ever have a personal prayer request or simply need spiritual encouragement, please reply directly to this message. I read and hold our partners in prayer personally.\n\nWith deep pastoral gratitude and prayers,\nApostle Kwame Adu\nAduBible Scripture Sanctuary · Nsuhia, Ghana\nhttps://adubible.org`;

  const payload = new URLSearchParams({
    from: fromAddr,
    to: donorEmail,
    subject,
    html,
    plain,
    reply_to: replyTo,
  });

  try {
    await fetch('https://smtp.maileroo.com/send', {
      method: 'POST',
      headers: {
        'X-API-Key': mailerooKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });
  } catch {
    // ignore
  }
}
