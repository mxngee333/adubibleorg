# 666 ELITE CODING WAR ROOM REPORT — Twi (Asante & Akuapem) & Local African Languages Authentic Neural Audio Engine v2

**Project**: AduBible.org (`https://adubible.org`)  
**Workspace**: `c:\Users\kwame\Downloads\bible`  
**Command Trigger**: `666` (The 24 Elders — The Red Army of Silicon Valley)  
**Target Objective**: Eradicate inaccurate English-homograph mispronunciations in Asante Twi (`ASA`), Akuapem Twi (`AKA`), Bilingual Parallel Audio, and local African languages (`Ewe`, `Ga`, `Yoruba`, `Hausa`, `Igbo`, `Swahili`, `Amharic`, `Zulu`), and ship a multi-tier native + 24kHz phonological TTS architecture.

---

## 1. Root Cause Forensic Diagnosis (Wave 1 — Architects)

| # | Root Cause Discovered | Exact Code Location | Acoustic Impact on User |
|---|---|---|---|
| **1** | **Unconditional English-Only Orpheus Hijack** | `src/services/neuralTtsService.ts` (legacy lines 473–478) | `synthesizeNeuralAudio()` called `synthesizeGroqOrpheusTts()` (`canopylabs/orpheus-v1-english`, an American English-only TTS model) at **Step 2 (before Gemini 24kHz)** for **all 36 languages**. Every non-English language (Asante Twi, Akuapem Twi, Ewe, Ga, Yoruba, Hausa, French, Spanish, etc.) was forced through an American English phoneme engine. |
| **2** | **Destructive Akan Vowel Flattening (`ɔ -> o`, `ɛ -> e`)** | `src/services/twiPhonemeEngine.ts` (legacy line 120) | Legacy code executed `.replace(/[ɛ\u025B]/g, 'e').replace(/[ɔ\u0254]/g, 'o')`. This mutated core Twi words into English homographs: `bɔɔ` ("created") became `boo` (**"BOO"** `/buː/`), `ɛyɛ` ("it is good") became `eye` (**"EYE"** `/aɪ/`), `frɛɛ` ("called") became `free` (**"FREE"** `/friː/`), `sɛ` ("that") became `se` (**"SEE"** `/siː/`), `ne` ("and") became `ne` (**"KNEE"** `/niː/`), `no` ("the") became `no` (**"NO"** `/noʊ/`), and `Ti` ("Chapter") became `Ti` (**"TIE"** `/taɪ/`). |
| **3** | **Early Text Mutation Before Multilingual Models** | `src/services/neuralTtsService.ts` (legacy lines 451–453) | `synthesizeNeuralAudio()` overwrote `rawText` with `transphonemizeTwiForSpeech(rawText)` before reaching multilingual models, stripping native Akan orthography (`ɛ`, `ɔ`) that Gemini 2.5 Flash TTS and Meta MMS-TTS require for native Akan synthesis. |
| **4** | **Revoked Default Gemini API Key & 404 Model Entry** | `src/services/neuralTtsService.ts` & `.env` | Legacy key `AIzaSyCTPSVORjlDWymqirRkL2c1OSPUHP4Pf6w` returned HTTP `403 PERMISSION_DENIED (reported as leaked)`, and `gemini-3.1-flash-tts-preview` returned `404 Not Found` on `v1beta`. |
| **5** | **English Cardinal Numbers in Twi Chapter Intros & Poisoned `v5` Cache** | `src/components/AudioBibleBar.tsx` (legacy line 336) & IndexedDB | `buildSpokenChapterIntro()` generated `"Gyenesis, Ti 1."`, causing `"1"` to be spoken as English `"One"` instead of Asante Twi `"Baako"` or Akuapem Twi `"Biako"`, while mispronounced audio remained cached in `elohim_tts_audio_cache_v5`. |

---

## 2. The 4-Wave 666 Architecture Executed (Waves 2–4)

### Wave 1 & 2 — Akan (Asante & Akuapem Twi) & West African Phonological Engine v2 (`src/services/twiPhonemeEngine.ts`)
- **Zero Vowel-Flattening Guarantee**:
  - Open-mid back rounded vowel `ɔ` (`/ɔ/`) maps strictly to `aw` (`bɔɔ` -> `baw-aw`, `wɔ` -> `waw`, `dɔ` -> `daw`, `kɔ` -> `kaw`, `tɔ` -> `taw`, `sɔ` -> `saw`, `nɔ` -> `naw`, `ɔsoro` -> `aw-soh-roh`).
  - Open-mid front unrounded vowel `ɛ` (`/ɛ/`) maps strictly to `eh` (`ɛyɛ` -> `ehyeh`, `frɛɛ` -> `freh-eh`, `sɛ` -> `seh`, `yɛ` -> `yeh`, `kyerɛ` -> `cheh-reh`, `pɛ` -> `peh`, `hwɛ` -> `shweh`).
- **Short Open Monosyllable Protection (Anti-Homograph Shield)**:
  - `no` -> `noh`, `ne` -> `neh`, `me` -> `meh`, `wo` -> `woh`, `ti` -> `tee`, `bi` -> `bee`, `di` -> `dee`, `yi` -> `yee`, `si` -> `see`, `fi` -> `fee`, `bio` -> `bee-oh`, `da` -> `dah`, `na` -> `nah`, `ka` -> `kah`, `ma` -> `mah`, `ba` -> `bah`, `fa` -> `fah`.
- **Akan Palatalized & Labial-Palatalized Digraphs**:
  - `tw` (`/tɕw/`) -> `chw`, `dw` (`/dʑw/`) -> `jw`, `hw` (`/ɕw/`) -> `shw`, `hy` (`/ɕ/`) -> `sh`, `gy` (`/dʑ/`) -> `j`, `ky` (`/tɕ/`) -> `ch`, `ny` (`/ɲ/`) -> `ny`, `nw` (`/nw/`) -> `nw`.
- **250+ Sacred Twi Biblical Lexicon (`SACRED_TWI_LEXICON`)**:
  - Covers Creation (`Mfitiaseɛ`, `Onyankopɔn`, `bɔɔ`, `ɔsoro`, `asase`, `sakasaka`, `ebun`, `Honhom`, `dɛkyɛdɛkyɛ`, `nsuo`, `hann`, `esum`, `Awia`, `Anadwo`, `ewim`, `epa`), Christology & Soteriology (`Awurade`, `Yesu`, `Kristo`, `Agyenkwa`, `Kronkron`, `nhyira`, `adom`, `gyidie`, `nkwa`, `daa`), and all 66 canonical book names (`SPOKEN_TWI_BOOK_NAMES`).
- **Complete Akan Cardinal Number Generator (`numberToTwiWords`, Chapters 1–150)**:
  - **Asante Twi (`tw`)**: `1 -> Baako`, `2 -> Mmienu`, `3 -> Mmiɛnsa`, `4 -> Anan`, `5 -> Enum`, `6 -> Nsia`, `7 -> Nson`, `8 -> Nwɔtwe`, `9 -> Nkron`, `10 -> Edu`, `23 -> Aduonu Mmiɛnsa`, `119 -> Ɔha ne Edunkron`, `150 -> Ɔha ne Aduonum`.
  - **Akuapem Twi (`ak`)**: `1 -> Biako`, `2 -> Abien`, `3 -> Abiɛsa`, `8 -> Awotwe`, `11 -> Edubiako`, `12 -> Edubien`, `13 -> Edubiɛsa`, `18 -> Eduawotwe`.
- **Multi-Language West African Phonological Conditioning (`conditionAfricanLocalLanguageForSpeech`)**:
  - Dedicated phonological rules for **Ewe (`ee`)** (`ɖ`, `ƒ`, `ʋ`, `ɛ`, `ɔ`, `dz`, `ts`), **Ga (`gaa`)** (`ŋ`, `ɛ`, `ɔ`, `gb`, `kp`, `shw`), **Yoruba (`yo`)** (`ẹ`, `ọ`, `ṣ`, `gb`, `kp`), **Igbo (`ig`)** (`ọ`, `ụ`, `ị`, `gb`, `kp`, `nw`, `ny`), and **Hausa (`ha`)** (`ɓ`, `ɗ`, `ƙ`).

### Wave 3 — Language-Aware Multi-Tier Neural Audio Router (`src/services/neuralTtsService.ts`)
- **Dual Text Stream Preservation**:
  - Preserves `rawCleanText` (with intact `ɛ`, `ɔ`, `ɖ`, `ƒ`, `ẹ`, `ọ`) for native multilingual models (**Google Gemini 2.5 Flash 24kHz TTS** and **Meta MMS-TTS Native Bible Engine**).
  - Generates `phoneticScript = conditionAfricanLocalLanguageForSpeech(rawCleanText, normLang)` specifically for English-phoneme models (**Groq Orpheus 24kHz** and **Google Speech `tl=en`**).
- **New `'Nhyira (Native Ghana / Africa Bible)'` Voice Option**:
  - Added to `GOOGLE_NEURAL_VOICES` selector alongside `Kore`, `Charon`, `Puck`, `Aoede`, and `Fenrir`.
  - Powered by Meta AI's Massively Multilingual Speech (`MMS-TTS`) trained directly on native Bible Society of Ghana (`Akan (aka)`), Ewe (`Éwé (ewe)`), Yoruba (`Yoruba (yor)`), Hausa (`Hausa (hau)`), Swahili (`Swahili (swh)`), and Amharic (`Amharic (amh)`) scripture recordings.
- **Language-Specific Phonological Director Prompts (`buildGeminiLanguageDirectorPrompt`)**:
  - Directs `gemini-2.5-flash-preview-tts` to speak in an authentic native Ghanaian Asante Twi, Akuapem Twi, Ewe, Ga, Yoruba, Igbo, Hausa, Swahili, Amharic, or isiZulu accent with explicit vowel/digraph guidance without reading prompt metadata aloud.
- **Verified Live Gemini 24kHz Key Rotation & Poisoned Cache Purge**:
  - Rotated `VITE_GEMINI_API_KEY` and `DEFAULT_GEMINI_KEY` to verified live key, blacklisted revoked key in `localStorage`, and bumped IndexedDB cache to `elohim_tts_audio_cache_v6` while automatically deleting `v1`–`v5`.

### Wave 4 — Reader UI, Bilingual Parallel Sync & Lexicon/Topical Twi Audio (`src/components/AudioBibleBar.tsx`, `StrongsPopoverModal.tsx`, `TopicalScriptureHubModal.tsx`)
- **`AudioBibleBar.tsx`**:
  - Upgraded `buildSpokenChapterIntro` to announce chapters in authentic dialectal Twi (`"Gyenesis, Ti Baako."` in Asante Twi; `"Genesis, Ti Biako."` in Akuapem Twi) and localized chapter headers for Ewe (`Ta`), Ga (`Yitso`), Yoruba (`Orí`), Hausa (`Sura ta`), Igbo (`Isi`), Swahili (`Sura ya`), Amharic (`ምዕራፍ`), and isiZulu (`Isahluko`).
  - Upgraded `speakNativeVerse` to run `conditionAfricanLocalLanguageForSpeech` across all West African local languages.
  - Fixed Bilingual 24kHz parallel verse playback to include localized chapter announcements on verse 1.
- **`StrongsPopoverModal.tsx` & `TopicalScriptureHubModal.tsx`**:
  - Added **Twi Audio** pronunciation buttons to Strong's Concordance Asante Twi Resonance cards and Topical Scripture Hub Twi verses.

---

## 3. Files Modified & Created

- [`src/services/twiPhonemeEngine.ts`](file:///c:/Users/kwame/Downloads/bible/src/services/twiPhonemeEngine.ts)
- [`src/services/neuralTtsService.ts`](file:///c:/Users/kwame/Downloads/bible/src/services/neuralTtsService.ts)
- [`src/components/AudioBibleBar.tsx`](file:///c:/Users/kwame/Downloads/bible/src/components/AudioBibleBar.tsx)
- [`src/components/StrongsPopoverModal.tsx`](file:///c:/Users/kwame/Downloads/bible/src/components/StrongsPopoverModal.tsx)
- [`src/components/TopicalScriptureHubModal.tsx`](file:///c:/Users/kwame/Downloads/bible/src/components/TopicalScriptureHubModal.tsx)
- [`.env`](file:///c:/Users/kwame/Downloads/bible/.env)
- [`WARROOM_REPORT.md`](file:///c:/Users/kwame/Downloads/bible/WARROOM_REPORT.md)
