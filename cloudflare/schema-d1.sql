-- ====================================================================
-- ADUBIBLE / ELOHIM BIBLE HUB — CLOUDFLARE D1 DISTRIBUTED EDGE SCHEMA
-- Scale: 4 Billion Readers Worldwide
-- ====================================================================

-- 1. Canonical & Historical Books Table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  number INTEGER NOT NULL,
  testament TEXT NOT NULL CHECK(testament IN ('OT', 'NT', 'DEUT', 'APOC')),
  category TEXT NOT NULL,
  chapters INTEGER NOT NULL,
  author TEXT NOT NULL,
  historical_era TEXT,
  names_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_number ON books(number);
CREATE INDEX IF NOT EXISTS idx_books_testament ON books(testament);

-- 2. Bible Versions Registry Table
CREATE TABLE IF NOT EXISTS versions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  language_code TEXT NOT NULL,
  language_name TEXT NOT NULL,
  native_language_name TEXT NOT NULL,
  year TEXT,
  copyright TEXT NOT NULL,
  has_strongs INTEGER NOT NULL DEFAULT 0,
  is_interlinear INTEGER NOT NULL DEFAULT 0,
  dir TEXT NOT NULL DEFAULT 'ltr',
  source_type TEXT NOT NULL DEFAULT 'r2',
  helloao_id TEXT,
  bolls_id TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_versions_lang ON versions(language_code);
CREATE INDEX IF NOT EXISTS idx_versions_code ON versions(code);

-- 3. Languages Registry Table
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  dir TEXT NOT NULL DEFAULT 'ltr',
  script TEXT NOT NULL DEFAULT 'LTR',
  region TEXT,
  flag TEXT,
  version_count INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Strong's Exhaustive Concordance / Lexicon Table
CREATE TABLE IF NOT EXISTS strongs_lexicon (
  code TEXT PRIMARY KEY, -- e.g. G2128, H7225
  lemma TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  kjv_occurrences INTEGER,
  derivation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_strongs_lemma ON strongs_lexicon(lemma);

-- 5. Chapter Manifest Index (Quick edge resolution to R2)
CREATE TABLE IF NOT EXISTS chapter_manifest (
  id TEXT PRIMARY KEY, -- version:book:chapter e.g. nkjv:JHN:3
  version_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_count INTEGER NOT NULL,
  r2_path TEXT NOT NULL,
  has_audio INTEGER DEFAULT 0,
  audio_r2_path TEXT,
  etag TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manifest_lookup ON chapter_manifest(version_id, book_id, chapter);

-- 6. Anonymous Global Readership Metrics (Aggregated by Cloudflare Edge Worker)
CREATE TABLE IF NOT EXISTS global_read_telemetry (
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  read_count INTEGER DEFAULT 0,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id, chapter)
);
