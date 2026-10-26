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
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
      maxAge: 86400,
    })
  );
  app.use(express.json({ limit: '1mb' }));

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

  const server = http.createServer(app);
  server.listen(PORT, HOST, () => {
    console.log(`⚡ [Worker ${workerPid}] Hetzner Origin API listening on http://${HOST}:${PORT}`);
  });
}
