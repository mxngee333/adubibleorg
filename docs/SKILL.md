---
name: bible-parallel-reader-and-24khz-tts-engine
description: Complete production architecture for modern, ad-free parallel Bible web apps with 24kHz Google Neural Voice narration (Charon, Kore, Puck, Aoede, Fenrir), native Asante and Akuapem Twi phonetic speech conditioning, predictive look-ahead audio pre-fetching for 0ms gapless playback, zero-cost IndexedDB audio vault caching, fluid reading defaults, and the Wisdom Bible botanical theme.
---

# Bible Parallel Reader & 24kHz Google Neural Audio Engine

A complete, battle-tested production blueprint for building generational, 100% ad-free parallel Scripture readers that outperform legacy platforms (BibleHub, YouVersion). Combines 1-to-4 column synchronized parallel reading, the **Wisdom Bible** botanical night/paper aesthetic, and a high-fidelity **24kHz Google Neural Audio Engine** with native Asante/Akuapem Twi phonetic conditioning and **Predictive Look-Ahead Gapless Playback**.

---

## 1. Core Architecture & Design Philosophy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WISDOM BIBLE MASTHEAD                           │
│  ✦ Wisdom Bible    ·    THE WORD, SIDE BY SIDE    ·   Vault | Audio    │
├────────────────────────────────────────────────────────────────────────┤
│                     PASSAGE & READING TOOLBAR                          │
│  [Book: Ephesians] [Chapter: 1] [← →] [T- T+] [Light/Night] [⚙️ Settings]│
├────────────────────────────────────────────────────────────────────────┤
│                       CHAPTER HERO & PRESETS                           │
│  NEW TESTAMENT · Ephesians 1 · Parallel reading                        │
│  COMPARE: [KJV + Twi] [NKJV + Twi] [Akuapem + Asante] [English]        │
├──────────────────────────────────┬─────────────────────────────────────┤
│     COLUMN 1: ENGLISH · KJV      │     COLUMN 2: ASANTE TWI · ASA      │
│  Paul, an apostle of Jesus       │  Krataa yi firi me Paulo a          │
│  Christ by the will of God...    │  Onyankopɔn firi ne pɛ mu ayɛ me... │
├──────────────────────────────────┴─────────────────────────────────────┤
│                   STICKY 24kHz NEURAL AUDIO DOCK                       │
│  ♫ Audio Scripture · Eph 1:1 · Google 24kHz (Charon) ⇄ Bilingual       │
│  [⏮] [▶ Listen 24kHz] [⏹] [⏭] [Voice: Charon ▼] [Speed: 1.0x] [×]      │
│  ⚡ Buffered 12/23 (Fluid 0ms Gapless)                                 │
└────────────────────────────────────────────────────────────────────────┘
```

### The 4 Foundational Invariants:
1. **Fluid Reading First (Zero Default Clutter)**:
   - Strong’s Concordance interlinear numbers and open-source commentaries (Matthew Henry, JFB, Geneva, Gill) MUST be **turned OFF by default in Settings** (`showStrongsInline: false`, `showCommentaries: false`).
   - The reader must experience an uninterrupted, fluid reading flow. Exegetical tools are toggled ON only when the student or scholar desires them.
2. **24kHz Google Neural Voices (No Robotic Browser TTS)**:
   - Standard browser `speechSynthesis` completely fails on African languages (mispronouncing Twi vowels `ɛ`, `ɔ` and digraphs `gy`, `tw`, `hy`, `dw`, `ny`) and sounds artificial in English.
   - We utilize Google's **24kHz Studio Neural Audio Modality** (`Charon`, `Kore`, `Puck`, `Aoede`, `Fenrir`), decoding raw 16-bit signed PCM directly into Web Audio API buffers with zero-cost IndexedDB caching.
3. **Predictive Look-Ahead Pre-fetching (0ms Gapless Playback)**:
   - To eliminate the jarring 1–2 second network pause between verses, the audio pipeline pre-fetches and decodes Verse `N+1`, `N+2`, and `N+3` in parallel into an in-memory `AudioBuffer` Map (`memoryAudioBufferCache`) while Verse `N` is actively playing.
   - Handover between verses occurs synchronously with **0ms latency** without waiting on network roundtrips.
4. **The Wisdom Bible Botanical Aesthetic**:
   - Primary: Deep botanical forest night (`--paper: #20271f`, `--surface: #171d17`, `--green: #b7c99f`, `--ink: #e3e6d8`).
   - Secondary: Warm editorial paper light (`--paper: #fffefa`, `--surface: #faf9f5`, `--green: #44583a`, `--ink: #303629`).
   - Primary action buttons: `#43583a` with `#f7f5dd` text.

---

## 2. 24kHz Google Neural Audio Engine (`neuralTtsService.ts`)

### Google Prebuilt Studio Voices:
- **`Charon` (Sacred Narrator)** *(Default)*: Deep, solemn, resonant masculine voice tailored for biblical recitation.
- **`Kore` (Gentle Warmth)**: Graceful, warm, soothing studio feminine voice (featured in Modelissa).
- **`Puck` (Natural Flow)**: Friendly, conversational, clear reading cadence.
- **`Aoede` (Poetic Majesty)**: Lyrical, dignified presence for Epistles, Psalms, and Wisdom literature.
- **`Fenrir` (Authoritative)**: Commanding broadcast presence for apostolic readings.

### Native Asante & Akuapem Twi Phonetic Speech Conditioning:
```typescript
/**
 * Clean verse text strictly for speech synthesis.
 * Strips footnote markers [1], [2], parentheses, and special punctuation,
 * returning ONLY the pure scripture text so speech starts IMMEDIATELY
 * from the very first word with ZERO preamble or instruction reading!
 */
export function cleanVerseForSpeech(text: string): string {
  return text
    .replace(/\[\d+\]/g, '') // remove footnote tags [1], [2]
    .replace(/\(\d+:\d+\)/g, '')
    .replace(/[«»"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```
> [!IMPORTANT]
> **Preamble Eradication Rule**: Never embed instructional preambles like *"Read with sacred reverence:"* or *"In authentic native Asante Twi:"* into the synthesized text string, because neural TTS models will speak the instruction out loud before the verse. Only pass the pure, cleaned scripture text.

### Anti-Glitch GainNode Pipeline & Robotic Fallback Ban:
- **Zero Digital Pops/Clicks**: Route all Web Audio API playback through a `GainNode` with a 35ms micro-fade (`gain.linearRampToValueAtTime`) on stop, skip, or cutover. Never call `source.stop()` abruptly.
- **Permanent Ban on Browser `window.speechSynthesis`**: Never fall back to browser speech synthesis when a network hiccup occurs. It sounds robotic, unnatural, and garbles African languages. Instead, implement exponential neural retries and keep the player in a clean buffering state until the genuine 24kHz Google neural voice is ready.
- **Character Voice Consistency**: Maintain the user's selected voice (`Charon`, `Kore`, `Puck`, `Aoede`, `Fenrir`) consistently across every single verse, including parallel verses in Bilingual Mode. Never flip voices unexpectedly.


### Raw 24kHz PCM to Web Audio API Decoding:
Google Gemini Audio returns base64-encoded raw 16-bit signed linear PCM at 24,000 Hz. Decode it directly to `AudioBuffer`:
```typescript
export function decodePcm24kToAudioBuffer(
  audioContext: AudioContext,
  base64Data: string
): AudioBuffer {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit signed PCM @ 24,000 Hz -> Float32Array [-1.0, 1.0]
  const pcmData = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    float32Data[i] = pcmData[i] / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
  audioBuffer.getChannelData(0).set(float32Data);
  return audioBuffer;
}
```

### Dual-Tier RAM + IndexedDB Zero-Cost Audio Vault:
```typescript
const DB_NAME = 'elohim_tts_audio_cache_v1';
const STORE_NAME = 'audio_tracks';
const memoryAudioBufferCache = new Map<string, AudioBuffer>();

export async function getOrPreloadAudioBuffer(
  audioContext: AudioContext,
  text: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Charon'
): Promise<AudioBuffer> {
  const promptText = prepareTtsPrompt(text, langCode);
  const memKey = `${langCode}:${voiceName}:${promptText}`;

  // 1. Instant 0ms RAM Hit
  if (memoryAudioBufferCache.has(memKey)) {
    return memoryAudioBufferCache.get(memKey)!;
  }

  // 2. Fetch base64 (from IndexedDB or network)
  const base64Audio = await synthesizeNeuralAudio(text, langCode, voiceName);
  const buffer = decodePcm24kToAudioBuffer(audioContext, base64Audio);
  memoryAudioBufferCache.set(memKey, buffer);
  return buffer;
}
```

---

## 3. Predictive Look-Ahead Audio Pipeline (`AudioBibleBar.tsx`)

### The Gapless Pre-fetch Calculus:
```typescript
// Background Look-Ahead Pre-fetcher for Next Verses (N+1, N+2, N+3)
const prefetchAhead = useCallback(
  async (fromIndex: number, depth = 3) => {
    try {
      const ctx = getOrCreateAudioContext();
      for (let i = fromIndex + 1; i <= Math.min(fromIndex + depth, verses.length - 1); i++) {
        const v = verses[i];
        if (v && !isAudioBufferPreloaded(v.text, langCode, selectedVoice)) {
          getOrPreloadAudioBuffer(ctx, v.text, langCode, selectedVoice)
            .then(() => updateBufferedCount())
            .catch(() => {});
        }

        // In bilingual mode, also preload matching parallel verse ahead of time
        if (bilingualMode && parallelVerses && parallelVerses[i]) {
          const pV = parallelVerses[i];
          const pLang = parallelLangCode || 'tw';
          const pVoice = selectedVoice === 'Charon' ? 'Kore' : 'Charon';
          if (!isAudioBufferPreloaded(pV.text, pLang, pVoice)) {
            getOrPreloadAudioBuffer(ctx, pV.text, pLang, pVoice).catch(() => {});
          }
        }
      }
    } catch {}
  },
  [verses, langCode, selectedVoice, bilingualMode, parallelVerses, parallelLangCode]
);
```

### Gapless Playback Handover:
When verse `index` ends:
1. Grabs the already-decoded buffer for `index + 1` from `memoryAudioBufferCache`.
2. Connects to `AudioContext.destination` and calls `source.start()`.
3. Handover completes with **0ms latency (instantaneous gapless cutover)**!
4. Triggers background prefetch for `index + 3` and `index + 4`.

---

## 4. Bilingual Alternate Reading Engine

When parallel reading (e.g., `KJV (English)` + `Asante Twi (Nkwa Asɛm)`), the audio engine automatically alternates between languages:
1. Recites **Verse N in English** using `Charon`.
2. On primary audio completion, immediately recites **Verse N in Asante Twi** using `Kore` or `Charon`.
3. Auto-advances to **Verse N+1 in English**, then **Verse N+1 in Asante Twi**, continuously.

---

## 5. Multi-Edition Seed Corpus & Routing

### Offline Seed Directory (`public/seed/*.json`):
Pre-bundle 28 high-priority language translations for 0ms initial load:
- English: `BSB.json`, `eng_kjv.json`, `ENGWEBP.json`, `eng_asv.json`
- Ghana/Twi: `twi_asa.json` (Biblica® Open Asante Twi), `twi_aka.json` (Akuapem Twi)
- West Africa: `hau_bib.json` (Hausa), `yor_bib.json` (Yoruba)
- East Africa: `swh_onmm.json` (Swahili)
- World: `fra_lsg.json`, `spa_r09.json`, `deu_l12.json`, `arb_vdv.json`, `rus_syn.json`, `HINIRV.json`, `cmn_cu1.json`

### BibleHub Clean URL Structure:
- Standard: `/:version/:book/:chapter/` (e.g. `/kjv/ephesians/1/` or `/twi/ephesians/1/`)
- Multi-column query sync: `?versions=kjv,twi,bsb`
- Preserves clean URLs with `window.history.replaceState` without triggering full page reloads.

---

## 6. Mobile UX Invariant: Vertical Stack Translation Badges

On mobile devices (`<= 900px`), parallel columns stack into single vertical rows. To ensure the reader never loses context of which translation they are reading:
```css
.mobile-cell-badge {
  display: none;
  margin-bottom: 6px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green);
  font-weight: 600;
}

@media (max-width: 900px) {
  .mobile-cell-badge {
    display: inline-block;
  }
}
```

---

## 7. Footnote Superscript Formatting Invariant

When rendering verse pieces with footnote callers:
```tsx
if (typeof piece.noteId === 'number') {
  const num = piece.noteId + 1;
  return (
    <React.Fragment key={idx}>
      <sup>
        <a href={`#fn-${versionId}-${num}`}>[{num}]</a>
      </sup>{' '}
    </React.Fragment>
  );
}
```
**CRITICAL**: Always ensure a trailing space (` `) follows the `<sup>` tag so words are never glued to the footnote bracket (e.g. `Christ [1] Jesus`, never `Christ [1]Jesus`).

---

## 9. Royal Purple Palette & Elegance Architecture

Biblical purple represents divine royalty, prayer, praise, and sacred majesty (*Argaman* אַרְגָּמָן in Exodus 28:5; *Porphyra* πορφύρα in John 19:2, Revelation 19:16). The reader offers two royal purple palettes engineered for high aesthetic luxury and long reading sessions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BIBLICAL ROYAL PURPLE PALETTES                       │
├────────────────────────────────────┬───────────────────────────────────┤
│   1. ROYAL TYRIAN VELVET (DARK)    │   2. SACRED LILAC PARCHMENT (LT)  │
│                                    │                                   │
│  Base Canvas:  #160d24 (Velvet)    │  Base Canvas:  #fdfcfe (Lilac)    │
│  Surface:      #10081a (Aubergine) │  Surface:      #f5f0fa (Lavender) │
│  Ink Text:     #f5f0fa (Silk)      │  Ink Text:     #241432 (Aubergine)│
│  Subtle:       #a896c2 (Amethyst)  │  Subtle:       #6b567e (Plum)     │
│  Line Rule:    rgba(192,132,252,.2)│  Line Rule:    #e2d5ec (Heather)  │
│  Accent:       #c084fc (Luminous)  │  Accent:       #7e22ce (Violet)   │
│  Action CTA:   #9333ea gradient    │  Action CTA:   #7e22ce gradient   │
└────────────────────────────────────┴───────────────────────────────────┘
```

### CSS Implementation Pattern:
```css
.bible-app.theme-royal-purple {
  --paper: #160d24;
  --surface: #10081a;
  --ink: #f5f0fa;
  --subtle: #a896c2;
  --line: rgba(192, 132, 252, 0.22);
  --green: #c084fc;
  --soft: #221438;
  color-scheme: dark;
}

.bible-app.theme-lilac-light {
  --paper: #fdfcfe;
  --surface: #f5f0fa;
  --ink: #241432;
  --subtle: #6b567e;
  --line: #e2d5ec;
  --green: #7e22ce;
  --soft: #ede4f7;
  color-scheme: light;
}
```

---

## 10. Pre-Flight Verification Checklist

Before shipping any Bible web app build:
- [ ] Verify `showStrongsInline: false` and `showCommentaries: false` in default preferences.
- [ ] Confirm default reading theme is `royal-purple` or user's saved choice.
- [ ] Confirm `AudioBibleBar` is centered with `max-width: 1508px` and has a working `×` close button.
- [ ] Test 24kHz Google Neural Audio on both English and Twi scripture.
- [ ] Verify look-ahead pre-fetching buffers verses ahead (`⚡ Buffered N/Total`).
- [ ] Verify that footnoted verses have a trailing space (`[1] Jesus`, never `[1]Jesus`).
- [ ] Confirm language strip pills highlight whenever any translation in that language is active.
- [ ] Run `npx tsc --noEmit && npm run build` and ensure zero errors.
- [ ] Deploy to dedicated Firebase Hosting target: `firebase deploy --only hosting:[site]`.
