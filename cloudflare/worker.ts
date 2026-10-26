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
