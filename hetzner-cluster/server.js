/**
 * ADUBIBLE / ELOHIM BIBLE HUB — HETZNER HIGH-THROUGHPUT ORIGIN CLUSTER
 * Scale Target: Planetary Scale (4 Billion Global Readers)
 * Runs across all CPU cores via Node.js native cluster
 */

import cluster from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NUM_WORKERS = parseInt(process.env.WORKERS || String(Math.max(1, os.cpus().length)), 10);

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`====================================================================`);
  console.log(`🚀 [ADUBIBLE HETZNER ORIGIN CLUSTER PRIMARY] PID: ${process.pid}`);
  console.log(`⚡ Detected ${os.cpus().length} CPU cores. Forking ${NUM_WORKERS} workers...`);
  console.log(`🌐 Ready to back Cloudflare Edge for 4 Billion Readers`);
  console.log(`====================================================================`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ [HETZNER CLUSTER] Worker ${worker.process.pid} died (${signal || code}). Respawning immediately...`);
    cluster.fork();
  });
} else {
  // WORKER PROCESS
  const app = express();
  const workerPid = process.pid;

  // Middleware pipeline
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression({ level: 6 }));
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match', 'stripe-signature'],
      maxAge: 86400,
    })
  );
  app.use(
    express.json({
      limit: '2mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // High-performance In-Memory LRU Cache
  const memoryCache = new Map();
  const MAX_CACHE_ITEMS = 10000;

  // Simple telemetry metrics
  let totalRequests = 0;
  let cacheHits = 0;
  const startTime = Date.now();

  function getFromCache(key) {
    if (memoryCache.has(key)) {
      cacheHits++;
      return memoryCache.get(key);
    }
    return null;
  }

  function setInCache(key, val) {
    if (memoryCache.size >= MAX_CACHE_ITEMS) {
      const oldestKey = memoryCache.keys().next().value;
      memoryCache.delete(oldestKey);
    }
    memoryCache.set(key, val);
  }

  // Pre-load seed chapters from seed directory if present
  const seedDir = path.join(__dirname, '../public/seed');
  const preloadedSeeds = new Map();

  if (fs.existsSync(seedDir)) {
    try {
      const files = fs.readdirSync(seedDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const key = file.replace('.json', '').toLowerCase();
        const content = fs.readFileSync(path.join(seedDir, file), 'utf-8');
        preloadedSeeds.set(key, JSON.parse(content));
      }
      console.log(`[Worker ${workerPid}] Pre-loaded ${preloadedSeeds.size} seed editions into memory.`);
    } catch (e) {
      console.warn(`[Worker ${workerPid}] Could not pre-load seeds:`, e.message);
    }
  }

  // 1. Healthcheck & Liveness Probe
  app.get(['/healthz', '/api/v1/health'], (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      status: 'healthy',
      tier: 'Hetzner Bare-Metal Dedicated Origin',
      workerPid,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      cachedItems: memoryCache.size,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Metrics endpoint (Prometheus format)
  app.get('/metrics', (req, res) => {
    totalRequests++;
    const hitRate = totalRequests > 0 ? ((cacheHits / totalRequests) * 100).toFixed(2) : '0';
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(
      `# HELP adubible_requests_total Total HTTP requests served by Hetzner origin\n` +
      `# TYPE adubible_requests_total counter\n` +
      `adubible_requests_total{worker="${workerPid}"} ${totalRequests}\n\n` +
      `# HELP adubible_cache_hits_total In-memory cache hits\n` +
      `# TYPE adubible_cache_hits_total counter\n` +
      `adubible_cache_hits_total{worker="${workerPid}"} ${cacheHits}\n\n` +
      `# HELP adubible_cache_hit_ratio Cache hit percentage\n` +
      `# TYPE adubible_cache_hit_ratio gauge\n` +
      `adubible_cache_hit_ratio{worker="${workerPid}"} ${hitRate}\n`
    );
  });

  // 3. Resolve Chapter Data
  app.get('/api/v1/chapters/:version/:book/:chapter', async (req, res) => {
    totalRequests++;
    const { version, book, chapter } = req.params;
    const vKey = version.toLowerCase();
    const bKey = book.toUpperCase();
    const chNum = parseInt(chapter, 10);
    const cacheKey = `${vKey}:${bKey}:${chNum}`;

    // A. Check in-memory cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Hetzner-Cache': 'HIT',
      });
      return res.send(cached);
    }

    // B. Check pre-loaded seed editions (e.g. Ephesians 1)
    if (bKey === 'EPH' && chNum === 1 && preloadedSeeds.has(vKey)) {
      const data = JSON.stringify(preloadedSeeds.get(vKey));
      setInCache(cacheKey, data);
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Hetzner-Cache': 'SEED-HIT',
      });
      return res.send(data);
    }

    // C. Fallback: Proxy from HelloAO or Bolls and cache
    try {
      const upstreamUrl = `https://bible.helloao.org/api/${encodeURIComponent(vKey)}/${encodeURIComponent(bKey)}/${chNum}.json`;
      const upstreamRes = await fetch(upstreamUrl, {
        headers: { 'User-Agent': 'AduBible-Hetzner-Cluster/1.0' },
      });

      if (upstreamRes.ok) {
        const text = await upstreamRes.text();
        setInCache(cacheKey, text);
        res.set({
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Hetzner-Cache': 'UPSTREAM-FETCH-CACHED',
        });
        return res.send(text);
      }
    } catch (err) {
      console.error(`[Worker ${workerPid}] Upstream fetch failed:`, err.message);
    }

    return res.status(404).json({
      error: 'Chapter Not Found',
      version: vKey,
      book: bKey,
      chapter: chNum,
    });
  });

  // 4. Full-Text Search Endpoint
  app.get('/api/v1/search', (req, res) => {
    totalRequests++;
    const query = req.query.q;
    const version = req.query.version || 'nkjv';

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const qLower = query.toLowerCase().trim();
    const cacheKey = `search:${version}:${qLower}`;
    const cachedSearch = getFromCache(cacheKey);

    if (cachedSearch) {
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Hetzner-Cache': 'HIT',
      });
      return res.send(cachedSearch);
    }

    // Sample Search Resolution across preloaded corpus
    const matchedVerses = [];
    for (const [vCode, seedData] of preloadedSeeds.entries()) {
      if (vCode === version.toLowerCase() || version === 'all') {
        const content = seedData?.chapter?.content || [];
        for (const item of content) {
          if (item.type === 'verse' && Array.isArray(item.content)) {
            const verseText = item.content
              .map((c) => (typeof c === 'string' ? c : c?.text || ''))
              .join(' ')
              .trim();
            if (verseText.toLowerCase().includes(qLower)) {
              matchedVerses.push({
                version: vCode,
                book: seedData?.book?.commonName || 'Ephesians',
                chapter: seedData?.chapter?.number || 1,
                verse: item.number,
                text: verseText,
              });
            }
          }
        }
      }
    }

    const responsePayload = JSON.stringify({
      query: qLower,
      version,
      totalMatches: matchedVerses.length,
      results: matchedVerses.slice(0, 50),
    });

    setInCache(cacheKey, responsePayload);
    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Hetzner-Cache': 'COMPUTED',
    });
    return res.send(responsePayload);
  });

  // 5. Maileroo Transactional Email Dispatch Endpoint
  app.post('/api/v1/email/send', async (req, res) => {
    totalRequests++;
    const { to, subject, html, plain, from } = req.body || {};
    const apiKey = process.env.MAILEROO_API_KEY || '0f0b8b60d11196da2729fe59361df5b137cc9ff901987bfae92ce6dc6fa904df';
    const fromAddr = from || process.env.SMTP_FROM || 'AduBible <no-reply@adubible.org>';

    if (!to || !subject || (!html && !plain)) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html or plain)' });
    }

    try {
      const payload = new URLSearchParams({
        from: fromAddr,
        to: String(to).trim(),
        subject: String(subject).trim(),
        html: html || plain,
        plain: plain || html,
      });

      const response = await fetch('https://smtp.maileroo.com/send', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.success) {
        return res.json({ success: true, messageId: data?.data?.message_id || 'ok' });
      }

      return res.status(response.status).json({
        success: false,
        error: data?.message || 'Maileroo dispatch failed',
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. 10s Scripture Status Video Presets & Fal.ai Prompt Generator
  app.get('/api/v1/status-video/presets', (req, res) => {
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

    res.json({
      presets,
      watermark: 'Adubible.org',
      supportedRatios: ['9:16', '1:1', '16:9'],
      defaultDurationSeconds: 10,
      socialTargets: ['WhatsApp Status', 'Instagram Stories/Reels', 'TikTok', 'YouTube Shorts', 'X', 'Facebook'],
    });
  });

  app.post('/api/v1/status-video/ai-prompt', (req, res) => {
    const { verse = 'John 3:16', theme = 'celestial', aspectRatio = '9:16' } = req.body || {};
    const presets = {
      celestial: 'cinematic ethereal morning sunbeams piercing ancient sacred sanctuary, golden dust floating in radiant light, 4k 60fps slow gentle motion background',
      candlelight: 'warm flickering candlelight in an ancient stone chapel, gentle amber shadows dancing on sacred manuscript, peaceful prayer ambience',
      clouds: 'majestic mountain peaks above rolling heavenly clouds, divine azure sky and golden godrays breaking through mist, aerial slow motion',
      obsidian: 'deep velvet cosmic starlight, slow drifting golden celestial particles, royal deep purple nebula, reverent holy majesty',
      covenant: 'crystal clear living water ripples over smooth river stones, lush serene emerald garden of Eden, soft morning light reflections',
    };
    const falPrompt = presets[theme] || presets.celestial;
    res.json({
      verse,
      theme,
      recommendedFalPrompt: `${falPrompt}, sacred biblical atmosphere for scripture text overlay of ${verse}`,
      watermark: 'Adubible.org',
      durationSeconds: 10,
      aspectRatio,
    });
  });

  // 7. Stripe Donation Checkout Session Creator
  app.post(['/api/donations/checkout/stripe', '/api/v1/donations/checkout/stripe'], async (req, res) => {
    try {
      const { amount = 25, currency = 'USD', frequency = 'once', designation = 'general', donorEmail, donorName, returnUrl, cancelUrl } = req.body || {};
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const numAmount = Math.max(1, parseFloat(amount) || 25);
      const cur = (currency || 'USD').toLowerCase();
      const origin = returnUrl || 'https://adubible.org/donate/?status=success';
      const cancel = cancelUrl || 'https://adubible.org/donate/?status=cancelled';

      if (stripeKey && (stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_'))) {
        const params = new URLSearchParams();
        params.append('managed_payments[enabled]', 'false');
        params.append('success_url', origin);
        params.append('cancel_url', cancel);
        if (donorEmail) {
          params.append('customer_email', donorEmail);
        }
        params.append('client_reference_id', `adubible_${Date.now()}`);
        params.append('metadata[designation]', designation);
        params.append('metadata[donor_name]', donorName || 'Beloved Scripture Partner');
        params.append('metadata[frequency]', frequency);

        if (frequency === 'monthly') {
          params.append('mode', 'subscription');
          params.append('line_items[0][price_data][currency]', cur);
          params.append('line_items[0][price_data][unit_amount]', String(Math.round(numAmount * 100)));
          params.append('line_items[0][price_data][recurring][interval]', 'month');
          params.append('line_items[0][price_data][product_data][name]', 'AduBible Monthly Scripture Partner');
          params.append('line_items[0][price_data][product_data][description]', `Apostle Kwame Adu Gospel Scripture Mission · ${designation}`);
          params.append('line_items[0][quantity]', '1');
        } else {
          params.append('mode', 'payment');
          params.append('line_items[0][price_data][currency]', cur);
          params.append('line_items[0][price_data][unit_amount]', String(Math.round(numAmount * 100)));
          params.append('line_items[0][price_data][product_data][name]', 'AduBible One-Time Scripture Offering');
          params.append('line_items[0][price_data][product_data][description]', `100% Ad-Free Scripture Distribution for Humanity · ${designation}`);
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
        const sessionData = await stripeRes.json();
        if (sessionData.url) {
          return res.json({ url: sessionData.url, id: sessionData.id });
        }
        if (sessionData.error?.message) {
          return res.status(400).json({ error: sessionData.error.message });
        }
      }

      return res.status(400).json({ error: 'Stripe gateway credentials unconfigured.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 8. PayPal Donation Checkout Order Creator
  app.post(['/api/donations/checkout/paypal', '/api/v1/donations/checkout/paypal'], async (req, res) => {
    try {
      const { amount = 25, currency = 'USD', frequency = 'once', designation = 'general', donorEmail, returnUrl, cancelUrl } = req.body || {};
      const numAmount = Math.max(1, parseFloat(amount) || 25);
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const mode = process.env.PAYPAL_MODE || 'live';
      const baseUrl = mode === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
      const origin = returnUrl || 'https://adubible.org/donate/?status=success';
      const cancel = cancelUrl || 'https://adubible.org/donate/?status=cancelled';

      if (clientId && clientSecret) {
        const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const authData = await authRes.json();
        if (authData.access_token) {
          const accessToken = authData.access_token;

          // Monthly recurring subscription support
          if (frequency === 'monthly') {
            try {
              const prodRes = await fetch(`${baseUrl}/v1/catalogs/products`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: 'AduBible Monthly Mission Partner',
                  description: `Monthly scripture mission donation · ${designation}`,
                  type: 'DIGITAL',
                  category: 'CHARITY',
                }),
              });
              const prodData = await prodRes.json();
              if (prodData?.id) {
                const planRes = await fetch(`${baseUrl}/v1/billing/plans`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
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
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      plan_id: planData.id,
                      application_context: {
                        brand_name: 'AduBible Scripture Mission',
                        return_url: origin,
                        cancel_url: cancel,
                      },
                    }),
                  });
                  const subData = await subRes.json();
                  const subApproval = subData.links?.find((l) => l.rel === 'approve')?.href;
                  if (subApproval) {
                    return res.json({ approvalUrl: subApproval, orderId: subData.id });
                  }
                }
              }
            } catch (subErr) {
              console.warn('[Hetzner PayPal Subscription Error]', subErr);
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
                  description: `AduBible Scripture Mission — ${designation}`,
                  custom_id: donorEmail || 'anonymous',
                  amount: {
                    currency_code: currency,
                    value: numAmount.toFixed(2),
                  },
                },
              ],
              application_context: {
                brand_name: 'AduBible Scripture Mission',
                return_url: origin,
                cancel_url: cancel,
                user_action: 'PAY_NOW',
              },
            }),
          });
          const orderData = await orderRes.json();
          const approvalLink = orderData.links?.find((l) => l.rel === 'approve')?.href;
          if (approvalLink) {
            return res.json({ approvalUrl: approvalLink, orderId: orderData.id });
          }
          if (orderData?.message) {
            return res.status(400).json({ error: orderData.message });
          }
        }
      }

      return res.status(400).json({ error: 'PayPal gateway credentials unconfigured.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 9. Stripe Webhook Endpoint
  app.post(['/api/donations/webhook/stripe', '/api/webhooks/stripe', '/webhook/stripe'], async (req, res) => {
    try {
      const event = req.body;
      const eventType = event?.type;
      console.log(`[HETZNER STRIPE WEBHOOK] Received: ${eventType}`);

      if (eventType === 'checkout.session.completed') {
        const session = event.data?.object || {};
        const donorEmail = session.customer_details?.email || session.customer_email || session.metadata?.donor_email;
        const donorName = session.customer_details?.name || session.metadata?.donor_name || 'Beloved Scripture Partner';
        const amount = (session.amount_total || 0) / 100;
        const currency = (session.currency || 'USD').toUpperCase();
        const frequency = session.mode === 'subscription' ? 'monthly' : 'once';
        const designation = session.metadata?.designation || 'General Scripture Mission';
        const txId = session.id || event.id;

        if (donorEmail && process.env.MAILEROO_API_KEY) {
          await dispatchReceiptEmail(process.env.MAILEROO_API_KEY, donorEmail, donorName, amount, currency, frequency, designation, txId);
        }
      }

      return res.json({ received: true, event: eventType });
    } catch (err) {
      console.error('[HETZNER STRIPE WEBHOOK ERROR]:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 10. PayPal Webhook Endpoint
  app.post(['/api/donations/webhook/paypal', '/api/webhooks/paypal', '/webhook/paypal'], async (req, res) => {
    try {
      const payload = req.body;
      const eventType = payload?.event_type;
      console.log(`[HETZNER PAYPAL WEBHOOK] Received: ${eventType}`);

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.COMPLETED') {
        const resource = payload.resource || {};
        const amount = parseFloat(resource.amount?.value || '0');
        const currency = (resource.amount?.currency_code || 'USD').toUpperCase();
        const donorEmail = resource.payer?.email_address || resource.custom_id;
        const donorName = [resource.payer?.name?.given_name, resource.payer?.name?.surname].filter(Boolean).join(' ') || 'Beloved Scripture Partner';
        const txId = resource.id || payload.id;

        if (donorEmail && donorEmail.includes('@') && process.env.MAILEROO_API_KEY) {
          await dispatchReceiptEmail(process.env.MAILEROO_API_KEY, donorEmail, donorName, amount, currency, 'once', 'General Scripture Distribution (PayPal)', txId);
        }
      }

      return res.json({ received: true, event_type: eventType });
    } catch (err) {
      console.error('[HETZNER PAYPAL WEBHOOK ERROR]:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  async function dispatchReceiptEmail(mailerooKey, donorEmail, donorName, amount, currency, frequency, designation, transactionId) {
    const donorClean = donorName || 'Beloved Scripture Partner';
    const currencyClean = (currency || 'USD').toUpperCase();
    const currencySymbol = currencyClean === 'USD' ? '$' : currencyClean === 'EUR' ? '€' : currencyClean === 'GBP' ? '£' : `${currencyClean} `;
    const frequencyClean = frequency === 'monthly' ? 'Monthly Sustaining Covenant Partner' : 'One-Time Seed Offering';
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const payload = new URLSearchParams({
      from: 'AduBible <info@adubible.org>',
      reply_to: 'info@adubible.org',
      to: donorEmail,
      subject: `Receipt (${currencySymbol}${amount.toFixed(2)}) - Stand with the Word of God`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Donation Receipt (${currencySymbol}${amount.toFixed(2)}) — AduBible Stewardship Record</title></head>
<body style="margin:0;padding:0;background-color:#f6f8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c241b;line-height:1.65;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f6f8f5;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background-color:#fff;border:1px solid #dfe5dc;border-top:4px solid #8EA486;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:22px 28px 18px;border-bottom:1px solid #edf2eb;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="https://adubible.org/brand/icon-128.png" alt="AduBible Logo" width="34" height="34" style="display:inline-block;vertical-align:middle;border-radius:6px;margin-right:10px;" />
                <span style="font-size:20px;font-weight:700;font-family:Georgia,serif;vertical-align:middle;">
                  <span style="color:#8EA486;">Adu</span><span style="color:#B8AC94;">Bible</span><span style="color:#8E968D;font-size:14px;font-weight:600;">.org</span>
                </span>
              </td>
              <td style="text-align:right;vertical-align:middle;font-size:12px;font-weight:600;color:#677953;">Official Stewardship Receipt</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:28px 28px 24px;">
          <p style="font-size:16px;margin:0 0 16px;color:#171d17;">Grace and peace to you in Christ Jesus, <strong>${donorClean}</strong>,</p>
          <p style="font-size:15px;color:#2d3729;margin:0 0 16px;">
            Thank you for your generous seed offering of <strong>${currencySymbol}${amount.toFixed(2)}</strong>. Please find your official electronic donation receipt and stewardship summary below for your personal and tax records. Because of your sacrificial support, God's Word remains 100% free, unmonetized, and without commercial advertisement across 35+ languages.
          </p>
          <table role="presentation" width="100%" style="background-color:#fbfcfb;border:1px solid #e1e7de;border-radius:8px;margin:22px 0;font-size:14px;border-collapse:collapse;">
            <tr style="background-color:#f1f5ef;"><td colspan="2" style="padding:10px 14px;font-size:12px;font-weight:700;color:#677953;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e1e7de;">Offering Record &amp; Stewardship Summary</td></tr>
            <tr><td style="padding:9px 14px;color:#6a7966;border-bottom:1px solid #edf2eb;">Amount Contributed</td><td style="padding:9px 14px;font-weight:700;color:#677953;text-align:right;border-bottom:1px solid #edf2eb;">${currency} ${amount.toFixed(2)}</td></tr>
            <tr><td style="padding:9px 14px;color:#6a7966;border-bottom:1px solid #edf2eb;">Gift Frequency</td><td style="padding:9px 14px;color:#171d17;text-align:right;border-bottom:1px solid #edf2eb;">${frequencyClean}</td></tr>
            <tr><td style="padding:9px 14px;color:#6a7966;border-bottom:1px solid #edf2eb;">Reference Code</td><td style="padding:9px 14px;font-family:monospace;color:#2d3729;text-align:right;border-bottom:1px solid #edf2eb;">${transactionId}</td></tr>
            <tr><td style="padding:9px 14px;color:#6a7966;">Record Date</td><td style="padding:9px 14px;color:#171d17;text-align:right;">${currentDate}</td></tr>
          </table>
          <blockquote style="margin:22px 0;padding:14px 18px;background-color:#f8faf7;border-left:4px solid #8EA486;color:#20271f;font-size:14px;font-style:italic;">
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly...&rdquo; &mdash; 2 Corinthians 9:7&ndash;8
          </blockquote>
          <p style="font-size:15px;color:#2d3729;margin:20px 0 16px;">If you ever have a prayer request or need biblical counsel, simply hit reply directly to this message.</p>
          <div style="margin-top:28px;font-size:15px;color:#171d17;">
            With deep pastoral gratitude,<br><strong style="font-size:16px;">Apostle Kwame Adu</strong><br><span style="font-size:13px;color:#6a7966;">AduBible Scripture Sanctuary · Nsuhia, Ghana · <a href="https://adubible.org" style="color:#677953;text-decoration:none;">adubible.org</a></span>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      plain: `AduBible Offering Receipt & Blessing\n\nDear ${donorClean},\n\nThank you for your offering of ${currency} ${amount.toFixed(2)} (${frequencyClean}). Reference: ${transactionId}.\n\nGod loves a cheerful giver — 2 Corinthians 9:7\n\nYours in Christ,\nApostle Kwame Adu\nhttps://adubible.org`,
    });
    try {
      await fetch('https://smtp.maileroo.com/send', {
        method: 'POST',
        headers: { 'X-API-Key': mailerooKey, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });
    } catch {}
  }

  const server = http.createServer(app);
  server.listen(PORT, HOST, () => {
    console.log(`⚡ [Worker ${workerPid}] Hetzner Origin API listening on http://${HOST}:${PORT}`);
  });
}
