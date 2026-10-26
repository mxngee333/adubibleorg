# ELOHIM BIBLE HUB — API Specification & Service Contracts
**Author:** Elder 3 — Hermes (Supreme API & Integration Architect)  
**Project:** ELOHIM BIBLE HUB (`c:\Users\kwame\Downloads\bible`)  
**Status:** Production Engineering Specification (v1.0.0 — OpenAPI 3.1 Compliant)

---

## 1. Multi-Provider Scripture & Commentary Integration Overview

ELOHIM BIBLE HUB integrates directly with three resilient, open-access, CORS-enabled HTTPS Bible and Commentary APIs without requiring proprietary API keys or imposing rate-limit paywalls on end users:

| Tier | Provider | Base URL | Strengths & Coverage | Timeout / Retry Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Primary)** | **Free Use Bible API (HelloAO)** | `https://bible.helloao.org/api` | 1,000+ languages, Berean Standard Bible (BSB), KJV, ASV, WEB, original texts, + 6 complete multi-volume commentaries (Matthew Henry, JFB, John Gill, Geneva, Keil & Delitzsch, Tyndale). | `3500ms` timeout, 1 automatic retry, CDN edge cached. |
| **Tier 2 (Secondary)** | **Bolls.life Bible API** | `https://bolls.life` | High-speed chapter endpoints, WLC (Westminster Leningrad Codex), LXX (Septuagint), TR (Textus Receptus), Luther, Reina-Valera, Louis Segond, CUV, plus embedded Strong's numbers. | `3500ms` timeout, automatic fallback from Tier 1. |
| **Tier 3 (Tertiary)** | **Bible-API.com** | `https://bible-api.com` | Ultra-reliable classic public domain fallback (KJV, WEB,cherokee, clementine vulgate, almeida, rvr). | `4000ms` timeout, terminal fallback before offline synthetic generation. |

---

## 2. OpenAPI 3.1 Specification for Upstream & Client Contracts

```yaml
openapi: 3.1.0
info:
  title: ELOHIM BIBLE HUB — Federation & Sync API Contract
  version: 1.0.0
  description: >
    Unified OpenAPI 3.1 specification documenting the upstream open-source Bible/Commentary
    REST endpoints consumed by the Multi-Source Scripture Resolution Engine and the
    internal Add-on Ingestion & Cloud Sync service contracts.
servers:
  - url: https://bible.helloao.org/api
    description: Tier 1 — Free Use Bible & Commentary CDN API
  - url: https://bolls.life
    description: Tier 2 — Bolls.life Parallel & Historical Scripture API
  - url: https://bible-api.com
    description: Tier 3 — Classic Scripture Fallback API

paths:
  /available_translations.json:
    get:
      operationId: getHelloAoTranslations
      summary: List all 1,000+ translations across 700+ languages on Free Use Bible API
      servers:
        - url: https://bible.helloao.org/api
      responses:
        '200':
          description: Master catalog of available translations
          content:
            application/json:
              schema:
                type: object
                required: [translations]
                properties:
                  translations:
                    type: array
                    items:
                      $ref: '#/components/schemas/HelloAoTranslationMeta'

  /{translationId}/{bookId}/{chapter}.json:
    get:
      operationId: getHelloAoChapter
      summary: Fetch a complete Bible chapter with headings, verse elements, and footnotes
      servers:
        - url: https://bible.helloao.org/api
      parameters:
        - name: translationId
          in: path
          required: true
          description: Translation identifier (e.g., BSB, eng_kjv, fra_lsg, spa_rv1909, heb_wlc)
          schema:
            type: string
        - name: bookId
          in: path
          required: true
          description: 3-letter USFM book ID (e.g., GEN, EXO, PSA, MAT, JHN, REV)
          schema:
            type: string
        - name: chapter
          in: path
          required: true
          description: 1-based chapter number
          schema:
            type: integer
            minimum: 1
      responses:
        '200':
          description: Structured chapter payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HelloAoChapterResponse'

  /available_commentaries.json:
    get:
      operationId: getHelloAoCommentaries
      summary: List all open-source theological commentaries
      servers:
        - url: https://bible.helloao.org/api
      responses:
        '200':
          description: Available commentary volumes
          content:
            application/json:
              schema:
                type: object
                properties:
                  commentaries:
                    type: array
                    items:
                      type: object
                      properties:
                        id: { type: string, example: "matthew-henry" }
                        name: { type: string, example: "Matthew Henry's Complete Commentary" }
                        englishName: { type: string }
                        language: { type: string, example: "eng" }

  /c/{commentaryId}/{bookId}/{chapter}.json:
    get:
      operationId: getHelloAoCommentaryChapter
      summary: Fetch verse-by-verse commentary for a specific book and chapter
      servers:
        - url: https://bible.helloao.org/api
      parameters:
        - name: commentaryId
          in: path
          required: true
          schema:
            type: string
            example: matthew-henry
        - name: bookId
          in: path
          required: true
          schema:
            type: string
            example: GEN
        - name: chapter
          in: path
          required: true
          schema:
            type: integer
            example: 1
      responses:
        '200':
          description: Structured commentary payload for the chapter
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HelloAoCommentaryResponse'

  /get-text/{translationSlug}/{bookNumber}/{chapter}/:
    get:
      operationId: getBollsChapter
      summary: Tier 2 Fallback — Fetch chapter verses from Bolls.life API
      servers:
        - url: https://bolls.life
      parameters:
        - name: translationSlug
          in: path
          required: true
          description: Bolls translation code (e.g., KJV, YLT, WLC, LXX, TR, RVR1960, LSG)
          schema:
            type: string
        - name: bookNumber
          in: path
          required: true
          description: 1-based canonical book index (1 = Genesis ... 66 = Revelation)
          schema:
            type: integer
            minimum: 1
            maximum: 66
        - name: chapter
          in: path
          required: true
          schema:
            type: integer
            minimum: 1
      responses:
        '200':
          description: Array of verse objects (often containing embedded <S>Strong's</S> tags)
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/BollsVerseItem'

  /{bookPlusChapter}:
    get:
      operationId: getBibleApiChapter
      summary: Tier 3 Fallback — Fetch chapter verses from bible-api.com
      servers:
        - url: https://bible-api.com
      parameters:
        - name: bookPlusChapter
          in: path
          required: true
          description: URL-encoded Book Name + Chapter (e.g., "John+1" or "Genesis+1")
          schema:
            type: string
        - name: translation
          in: query
          required: false
          description: Translation code (kjv, web, almeida, rvr, cherokee, clementine)
          schema:
            type: string
            default: web
      responses:
        '200':
          description: Bible-API chapter payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BibleApiResponse'

components:
  schemas:
    HelloAoTranslationMeta:
      type: object
      required: [id, name, shortName, language, textDirection]
      properties:
        id: { type: string, example: "BSB" }
        name: { type: string, example: "Berean Standard Bible" }
        englishName: { type: string, example: "Berean Standard Bible" }
        shortName: { type: string, example: "BSB" }
        language: { type: string, example: "eng" }
        languageName: { type: string, example: "English" }
        languageEnglishName: { type: string, example: "English" }
        textDirection: { type: string, enum: [ltr, rtl] }
        numberOfBooks: { type: integer, example: 66 }
        totalNumberOfChapters: { type: integer, example: 1189 }
        totalNumberOfVerses: { type: integer, example: 31102 }

    HelloAoChapterResponse:
      type: object
      required: [translation, book, chapter]
      properties:
        translation:
          $ref: '#/components/schemas/HelloAoTranslationMeta'
        book:
          type: object
          properties:
            id: { type: string, example: "GEN" }
            name: { type: string, example: "Genesis" }
            commonName: { type: string, example: "Genesis" }
            numberOfChapters: { type: integer, example: 50 }
        chapter:
          type: object
          required: [number, content]
          properties:
            number: { type: integer, example: 1 }
            content:
              type: array
              description: Heterogeneous AST nodes (heading, verse, line_break, hebrew_subtitle)
              items:
                type: object
                properties:
                  type:
                    type: string
                    enum: [heading, verse, line_break, hebrew_subtitle]
                  number:
                    type: integer
                    description: Present when type == 'verse'
                  content:
                    type: array
                    items:
                      oneOf:
                        - type: string
                        - type: object
                          properties:
                            text: { type: string }
                            wordsOfJesus: { type: boolean }
                            poem: { type: integer }
                            noteId: { type: integer }
            footnotes:
              type: array
              items:
                type: object
                properties:
                  noteId: { type: integer }
                  caller: { type: string }
                  text: { type: string }

    HelloAoCommentaryResponse:
      type: object
      properties:
        commentary:
          type: object
          properties:
            id: { type: string }
            name: { type: string }
        book:
          type: object
          properties:
            id: { type: string }
            name: { type: string }
        chapter:
          type: object
          properties:
            number: { type: integer }
            introduction: { type: string }
            content:
              type: array
              items:
                type: object
                properties:
                  type: { type: string }
                  number: { type: integer }
                  content:
                    type: array
                    items:
                      type: string

    BollsVerseItem:
      type: object
      required: [pk, verse, text]
      properties:
        pk: { type: integer }
        verse: { type: integer }
        text:
          type: string
          description: May include inline Strong's tags such as "In the beginning<S>7225</S> God<S>430</S>"
        comment: { type: string }

    BibleApiResponse:
      type: object
      required: [reference, verses, text]
      properties:
        reference: { type: string, example: "John 1" }
        translation_id: { type: string, example: "kjv" }
        translation_name: { type: string, example: "King James Version" }
        verses:
          type: array
          items:
            type: object
            properties:
              book_id: { type: string }
              book_name: { type: string }
              chapter: { type: integer }
              verse: { type: integer }
              text: { type: string }
```

---

## 3. Normalizer & Embedded Strong's Tag Parser Specification

Upstream APIs deliver different AST representations for verses and Strong's numbers. Our `ScriptureNormalizer` transforms all three formats into our canonical `BibleChapter` interface:

### 3.1 Parsing `bible.helloao.org` Chapter AST
- Iterate through `response.chapter.content`:
  - When `node.type === 'heading'`, buffer `pendingHeading = node.content.join(' ')`.
  - When `node.type === 'verse'`, extract plain strings and object segments (`{ text, wordsOfJesus, noteId }`), attach `pendingHeading` if present, reset `pendingHeading = undefined`, and link any matching `noteId` from `response.chapter.footnotes`.

### 3.2 Parsing `bolls.life` Inline Strong's Tags (`<S>7225</S>`)
Many `bolls.life` texts (such as `KJV`, `NASB`, `WLC`, `TR`) embed Strong's numbers directly inside the verse string using `<S>1234</S>` tags:
- **Input Example:** `"In the beginning<S>7225</S> God<S>430</S> created<S>1254</S>"`
- **Tokenization Regex:** `/([^\s<]+(?:[\s]+[^\s<]+)*?)?(?:<S>(\d+)<\/S>)+/g`
- **Prefix Inference:**
  - If `bookNumber <= 39` (Old Testament), prefix numeric tag with `'H'` (e.g., `<S>7225</S>` -> `'H7225'`).
  - If `bookNumber >= 40` (New Testament), prefix numeric tag with `'G'` (e.g., `<S>3056</S>` -> `'G3056'`).
- **Output:** Populates `BibleVerse.tokens[]` with `InterlinearToken` entries and sets `BibleVerse.text` to the clean tag-stripped text.

---

## 4. Client Service Contracts (`src/services/`)

```typescript
import type {
  BibleChapter,
  BibleLanguage,
  BibleVersion,
  CanonicalBookId,
  CommentaryEntry,
  CommentarySourceId,
  CustomLanguageAddon,
  StrongsEntry,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VersePin,
} from '../types/bible';

/**
 * Contract 1: Multi-Source Scripture & Commentary Resolver
 */
export interface IScriptureService {
  /** Returns all pre-bundled, API-available, and user-installed versions */
  getAvailableVersions(): Promise<{
    languages: BibleLanguage[];
    versions: BibleVersion[];
  }>;

  /** Resolves a chapter via L1 Memory -> IndexedDB -> HelloAO -> Bolls -> Bible-API */
  getChapter(
    versionId: string,
    bookId: CanonicalBookId,
    chapter: number
  ): Promise<BibleChapter>;

  /** Resolves multiple versions in parallel for the 1-4 Column Parallel Engine */
  getParallelChapters(
    versionIds: string[],
    bookId: CanonicalBookId,
    chapter: number
  ): Promise<Record<string, BibleChapter>>;

  /** Full-text keyword or Strong's concordance search across cached & bundled texts */
  searchScripture(
    query: string,
    options?: {
      versionId?: string;
      testament?: 'ALL' | 'OT' | 'NT';
      bookId?: CanonicalBookId;
      limit?: number;
    }
  ): Promise<Array<{
    verseKey: string;
    bookId: CanonicalBookId;
    chapter: number;
    verse: number;
    versionId: string;
    text: string;
    matchedStrongId?: string;
  }>>;

  /** Resolves a Strong's Hebrew (H) or Greek (G) lexicon entry */
  getStrongsEntry(strongsId: string): Promise<StrongsEntry | null>;

  /** Resolves commentary exposition + TSK cross-references for a chapter */
  getCommentary(
    commentaryId: CommentarySourceId,
    bookId: CanonicalBookId,
    chapter: number
  ): Promise<CommentaryEntry>;
}

/**
 * Contract 2: Custom Language & Version Add-on Manager
 */
export interface IAddonManagerService {
  /** Parses, sanitizes, and installs a JSON, USFM, or OSIS XML translation file */
  installAddonFile(
    file: File,
    onProgress?: (percent: number, stage: string) => void
  ): Promise<CustomLanguageAddon>;

  /** Exports an installed add-on or offline-cached version as a portable .elohim.json pack */
  exportVersionPack(versionId: string): Promise<Blob>;

  /** Removes a custom add-on and purges its chapters from IndexedDB */
  uninstallAddon(addonId: string): Promise<void>;

  /** Lists all installed custom add-on packs */
  listInstalledAddons(): Promise<CustomLanguageAddon[]>;
}

/**
 * Contract 3: Local-First Study & Cloud Sync Engine
 */
export interface IStudySyncService {
  /** Bookmarks */
  upsertBookmark(bookmark: Omit<VerseBookmark, 'createdAtMs' | 'updatedAtMs' | 'syncState'>): Promise<VerseBookmark>;
  removeBookmark(id: string): Promise<void>;

  /** Quick-Jump Pins (1-12 slots) */
  upsertPin(pin: Omit<VersePin, 'createdAtMs' | 'updatedAtMs' | 'syncState'>): Promise<VersePin>;
  removePin(id: string): Promise<void>;

  /** Verse Highlights & Underlines */
  upsertHighlight(highlight: Omit<VerseHighlight, 'createdAtMs' | 'updatedAtMs' | 'syncState'>): Promise<VerseHighlight>;
  removeHighlight(verseKey: string): Promise<void>;

  /** Markdown Study Notes */
  upsertNote(note: Omit<VerseNote, 'createdAtMs' | 'updatedAtMs' | 'syncState'>): Promise<VerseNote>;
  removeNote(id: string): Promise<void>;

  /** Triggers an immediate bidirectional delta sync with Cloud Firestore if signed in */
  syncNow(): Promise<{ uploaded: number; downloaded: number; lastSyncedAtMs: number }>;
}
```
