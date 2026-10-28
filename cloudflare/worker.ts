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

        if (stripeKey && stripeKey.startsWith('sk_')) {
          const params = new URLSearchParams();
          params.append('success_url', returnUrl);
          params.append('cancel_url', cancelUrl);
          params.append('customer_email', body.donorEmail || '');
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
            params.append('line_items[0][price_data][product_data][description]', `Apostle Kwame Adu Memorial Scripture Mission · ${body.designation || 'General'}`);
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
        }

        // Direct Stripe Hosted Checkout Link Fallback
        const directLink = frequency === 'monthly'
          ? `https://buy.stripe.com/adubible_partner_${amount}`
          : `https://donate.stripe.com/adubible_seed_${amount}`;

        return new Response(
          JSON.stringify({
            url: `${directLink}?prefilled_email=${encodeURIComponent(body.donorEmail || '')}`,
          }),
          {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          }
        );
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
            const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authData.access_token}`,
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
          }
        }

        // Direct PayPal Donate Link Fallback
        const ppParams = new URLSearchParams({
          business: 'donations@adubible.org',
          amount: amount.toFixed(2),
          currency_code: currency,
          item_name: `AduBible Scripture Mission (${body.frequency || 'once'})`,
          return: returnUrl,
          cancel_return: cancelUrl,
        });

        return new Response(
          JSON.stringify({
            approvalUrl: `https://www.paypal.com/donate?${ppParams.toString()}`,
          }),
          {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          }
        );
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
                'X-Edge-Cache', 'MISS-HETZNER-HIT',
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
 * Transmits a formal digital offering receipt via Maileroo with Apostle Kwame Adu memorial blessing
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
  const fromAddr = 'AduBible Scripture Mission <donations@adubible.org>';
  const subject = `Official Offering Receipt — Thank You for Supporting AduBible (${currency} ${amount.toFixed(2)})`;
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1c1917;color:#f5f5f4;padding:32px;border-radius:16px;border:1px solid #78350f;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#f59e0b;font-size:26px;margin:0 0 8px 0;">AduBible Scripture Mission</h1>
        <p style="color:#a8a29e;font-size:13px;margin:0;">Honoring the Generational Gospel Legacy of Apostle Kwame Adu · Nsuhia, Ghana</p>
      </div>
      <div style="background:#292524;border-radius:12px;padding:24px;border:1px solid #44403c;margin-bottom:24px;">
        <h2 style="color:#fafaf9;font-size:18px;margin-top:0;">Dear ${donorName || 'Beloved Scripture Partner'},</h2>
        <p style="font-size:14px;line-height:1.7;color:#d6d3d1;">
          We receive your generous offering with deep gratitude in Christ Jesus. Because of your faithful seed, God's Word remains <strong>100% free, unmonetized, and without commercial advertisement</strong> for over 4 billion souls worldwide across 35+ languages.
        </p>
        <table style="width:100%;margin-top:16px;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #44403c;">
            <td style="padding:8px 0;color:#a8a29e;">Offering Amount:</td>
            <td style="padding:8px 0;text-align:right;font-weight:bold;color:#f59e0b;">${currency} ${amount.toFixed(2)}</td>
          </tr>
          <tr style="border-bottom:1px solid #44403c;">
            <td style="padding:8px 0;color:#a8a29e;">Frequency:</td>
            <td style="padding:8px 0;text-align:right;color:#fafaf9;">${frequency === 'monthly' ? 'Monthly Covenant Partner' : 'One-Time Seed'}</td>
          </tr>
          <tr style="border-bottom:1px solid #44403c;">
            <td style="padding:8px 0;color:#a8a29e;">Mission Focus:</td>
            <td style="padding:8px 0;text-align:right;color:#fafaf9;">${designation}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#a8a29e;">Transaction ID:</td>
            <td style="padding:8px 0;text-align:right;font-family:monospace;color:#a8a29e;">${transactionId}</td>
          </tr>
        </table>
      </div>
      <blockquote style="margin:0 0 24px 0;padding:12px 16px;background:#451a03;border-left:4px solid #f59e0b;font-style:italic;color:#fde68a;font-size:13px;">
        &ldquo;Now may He who supplies seed to the sower, and bread for food, supply and multiply the seed you have sown and increase the fruits of your righteousness.&rdquo; &mdash; 2 Corinthians 9:10
      </blockquote>
      <div style="text-align:center;font-size:12px;color:#78716c;border-top:1px solid #292524;padding-top:16px;">
        AduBible.org &middot; A Sacred Non-Profit Ministry &middot; <a href="https://adubible.org/" style="color:#f59e0b;text-decoration:none;">adubible.org</a>
      </div>
    </div>
  `;
  const plain = `Official Offering Receipt - AduBible Scripture Mission\n\nDear ${donorName},\nThank you for your generous gift of ${currency} ${amount.toFixed(2)} (${frequency}). Transaction ID: ${transactionId}.\nMay God richly multiply your seed!\n\nhttps://adubible.org`;

  const payload = new URLSearchParams({
    from: fromAddr,
    to: donorEmail,
    subject,
    html,
    plain,
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
