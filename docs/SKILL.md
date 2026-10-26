---
name: bible-parallel-reader-and-24khz-tts-engine
description: Complete production architecture for modern, ad-free parallel Bible web apps with 24kHz Google Neural Voice narration (Charon, Kore, Puck, Aoede, Fenrir), native Asante and Akuapem Twi phonetic speech conditioning, zero-cost IndexedDB audio vault caching, fluid reading defaults, and the Wisdom Bible botanical theme.
---

# Bible Parallel Reader & 24kHz Google Neural Audio Engine

A complete production-grade blueprint for building generational, 100% ad-free parallel Scripture readers that outperform legacy platforms (BibleHub, YouVersion). Combines 1-to-4 column synchronized parallel reading, the **Wisdom Bible** botanical night/paper aesthetic, and a high-fidelity **24kHz Google Neural Audio Engine** with native Asante/Akuapem Twi phonetic conditioning.

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
└────────────────────────────────────────────────────────────────────────┘
```

### The 3 Foundational Principles:
1. **Fluid Reading First (Zero Default Clutter)**:
   - Strong’s Concordance interlinear numbers and open-source commentaries (Matthew Henry, JFB, Geneva, Gill) MUST be **turned OFF by default in Settings** (`showStrongsInline: false`, `showCommentaries: false`).
   - The reader must experience an uninterrupted, fluid reading flow. Exegetical tools are toggled ON only when the student or scholar desires them.
2. **24kHz Google Neural Voices (No Robotic Browser TTS)**:
   - Standard browser `speechSynthesis` completely fails on African languages (mispronouncing Twi vowels `ɛ`, `ɔ` and digraphs `gy`, `tw`, `hy`, `dw`, `ny`) and sounds artificial in English.
   - We utilize Google's **24kHz Studio Neural Audio Modality** (`Charon`, `Kore`, `Puck`, `Aoede`, `Fenrir`), decoding raw 16-bit signed PCM directly into Web Audio API buffers with zero-cost IndexedDB caching.
3. **The Wisdom Bible Botanical Aesthetic**:
   - Primary: Deep botanical forest night (`--paper: #20271f`, `--surface: #171d17`, `--green: #b7c99f`, `--ink: #e3e6d8`).
   - Secondary: Warm editorial paper light (`--paper: #fffefa`, `--surface: #faf9f5`, `--green: #44583a`, `--ink: #303629`).
   - Primary action buttons: `#43583a` with `#f7f5dd` text.

---

## 2. 24kHz Google Neural Audio Engine (`neuralTtsService.ts`)

### Google Prebuilt Voices:
- **`Charon` (Sacred Narrator)**: Deep, solemn, resonant masculine voice designed for biblical recitation.
- **`Kore` (Gentle Warmth)**: Graceful, warm, soothing studio feminine voice.
- **`Puck` (Natural Flow)**: Friendly, conversational, clear reading cadence.
- **`Aoede` (Poetic Majesty)**: Lyrical, dignified presence for Epistles and Psalms.
- **`Fenrir` (Authoritative)**: Commanding broadcast presence.

### Native Asante & Akuapem Twi Phonetic Conditioning:
```typescript
function prepareTtsPrompt(text: string, langCode: string): string {
  const clean = text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
  const lower = (langCode || 'en').toLowerCase();

  if (lower === 'tw' || lower === 'ak' || lower.startsWith('twi')) {
    // Condition the neural model with native Asante Twi phonetics & tonal inflection
    return `In authentic native Asante Twi with reverent Akan cadence and exact phonetic pronunciation: ${clean}`;
  }
  if (lower === 'yo') {
    return `In authentic Yoruba with holy reverence and natural intonation: ${clean}`;
  }
  if (lower === 'ha') {
    return `In authentic Hausa with clear reverence: ${clean}`;
  }
  return `Read with sacred reverence, dignity, and clear pronunciation: ${clean}`;
}
```

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

### Zero-Cost IndexedDB Audio Vault Caching:
```typescript
const DB_NAME = 'elohim_tts_audio_cache_v1';
const STORE_NAME = 'audio_tracks';

export async function getCachedTtsAudio(cacheKey: string): Promise<string | null> {
  const db = await openTtsCacheDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(cacheKey);
    req.onsuccess = () => resolve(req.result?.base64Audio || null);
    req.onerror = () => resolve(null);
  });
}
```

### Predictive Look-Ahead Audio Pre-fetching (0ms Gapless Playback):
To eliminate pauses and "Loading..." delays between verses:
1. While Verse `N` is playing, immediately pre-fetch and decode Verse `N+1`, `N+2`, and `N+3` in parallel into an in-memory `AudioBuffer` Map (`memoryAudioBufferCache`).
2. When Verse `N` finishes, Verse `N+1` is already in RAM. Handover occurs with **0ms latency (instantaneous gapless cutover)** without waiting on the network.
3. An idle background queue pre-caches the entire chapter sequentially into IndexedDB with a visual buffer counter (`⚡ Buffered 9/23 (Fluid 0ms)`).


---

## 3. Bilingual Alternate Reading Engine

When parallel reading (e.g., `KJV (English)` + `Asante Twi (Nkwa Asɛm)`), the audio engine automatically alternates between languages:
1. Synthesize & play **Verse N in English** using `Charon`.
2. On primary audio completion, immediately synthesize & play **Verse N in Asante Twi** using `Kore` or `Charon`.
3. Auto-advance to **Verse N+1** with zero manual intervention.

---

## 4. Multi-Edition Seed Corpus & Routing

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

## 5. Mobile UX Invariant: Vertical Stack Translation Badges

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

## 6. Pre-Flight Verification Checklist

Before shipping any Bible web app build:
- [ ] Verify `showStrongsInline: false` and `showCommentaries: false` in default preferences.
- [ ] Confirm `AudioBibleBar` is centered with `max-width: 1508px` and has a working `×` close button.
- [ ] Test 24kHz Google Neural Audio on both English and Twi scripture.
- [ ] Verify that footnoted verses have a trailing space (`[1] Jesus`, never `[1]Jesus`).
- [ ] Confirm language strip pills highlight whenever any translation in that language is active.
- [ ] Run `npx tsc --noEmit && npm run build` and ensure zero errors.
- [ ] Deploy to dedicated Firebase Hosting target: `firebase deploy --only hosting:[site]`.
