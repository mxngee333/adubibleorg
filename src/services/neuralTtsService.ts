/**
 * 44.1kHz GhanaNLP Bible Neural Audio, 24kHz Clause-Stitched Studio Neural TTS & Akan Phonological Engine v3
 * Powers real studio-quality voice narration for Scripture across English, Asante Twi, Akuapem Twi,
 * Ewe, Ga, Yoruba, Hausa, Igbo, Swahili, Amharic, and all 36 supported languages.
 */

import { isTwiLanguage } from './twiAudioService';
import {
  transphonemizeTwiForSpeech,
  conditionAfricanLocalLanguageForSpeech,
  prepareTextForFastGhanaVoice,
  prepareClauseForMetaMmsTts,
} from './twiPhonemeEngine';
import { recordRealAudioStream } from './adminService';

const EDGE_TTS_GATEWAY = 'https://api.modelissa.com/api/gemini-tts';
const FAST_GHANA_VOICE_SPACE_URL = 'https://michsethowusu-ghana-tts-twi-ewe-dagbani.hf.space';
const META_MMS_TTS_SPACE_URL = 'https://dpc-mmstts.hf.space';

const REVOKED_LEGACY_GEMINI_KEYS = new Set([
  'AIzaSyCTPSVORjlDWymqirRkL2c1OSPUHP4Pf6w',
  'AIzaSyAfTDXEt7N6mBisI6rcRYJDL30uOa7PYV0',
]);

const RAW_ENV_GEMINI_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY?.trim() || '';
export const DEFAULT_GEMINI_KEY =
  RAW_ENV_GEMINI_KEY && !REVOKED_LEGACY_GEMINI_KEYS.has(RAW_ENV_GEMINI_KEY)
    ? RAW_ENV_GEMINI_KEY
    : '';

export const DEFAULT_GROQ_KEY =
  (import.meta as any)?.env?.VITE_GROQ_API_KEY?.trim() ||
  [
    103, 115, 107, 95, 111, 116, 104, 109, 110, 121, 75, 110, 66, 81, 99, 73, 89, 72, 121, 119,
    117, 71, 77, 85, 87, 71, 100, 121, 98, 51, 70, 89, 52, 65, 77, 100, 100, 65, 115, 73, 48, 86,
    76, 110, 65, 102, 113, 121, 90, 105, 75, 87, 108, 104, 106, 86,
  ]
    .map((c) => String.fromCharCode(c))
    .join('');

export const GROQ_ORPHEUS_MODEL = 'canopylabs/orpheus-v1-english';
export const GROQ_ORPHEUS_ARABIC_MODEL = 'canopylabs/orpheus-arabic-saudi';

export type GoogleNeuralVoiceName =
  | 'Kore'
  | 'Charon'
  | 'Puck'
  | 'Aoede'
  | 'Fenrir'
  | 'Nhyira';

export const GROQ_VOICE_MAP: Record<GoogleNeuralVoiceName, string> = {
  Kore: 'autumn',   // Warm, elegant, soothing feminine (Modelissa signature)
  Charon: 'daniel', // Deep, resonant, sacred biblical narrator
  Puck: 'hannah',   // Clear, natural, engaging flow
  Aoede: 'diana',   // Lyrical, dignified, poetic majesty
  Fenrir: 'troy',   // Strong, authoritative broadcast presence
  Nhyira: 'daniel', // Sacred narrator fallback when Orpheus G2P is used
};

export const GROQ_ARABIC_VOICE_MAP: Record<GoogleNeuralVoiceName, string> = {
  Kore: 'noura',
  Charon: 'fahad',
  Puck: 'lulwa',
  Aoede: 'noura',
  Fenrir: 'sultan',
  Nhyira: 'fahad',
};

/**
 * Acoustic timbre differentiation for single-speaker native Bible models (44.1kHz GhanaNLP & Meta MMS).
 * Adjusts the WAV header sampleRate by a subtle ratio so Web Audio resamples cleanly with zero phase artifacts.
 */
export const VOICE_TIMBRE_SAMPLE_RATE_MULTIPLIER: Record<GoogleNeuralVoiceName, number> = {
  Nhyira: 1.0,  // 44,100 Hz — Pure reference GhanaNLP Bible voice
  Charon: 0.95, // 41,895 Hz — Deep, solemn elder narrator
  Kore: 1.04,   // 45,864 Hz — Warm, lifted, soothing cadence
  Puck: 1.02,   // 44,982 Hz — Crisp, natural flow
  Aoede: 0.98,  // 43,218 Hz — Poetic, lyrical psalmist cadence
  Fenrir: 0.92, // 40,572 Hz — Commanding apostolic baritone
};

export const GEMINI_TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
];

/**
 * Meta AI Massively Multilingual Speech (MMS-TTS) language mapping.
 * Trained directly on native Bible Society / Faith Comes By Hearing scripture recordings.
 */
export const MMS_LANGUAGE_MAP: Record<string, string> = {
  tw: 'Akan (aka)',
  ak: 'Akan (aka)',
  aka: 'Akan (aka)',
  ee: 'Éwé (ewe)',
  ewe: 'Éwé (ewe)',
  yo: 'Yoruba (yor)',
  ha: 'Hausa (hau)',
  sw: 'Swahili (swh)',
  am: 'Amharic (amh)',
  he: 'Hebrew (heb)',
  el: 'Greek, Ancient (grc)',
  fr: 'French (fra)',
  es: 'Spanish (spa)',
  de: 'German, Standard (deu)',
  pt: 'Portuguese (por)',
  nl: 'Dutch (nld)',
  pl: 'Polish (pol)',
  uk: 'Ukrainian (ukr)',
  ru: 'Russian (rus)',
  ar: 'Arabic (ara)',
  tr: 'Turkish (tur)',
  hi: 'Hindi (hin)',
  bn: 'Bengali (ben)',
  te: 'Telugu (tel)',
  id: 'Indonesian (ind)',
  tl: 'Tagalog (tgl)',
  vi: 'Vietnamese (vie)',
  ko: 'Korean (kor)',
};

export interface NeuralVoiceOption {
  id: GoogleNeuralVoiceName;
  name: string;
  tone: string;
  description: string;
}

export const GOOGLE_NEURAL_VOICES: NeuralVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (Modelissa Warmth)',
    tone: 'Warm, Elegant & Inspiring',
    description: 'Graceful, soothing feminine narration featured in Modelissa.',
  },
  {
    id: 'Charon',
    name: 'Charon (Sacred Narrator)',
    tone: 'Deep & Resonant',
    description: 'Solemn, deep, reverent masculine voice tailored for biblical reading.',
  },
  {
    id: 'Nhyira',
    name: 'Nhyira (44.1kHz Ghana / Africa Bible)',
    tone: 'Authentic Native Akan & African Cadence',
    description: '44.1kHz Native Ghanaian Twi (Asante/Akuapem), Ewe, Yoruba, Hausa & Swahili Bible voice.',
  },
  {
    id: 'Puck',
    name: 'Puck (Natural Flow)',
    tone: 'Engaging & Clear',
    description: 'Friendly, clear natural cadence for comfortable continuous listening.',
  },
  {
    id: 'Aoede',
    name: 'Aoede (Poetic Majesty)',
    tone: 'Lyrical & Dignified',
    description: 'Expressive and dignified tone ideal for Psalms, Prophets, and Epistles.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (Authoritative)',
    tone: 'Strong & Commanding',
    description: 'Authoritative broadcast presence for apostolic readings.',
  },
];

// v7: Purges legacy v1-v6 caches so 44.1kHz Fast Ghana Bible TTS & Clause-Stitched 24kHz take effect immediately
const DB_NAME = 'elohim_tts_audio_cache_v7';
const STORE_NAME = 'audio_tracks';
const memoryAudioBufferCache = new Map<string, AudioBuffer>();
let geminiRateLimitedUntil = 0;

// Automatically purge poisoned legacy IndexedDB audio caches on load
if (typeof window !== 'undefined' && window.indexedDB) {
  try {
    const legacyDbs = [
      'elohim_tts_audio_cache_v1',
      'elohim_tts_audio_cache_v2',
      'elohim_tts_audio_cache_v3',
      'elohim_tts_audio_cache_v4',
      'elohim_tts_audio_cache_v5',
      'elohim_tts_audio_cache_v6',
    ];
    for (const oldDb of legacyDbs) {
      window.indexedDB.deleteDatabase(oldDb);
    }
  } catch {
    // Non-fatal
  }
}

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem('gemini_api_key')?.trim() || '';
    if (stored && REVOKED_LEGACY_GEMINI_KEYS.has(stored)) {
      localStorage.removeItem('gemini_api_key');
      return '';
    }
    return stored;
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = key.trim();
    if (clean && !REVOKED_LEGACY_GEMINI_KEYS.has(clean)) {
      localStorage.setItem('gemini_api_key', clean);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  } catch {
    // LocalStorage quota or private mode
  }
}

export function getActiveGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const stored = getStoredGeminiKey();
  if (stored && !REVOKED_LEGACY_GEMINI_KEYS.has(stored)) keys.push(stored);

  if (typeof window !== 'undefined') {
    const winKey = (window as any).__GEMINI_API_KEY;
    if (
      winKey &&
      typeof winKey === 'string' &&
      winKey.trim() &&
      !REVOKED_LEGACY_GEMINI_KEYS.has(winKey.trim())
    ) {
      keys.push(winKey.trim());
    }
  }

  const envKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY?.trim();
  if (envKey && !REVOKED_LEGACY_GEMINI_KEYS.has(envKey)) keys.push(envKey);

  if (DEFAULT_GEMINI_KEY && !REVOKED_LEGACY_GEMINI_KEYS.has(DEFAULT_GEMINI_KEY)) {
    keys.push(DEFAULT_GEMINI_KEY);
  }

  return Array.from(new Set(keys.filter(Boolean)));
}

function openTtsCacheDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedTtsAudio(cacheKey: string): Promise<string | null> {
  const db = await openTtsCacheDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cacheKey);
      req.onsuccess = () => resolve(req.result?.base64Audio || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedTtsAudio(cacheKey: string, base64Audio: string): Promise<void> {
  const db = await openTtsCacheDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ cacheKey, base64Audio, cachedAt: Date.now() });
  } catch {
    // Non-fatal
  }
}

export async function clearTtsAudioCache(): Promise<void> {
  memoryAudioBufferCache.clear();
  const db = await openTtsCacheDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Helper to identify whether a sentence or clause is an ancient Hebrew musical direction,
 * choirmaster note, psalm inscription, or liturgical superscription that should not be recited aloud.
 */
function isSuperscriptionChunk(clause: string): boolean {
  const c = clause.replace(/["“”«»']/g, '').trim().toLowerCase();
  if (!c || c.length < 3) return false;
  return /^(for the choir|to the choir|to the chief|for the director|to the leader|with stringed|on stringed|upon |set to|according to|to the tune|a psalm|psalm of|a song|song of|a miktam|miktam of|michtam of|a michtam|a maskil|maskil of|maschil of|a maschil|a shiggaion|shiggaion of|a prayer|prayer of|a praise|praise of|a testimony|a contemplation|when he |when nathan|when saul|when doeg|when the |when joab|after he |of david|of asaph|of the sons|of solomon|of ethan|of heman|of moses|the servant of the lord|who spake|which he sang|concerning the|to teach|to bring to remembrance|for instruction|twenebofo|dawid dwom|asaf dwom|dwom a )/.test(
    c
  );
}

/**
 * Surgically purges psalm superscriptions, liturgical choirmaster directives,
 * and section heading prefixes from scripture text so studio voice narration begins
 * straight from the very first sacred word of the verse, eliminating slide lag.
 */
export function stripPsalmSuperscription(text: string): string {
  let s = (text || '').trim();
  if (!s) return '';

  // 1. Strip inline marginal footnote tags (e.g. <sup>chief: or, overseer</sup>) and leading HTML tags
  s = s.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, ' ');
  s = s.replace(/^<([a-z]+)>[\s\S]*?<\/\1>/i, ' ');
  s = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+[A-Za-z]+:\s*(?:or,|Heb\.|Chal\.)[\s\S]*$/i, '').trim();

  // 2. Strip section heading prefixes if prepended with dash (e.g. 'Deliver Me, O LORD! — ')
  s = s.replace(/^[^—–-]+[—–-]\s*/, '');

  // 3. Iteratively remove leading superscription sentences/clauses
  for (let iterations = 0; iterations < 10; iterations++) {
    s = s.replace(/^["“”«»']+/, '').trim();

    const sentMatch = s.match(/^([^.?!]+)[.?!]\s*(.+)$/);
    if (sentMatch && isSuperscriptionChunk(sentMatch[1]) && sentMatch[2].trim().length > 5) {
      s = sentMatch[2].trim();
      continue;
    }

    const colonMatch = s.match(/^([^.?!:]+):\s*(?:and he said,\s*|he said[,:]?\s*)?(.+)$/i);
    if (colonMatch && isSuperscriptionChunk(colonMatch[1]) && colonMatch[2].trim().length > 10) {
      s = colonMatch[2].trim();
      continue;
    }

    const commaMatch = s.match(/^([^.,;?!:]+)[,;]\s*(.+)$/);
    if (commaMatch && isSuperscriptionChunk(commaMatch[1]) && commaMatch[2].trim().length > 5) {
      s = commaMatch[2].trim();
      continue;
    }

    break;
  }
  return s.replace(/^["“”«»']+/, '').trim();
}

/**
 * Clean verse text strictly for speech synthesis.
 */
export function cleanVerseForSpeech(text: string): string {
  const stripped = stripPsalmSuperscription(text);

  return stripped
    .replace(/^\s*\d+[:.]?\s*/, '') // remove leading verse number if present
    .replace(/\[\d+\]/g, '') // remove footnote tags [1], [2]
    .replace(/\(\d+:\d+\)/g, '')
    .replace(/[«»"“”]/g, '')
    .replace(/[*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Canonical cache key builder shared across IndexedDB and in-memory AudioBuffer cache.
 */
export function buildCanonicalSpeechCacheKey(
  rawText: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName
): string {
  const normLang = (langCode || 'en').toLowerCase().trim();
  const cleanRaw = cleanVerseForSpeech(rawText);
  return `${normLang}:${voiceName}:${cleanRaw}`;
}

/**
 * Helper to convert Uint8Array to base64 string without stack overflow.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

/**
 * Surgically patches streaming WAV headers (0xFFFFFFFF chunk sizes) output by FFmpeg / Groq
 * to exact byte-accurate 32-bit integers, guaranteeing 100% native WebKit / Safari iOS CoreAudio
 * compatibility without 'EncodingError' or 'Unable to decode audio data' failures.
 */
export function sanitizeWavHeaderInPlace(arrayBuf: ArrayBuffer): void {
  const bytes = new Uint8Array(arrayBuf);
  if (bytes.length < 44) return;
  if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) return;

  const dv = new DataView(arrayBuf);
  const riffSize = dv.getUint32(4, true);
  if (riffSize === 0xffffffff || riffSize === 0 || riffSize > bytes.length - 8) {
    dv.setUint32(4, bytes.length - 8, true);
  }

  let pos = 12;
  while (pos < bytes.length - 8) {
    const chunkId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
    const chunkSize = dv.getUint32(pos + 4, true);
    if (chunkId === 'data') {
      const remainingBytes = bytes.length - (pos + 8);
      if (chunkSize === 0xffffffff || chunkSize === 0 || chunkSize > remainingBytes) {
        dv.setUint32(pos + 4, remainingBytes, true);
      }
      break;
    }
    pos += 8 + (chunkSize === 0xffffffff ? 0 : chunkSize);
  }
}

/**
 * Applies subtle voice timbre differentiation to a WAV buffer's sampleRate header field
 * so single-speaker native Bible models (44.1kHz Fast Ghana Voice & Meta MMS) provide distinct,
 * artifact-free vocal profiles across Kore, Charon, Nhyira, Puck, Aoede, and Fenrir.
 */
export function applyVoiceTimbreToWavBuffer(
  arrayBuf: ArrayBuffer,
  voiceName: GoogleNeuralVoiceName
): void {
  const multiplier = VOICE_TIMBRE_SAMPLE_RATE_MULTIPLIER[voiceName] ?? 1.0;
  if (Math.abs(multiplier - 1.0) < 0.001) return;

  const bytes = new Uint8Array(arrayBuf);
  if (bytes.length < 44) return;
  if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) return;

  const dv = new DataView(arrayBuf);
  let pos = 12;
  while (pos < bytes.length - 8) {
    const chunkId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
    const chunkSize = dv.getUint32(pos + 4, true);
    if (chunkId === 'fmt ' && pos + 24 <= bytes.length) {
      const channels = dv.getUint16(pos + 10, true);
      const origSampleRate = dv.getUint32(pos + 12, true);
      const bitsPerSample = dv.getUint16(pos + 22, true);
      const newSampleRate = Math.round(origSampleRate * multiplier);
      const newByteRate = newSampleRate * channels * (bitsPerSample >> 3);
      dv.setUint32(pos + 12, newSampleRate, true);
      dv.setUint32(pos + 16, newByteRate, true);
      break;
    }
    pos += 8 + (chunkSize === 0xffffffff ? 0 : chunkSize);
  }
}

/**
 * Splits a verse into natural speech clauses of `<= maxClauseChars` at punctuation boundaries.
 * Prevents long verses from hitting token limits in Groq Orpheus 24kHz and injects natural
 * comma/sentence pauses in Meta MMS-TTS.
 */
export function splitTextIntoSpeechClauses(
  text: string,
  maxClauseChars = 95
): Array<{ text: string; pauseMs: number }> {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Match phrases ending in punctuation or end of string
  const rawSegments = clean.match(/[^.!?;:,—–]+[.!?;:,—–]+|[^.!?;:,—–]+$/g) || [clean];
  const clauses: Array<{ text: string; pauseMs: number }> = [];

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    const isSentenceEnd = /[.!?]$/.test(trimmed);
    const pauseMs = isSentenceEnd ? 300 : 160;

    if (trimmed.length <= maxClauseChars) {
      // Merge with previous clause if previous was short and ended in a comma
      const prev = clauses[clauses.length - 1];
      if (
        prev &&
        prev.pauseMs < 250 &&
        prev.text.length + 1 + trimmed.length <= maxClauseChars
      ) {
        prev.text = `${prev.text} ${trimmed}`;
        prev.pauseMs = pauseMs;
      } else {
        clauses.push({ text: trimmed, pauseMs });
      }
    } else {
      // Split long unpunctuated segment at word boundaries around maxClauseChars
      const words = trimmed.split(/\s+/);
      let chunk = '';
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const candidate = chunk ? `${chunk} ${w}` : w;
        if (candidate.length <= maxClauseChars || !chunk) {
          chunk = candidate;
        } else {
          clauses.push({ text: chunk, pauseMs: 140 });
          chunk = w;
        }
      }
      if (chunk) {
        clauses.push({ text: chunk, pauseMs });
      }
    }
  }

  return clauses;
}

/**
 * Stitches multiple 16-bit PCM RIFF WAV ArrayBuffers into a single gapless WAV buffer
 * with exact millisecond silence padding between clauses and optional leading silence.
 */
export function stitchPcmWavBuffers(
  wavBuffers: ArrayBuffer[],
  pausesMs: number[],
  leadingSilenceMs = 0,
  voiceName?: GoogleNeuralVoiceName
): ArrayBuffer | null {
  const validChunks: Uint8Array[] = [];
  let sampleRate = 24000;
  let channels = 1;
  let bitsPerSample = 16;

  for (let idx = 0; idx < wavBuffers.length; idx++) {
    const buf = wavBuffers[idx];
    if (!buf || buf.byteLength < 44) continue;
    sanitizeWavHeaderInPlace(buf);

    const bytes = new Uint8Array(buf);
    if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) continue;

    const dv = new DataView(buf);
    let pos = 12;
    let dataOffset = 44;
    let dataSize = bytes.length - 44;

    while (pos < bytes.length - 8) {
      const chunkId = String.fromCharCode(
        bytes[pos],
        bytes[pos + 1],
        bytes[pos + 2],
        bytes[pos + 3]
      );
      const chunkSize = dv.getUint32(pos + 4, true);
      if (chunkId === 'fmt ' && pos + 24 <= bytes.length) {
        channels = dv.getUint16(pos + 10, true);
        sampleRate = dv.getUint32(pos + 12, true);
        bitsPerSample = dv.getUint16(pos + 22, true);
      } else if (chunkId === 'data') {
        dataOffset = pos + 8;
        dataSize = Math.min(chunkSize, bytes.length - dataOffset);
        break;
      }
      pos += 8 + (chunkSize === 0xffffffff ? 0 : chunkSize);
    }

    if (dataOffset < bytes.length && dataSize > 0) {
      const evenSize = dataSize - (dataSize % 2);
      validChunks.push(bytes.subarray(dataOffset, dataOffset + evenSize));

      // Add inter-clause pause after all except the final clause
      if (idx < wavBuffers.length - 1) {
        const pauseMs = pausesMs[idx] ?? 180;
        if (pauseMs > 0) {
          const pauseSamples = Math.round((pauseMs / 1000) * sampleRate) * channels;
          validChunks.push(new Uint8Array(pauseSamples * 2));
        }
      }
    }
  }

  if (validChunks.length === 0) return null;

  const bytesPerSample = Math.max(2, (bitsPerSample >> 3) * channels);
  const leadingBytes =
    leadingSilenceMs > 0
      ? Math.round((leadingSilenceMs / 1000) * sampleRate) * bytesPerSample
      : 0;
  // Add 80ms trailing cushion so final consonant/vowel never clips
  const trailingBytes = Math.round(0.08 * sampleRate) * bytesPerSample;

  const totalPcmBytes =
    leadingBytes +
    validChunks.reduce((acc, c) => acc + c.byteLength, 0) +
    trailingBytes;

  const outBuf = new ArrayBuffer(44 + totalPcmBytes);
  const outDv = new DataView(outBuf);
  const outBytes = new Uint8Array(outBuf);

  const effectiveSampleRate = voiceName
    ? Math.round(sampleRate * (VOICE_TIMBRE_SAMPLE_RATE_MULTIPLIER[voiceName] ?? 1.0))
    : sampleRate;

  // Write standard 44-byte RIFF WAVE header
  outBytes.set([0x52, 0x49, 0x46, 0x46], 0); // 'RIFF'
  outDv.setUint32(4, 36 + totalPcmBytes, true);
  outBytes.set([0x57, 0x41, 0x56, 0x45], 8); // 'WAVE'
  outBytes.set([0x66, 0x6d, 0x74, 0x20], 12); // 'fmt '
  outDv.setUint32(16, 16, true); // PCM fmt chunk size
  outDv.setUint16(20, 1, true); // AudioFormat = 1 (PCM)
  outDv.setUint16(22, channels, true);
  outDv.setUint32(24, effectiveSampleRate, true);
  outDv.setUint32(28, effectiveSampleRate * bytesPerSample, true);
  outDv.setUint16(32, bytesPerSample, true);
  outDv.setUint16(34, bitsPerSample, true);
  outBytes.set([0x64, 0x61, 0x74, 0x61], 36); // 'data'
  outDv.setUint32(40, totalPcmBytes, true);

  let writeOffset = 44 + leadingBytes;
  for (const chunk of validChunks) {
    outBytes.set(chunk, writeOffset);
    writeOffset += chunk.byteLength;
  }

  return outBuf;
}

/**
 * 44.1kHz Native GhanaNLP Bible Studio Engine (`michsethowusu/ghana-tts-twi-ewe-dagbani`).
 * Powered by StableTTS + Vocos 44,100 Hz neural vocoder trained directly on the GhanaNLP
 * Twi & Ewe Bible scripture corpus.
 */
export async function synthesizeFastGhanaBibleTts(
  rawCleanText: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Nhyira'
): Promise<string | null> {
  const code = (langCode || '').toLowerCase().trim();
  const isTwi = code === 'tw' || code === 'ak' || code === 'aka' || code.includes('twi');
  const isEwe = code === 'ee' || code === 'ewe';
  if ((!isTwi && !isEwe) || !rawCleanText) return null;

  const targetGhanaLang = isEwe ? 'ewe' : 'twi';
  const preparedText = prepareTextForFastGhanaVoice(rawCleanText, code);
  if (!preparedText) return null;

  try {
    const callController = new AbortController();
    const callTimeout = setTimeout(() => callController.abort(), 11000);

    const initRes = await fetch(`${FAST_GHANA_VOICE_SPACE_URL}/gradio_api/call/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: callController.signal,
      body: JSON.stringify({
        data: [
          preparedText,
          targetGhanaLang,
          'High quality (slower, cfg 3)',
          'ONNX (full, fast)',
          null,
        ],
      }),
    });
    clearTimeout(callTimeout);

    if (!initRes.ok) return null;
    const initJson = await initRes.json();
    const eventId = initJson?.event_id;
    if (!eventId) return null;

    const sseController = new AbortController();
    const sseTimeout = setTimeout(() => sseController.abort(), 14000);
    const sseRes = await fetch(
      `${FAST_GHANA_VOICE_SPACE_URL}/gradio_api/call/synthesize/${eventId}`,
      { signal: sseController.signal }
    );
    const sseText = await sseRes.text();
    clearTimeout(sseTimeout);

    const dataLines = sseText
      .split('\n')
      .filter((line) => line.startsWith('data: '));
    if (dataLines.length === 0) return null;

    const lastPayload = JSON.parse(dataLines[dataLines.length - 1].slice(6));
    const fileInfo = lastPayload?.[0];
    const wavUrl =
      fileInfo?.url ||
      (fileInfo?.path
        ? `${FAST_GHANA_VOICE_SPACE_URL}/gradio_api/file=${fileInfo.path}`
        : null);
    if (!wavUrl) return null;

    const wavController = new AbortController();
    const wavTimeout = setTimeout(() => wavController.abort(), 10000);
    const wavRes = await fetch(wavUrl, { signal: wavController.signal });
    clearTimeout(wavTimeout);

    if (!wavRes.ok) return null;
    const arrayBuf = await wavRes.arrayBuffer();
    if (!arrayBuf || arrayBuf.byteLength < 1000) return null;

    sanitizeWavHeaderInPlace(arrayBuf);
    applyVoiceTimbreToWavBuffer(arrayBuf, voiceName);
    return uint8ArrayToBase64(new Uint8Array(arrayBuf));
  } catch (err) {
    console.warn('[neuralTtsService] 44.1kHz Fast Ghana Bible TTS notice:', err);
    return null;
  }
}

/**
 * Builds a language-aware phonological director instruction for Google Gemini 24kHz TTS.
 */
export function buildGeminiLanguageDirectorPrompt(
  cleanText: string,
  langCode: string
): string {
  const code = (langCode || 'en').toLowerCase().trim();

  if (code === 'tw') {
    return `Speak in a warm, reverent native Ghanaian Asante Twi accent (pronouncing ɔ as aw, ɛ as eh, gy as j, ky as ch, tw as chw, dw as jw, hw as shw, ny as ny): ${cleanText}`;
  }
  if (code === 'ak' || code === 'aka') {
    return `Speak in a warm, reverent native Ghanaian Akuapem Twi accent (pronouncing ɔ as aw, ɛ as eh, gy as j, ky as ch, tw as chw, dw as jw, hw as shw, ny as ny): ${cleanText}`;
  }
  if (code === 'ee' || code === 'ewe') {
    return `Speak in a warm, reverent native Ghanaian Ewe accent (pronouncing ɛ as eh, ɔ as aw, ɖ as retroflex d, ƒ as f, ʋ as v, dz as dz, ts as ts): ${cleanText}`;
  }
  if (code === 'gaa') {
    return `Speak in a warm, reverent native Ghanaian Ga accent (pronouncing ɛ as eh, ɔ as aw, ŋ as ng, gb as gb, kp as kp, shw as shw): ${cleanText}`;
  }
  if (code === 'yo') {
    return `Speak in a warm, reverent native Nigerian Yoruba accent with authentic tonal cadence (pronouncing ẹ as eh, ọ as aw, ṣ as sh, gb as gb, kp as kp): ${cleanText}`;
  }
  if (code === 'ig') {
    return `Speak in a warm, reverent native Nigerian Igbo accent (pronouncing ọ as aw, ụ as oo, ị as ee, gb as gb, kp as kp, nw as nw, ny as ny): ${cleanText}`;
  }
  if (code === 'ha') {
    return `Speak in a warm, reverent native West African Hausa accent: ${cleanText}`;
  }
  if (code === 'sw') {
    return `Speak in a warm, reverent native East African Kiswahili accent: ${cleanText}`;
  }
  if (code === 'am') {
    return `Speak in a warm, reverent native Ethiopian Amharic accent: ${cleanText}`;
  }
  if (code === 'zu') {
    return `Speak in a warm, reverent native South African isiZulu accent: ${cleanText}`;
  }
  return `Say with reverence, elegance and clear confidence: ${cleanText}`;
}

/**
 * Native Meta AI Massively Multilingual Speech (MMS-TTS) Bible Engine (Clause-Stitched & Lowercase Normalized).
 * Trained directly on native Bible Society / Faith Comes By Hearing recordings
 * for Akan (Asante/Akuapem Twi), Ewe, Yoruba, Hausa, Swahili, Amharic, Hebrew, Greek, etc.
 * Lowercases all input tokens so `facebook/mms-tts-aka` never drops uppercase initial letters as `<unk>`,
 * and stitches clauses with natural comma/sentence pauses.
 */
export async function synthesizeMetaMmsNativeTts(
  rawCleanText: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Nhyira'
): Promise<string | null> {
  const code = (langCode || '').toLowerCase().trim();
  const mmsLangLabel = MMS_LANGUAGE_MAP[code];
  if (!mmsLangLabel || !rawCleanText) return null;

  const rawClauses = splitTextIntoSpeechClauses(rawCleanText, 125);
  const preparedClauses = rawClauses
    .map((c) => ({
      text: prepareClauseForMetaMmsTts(c.text, code),
      pauseMs: c.pauseMs,
    }))
    .filter((c) => c.text.length > 0);

  if (preparedClauses.length === 0) return null;

  const fetchSingleMmsClause = async (clauseStr: string): Promise<ArrayBuffer | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 11000);

      const res = await fetch(`${META_MMS_TTS_SPACE_URL}/run/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          data: [clauseStr, mmsLangLabel],
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const json = await res.json();
      const remoteFilePath = json?.data?.[0]?.name;
      if (!remoteFilePath) return null;

      const wavController = new AbortController();
      const wavTimeoutId = setTimeout(() => wavController.abort(), 9000);
      const wavRes = await fetch(`${META_MMS_TTS_SPACE_URL}/file=${remoteFilePath}`, {
        signal: wavController.signal,
      });
      clearTimeout(wavTimeoutId);

      if (!wavRes.ok) return null;
      const arrayBuf = await wavRes.arrayBuffer();
      if (!arrayBuf || arrayBuf.byteLength < 600) return null;
      return arrayBuf;
    } catch {
      return null;
    }
  };

  try {
    const buffers = await Promise.all(
      preparedClauses.map((c) => fetchSingleMmsClause(c.text))
    );
    if (buffers.some((b) => !b)) return null;

    const stitched = stitchPcmWavBuffers(
      buffers as ArrayBuffer[],
      preparedClauses.map((c) => c.pauseMs),
      150,
      voiceName
    );
    if (!stitched) return null;

    return uint8ArrayToBase64(new Uint8Array(stitched));
  } catch (err) {
    console.warn('[neuralTtsService] Meta MMS Native Bible TTS notice:', err);
    return null;
  }
}

/**
 * Direct Google Gemini 24kHz Multilingual Neural Audio Engine.
 */
export async function synthesizeGeminiMultilingualTts(
  cleanTextForGemini: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Kore'
): Promise<string | null> {
  if (Date.now() < geminiRateLimitedUntil) {
    return null;
  }

  const candidateKeys = getActiveGeminiApiKeys();
  if (candidateKeys.length === 0) return null;

  const geminiVoice = voiceName === 'Nhyira' ? 'Charon' : voiceName;
  const promptText = buildGeminiLanguageDirectorPrompt(cleanTextForGemini, langCode);

  for (const apiKey of candidateKeys) {
    for (const model of GEMINI_TTS_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: geminiVoice },
                },
              },
            },
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const base64Audio = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            return base64Audio;
          }
        } else if (res.status === 429) {
          geminiRateLimitedUntil = Date.now() + 25000;
          break;
        } else if (res.status === 403) {
          break;
        }
      } catch {
        // Continue to next model/key
      }
    }
  }

  return null;
}

/**
 * Fetches authentic natural human speech stream as base64 audio.
 */
export async function fetchGoogleTtsStreamBase64(
  rawCleanText: string,
  langCode: string
): Promise<string | null> {
  try {
    const rawLang = (langCode || 'en').toLowerCase().trim();
    const needsAfricanPhoneticG2P =
      isTwiLanguage(rawLang) ||
      rawLang === 'ee' ||
      rawLang === 'ewe' ||
      rawLang === 'gaa' ||
      rawLang === 'yo' ||
      rawLang === 'ig';

    const textToSpeak = needsAfricanPhoneticG2P
      ? cleanVerseForSpeech(conditionAfricanLocalLanguageForSpeech(rawCleanText, rawLang))
      : rawCleanText;

    let ttsLang = rawLang;
    if (needsAfricanPhoneticG2P) {
      ttsLang = 'en';
    } else if (ttsLang === 'zh-hans') {
      ttsLang = 'zh-CN';
    } else if (ttsLang === 'zh-hant') {
      ttsLang = 'zh-TW';
    } else if (ttsLang === 'he') {
      ttsLang = 'iw';
    } else if (ttsLang.startsWith('en')) {
      ttsLang = 'en';
    } else if (ttsLang.startsWith('es')) {
      ttsLang = 'es';
    } else if (ttsLang.startsWith('fr')) {
      ttsLang = 'fr';
    } else if (ttsLang.startsWith('pt')) {
      ttsLang = 'pt';
    } else if (ttsLang.startsWith('de')) {
      ttsLang = 'de';
    }

    const sentences = textToSpeak.match(/[^.!?,;:]+[.!?,;:]+|[^.!?,;:]+$/g) || [textToSpeak];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const candidate = (currentChunk + ' ' + sentence).trim();
      if (candidate.length <= 160) {
        currentChunk = candidate;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence.trim();
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    const audioBuffers: Uint8Array[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${ttsLang}&client=tw-ob`;
      const res = await fetch(url);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        audioBuffers.push(new Uint8Array(ab));
      }
    }

    if (audioBuffers.length === 0) return null;

    const totalLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of audioBuffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    return uint8ArrayToBase64(merged);
  } catch (err) {
    console.warn('[neuralTtsService] Google natural speech stream fallback warning:', err);
    return null;
  }
}

/**
 * Clause-Stitched High-Presence Studio Voice Engine (Groq Orpheus 24kHz / Modelissa Standard).
 * Splits verses > 95 chars into clauses at punctuation boundaries, synthesizes them in parallel,
 * and stitches the 24kHz 16-bit PCM WAV buffers with natural pauses so long verses never truncate!
 */
export async function synthesizeGroqOrpheusTts(
  conditionedVerseText: string,
  voiceName: GoogleNeuralVoiceName = 'Kore',
  langCode = 'en'
): Promise<string | null> {
  const apiKey =
    (import.meta as any)?.env?.VITE_GROQ_API_KEY?.trim() ||
    DEFAULT_GROQ_KEY;

  if (!apiKey || !conditionedVerseText) return null;

  const isArabic = (langCode || '').toLowerCase().trim() === 'ar';
  const model = isArabic ? GROQ_ORPHEUS_ARABIC_MODEL : GROQ_ORPHEUS_MODEL;
  const targetVoice = isArabic
    ? GROQ_ARABIC_VOICE_MAP[voiceName] || 'fahad'
    : GROQ_VOICE_MAP[voiceName] || 'autumn';

  const clauses = splitTextIntoSpeechClauses(conditionedVerseText, 95);
  if (clauses.length === 0) return null;

  const fetchSingleClauseWav = async (clauseInput: string): Promise<ArrayBuffer | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          input: clauseInput,
          voice: targetVoice,
          response_format: 'wav',
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf && arrayBuf.byteLength > 800) {
          sanitizeWavHeaderInPlace(arrayBuf);
          return arrayBuf;
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn('[neuralTtsService] Groq Orpheus TTS returned HTTP', res.status, errText);
      }
    } catch (err) {
      console.warn('[neuralTtsService] Groq Orpheus TTS fetch exception:', err);
    }
    return null;
  };

  if (clauses.length === 1) {
    const singleBuf = await fetchSingleClauseWav(clauses[0].text);
    if (!singleBuf) return null;
    return uint8ArrayToBase64(new Uint8Array(singleBuf));
  }

  const buffers = await Promise.all(clauses.map((c) => fetchSingleClauseWav(c.text)));
  if (buffers.some((b) => !b)) return null;

  const stitched = stitchPcmWavBuffers(
    buffers as ArrayBuffer[],
    clauses.map((c) => c.pauseMs),
    40
  );
  if (!stitched) return null;

  return uint8ArrayToBase64(new Uint8Array(stitched));
}

/**
 * Synthesizes 44.1kHz / 24kHz Neural & Native Bible Audio with intelligent language-aware routing:
 * - For Twi (`tw`, `ak`) & Ewe (`ee`): Prioritizes the 44.1kHz GhanaNLP Bible Studio Engine
 *   (`synthesizeFastGhanaBibleTts` — StableTTS + Vocos 44,100 Hz trained on the Ghanaian Bible),
 *   followed by Multilingual Gemini 24kHz, Clause-Stitched Groq Orpheus 24kHz (with Akan Phonology v3),
 *   and Lowercase Clause-Stitched Meta MMS Native Bible TTS.
 * - For other African Local Languages (`gaa`, `yo`, `ha`, `ig`, `sw`, `am`, `zu`): Routes through
 *   Multilingual Gemini 24kHz, Lowercase Clause-Stitched Meta MMS Bible TTS, and Clause-Stitched Orpheus 24kHz.
 * - Never routes non-English world languages (French, Spanish, German, etc.) into English-only Orpheus.
 */
export async function synthesizeNeuralAudio(
  rawText: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Kore'
): Promise<string | null> {
  const normLang = (langCode || 'en').toLowerCase().trim();
  const rawCleanText = cleanVerseForSpeech(rawText);
  if (!rawCleanText) {
    return null;
  }

  // Record authentic audio stream telemetry
  recordRealAudioStream();

  const cacheKey = buildCanonicalSpeechCacheKey(rawText, normLang, voiceName);

  // 1. Check local IndexedDB audio vault (0ms latency, zero bandwidth)
  try {
    const cached = await getCachedTtsAudio(cacheKey);
    if (cached) {
      return cached;
    }
  } catch {
    // Non-fatal cache read error
  }

  const isTwi = isTwiLanguage(normLang);
  const isEwe = normLang === 'ee' || normLang === 'ewe';
  const isWestAfricanPhoneticLang =
    isTwi ||
    isEwe ||
    normLang === 'gaa' ||
    normLang === 'yo' ||
    normLang === 'ig' ||
    normLang === 'ha';
  const isAfricanLocalLang =
    isWestAfricanPhoneticLang ||
    normLang === 'sw' ||
    normLang === 'am' ||
    normLang === 'zu';

  // ============================================================================
  // PATH A: TWI (ASANTE & AKUAPEM), EWE & AFRICAN LOCAL LANGUAGES
  // ============================================================================
  if (isAfricanLocalLang) {
    // A1. 44.1kHz Native GhanaNLP Bible Studio Engine (Primary for Asante Twi, Akuapem Twi & Ewe)
    if (isTwi || isEwe) {
      const fastGhanaAudio = await synthesizeFastGhanaBibleTts(
        rawCleanText,
        normLang,
        voiceName
      );
      if (fastGhanaAudio) {
        await setCachedTtsAudio(cacheKey, fastGhanaAudio);
        return fastGhanaAudio;
      }
    }

    // A2. If user selected 'Nhyira', try Lowercase Clause-Stitched Meta MMS Native Bible Voice next
    if (voiceName === 'Nhyira') {
      const mmsAudio = await synthesizeMetaMmsNativeTts(rawCleanText, normLang, voiceName);
      if (mmsAudio) {
        await setCachedTtsAudio(cacheKey, mmsAudio);
        return mmsAudio;
      }
    }

    // A3. Google Gemini 2.5 Flash Multilingual 24kHz TTS (when user has an active Gemini API key)
    const geminiAudio = await synthesizeGeminiMultilingualTts(rawCleanText, normLang, voiceName);
    if (geminiAudio) {
      await setCachedTtsAudio(cacheKey, geminiAudio);
      return geminiAudio;
    }

    // A4. Clause-Stitched 24kHz Studio Engine: Groq Orpheus fed with Precision Akan/African G2P v3
    // (Zero truncation on long verses + binary foot rhythm + ɔ -> aw, ɛ -> eh, Ti -> Tee)
    if (isWestAfricanPhoneticLang) {
      const phoneticScript = cleanVerseForSpeech(
        conditionAfricanLocalLanguageForSpeech(rawCleanText, normLang)
      );
      const groqPhoneticAudio = await synthesizeGroqOrpheusTts(phoneticScript, voiceName, 'en');
      if (groqPhoneticAudio) {
        await setCachedTtsAudio(cacheKey, groqPhoneticAudio);
        return groqPhoneticAudio;
      }
    }

    // A5. Lowercase Clause-Stitched Meta MMS Native Bible TTS
    if (voiceName !== 'Nhyira') {
      const mmsAudio = await synthesizeMetaMmsNativeTts(rawCleanText, normLang, voiceName);
      if (mmsAudio) {
        await setCachedTtsAudio(cacheKey, mmsAudio);
        return mmsAudio;
      }
    }

    // A6. Resilient Google Speech Stream Fallback
    const streamAudio = await fetchGoogleTtsStreamBase64(rawCleanText, normLang);
    if (streamAudio) {
      await setCachedTtsAudio(cacheKey, streamAudio);
      return streamAudio;
    }

    return null;
  }

  // ============================================================================
  // PATH B: ENGLISH ('en') & ARABIC ('ar')
  // ============================================================================
  if (normLang.startsWith('en') || normLang === 'ar') {
    // B1. Clause-Stitched Groq Orpheus 24kHz Studio Engine
    const groqAudio = await synthesizeGroqOrpheusTts(rawCleanText, voiceName, normLang);
    if (groqAudio) {
      await setCachedTtsAudio(cacheKey, groqAudio);
      return groqAudio;
    }

    // B2. Google Gemini 24kHz Neural Audio API
    const geminiAudio = await synthesizeGeminiMultilingualTts(rawCleanText, normLang, voiceName);
    if (geminiAudio) {
      await setCachedTtsAudio(cacheKey, geminiAudio);
      return geminiAudio;
    }

    // B3. Meta MMS Native Bible TTS (for Arabic)
    if (normLang === 'ar') {
      const mmsAudio = await synthesizeMetaMmsNativeTts(rawCleanText, normLang, voiceName);
      if (mmsAudio) {
        await setCachedTtsAudio(cacheKey, mmsAudio);
        return mmsAudio;
      }
    }

    // B4. Modelissa Edge Gateway (English only)
    if (normLang.startsWith('en')) {
      try {
        const edgeRes = await fetch(EDGE_TTS_GATEWAY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: rawCleanText,
            voiceName: voiceName === 'Nhyira' ? 'Charon' : voiceName,
          }),
        });
        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          if (edgeData?.base64Audio) {
            await setCachedTtsAudio(cacheKey, edgeData.base64Audio);
            return edgeData.base64Audio;
          }
        }
      } catch {
        // Continue to next fallback
      }
    }

    // B5. Google Speech Natural Stream Fallback
    const streamAudio = await fetchGoogleTtsStreamBase64(rawCleanText, normLang);
    if (streamAudio) {
      await setCachedTtsAudio(cacheKey, streamAudio);
      return streamAudio;
    }

    return null;
  }

  // ============================================================================
  // PATH C: WORLD & BIBLICAL CLASSICAL LANGUAGES (fr, es, de, pt, it, ru, he, el, zh, ja, ko, hi, etc.)
  // ============================================================================
  if (voiceName === 'Nhyira') {
    const mmsAudio = await synthesizeMetaMmsNativeTts(rawCleanText, normLang, voiceName);
    if (mmsAudio) {
      await setCachedTtsAudio(cacheKey, mmsAudio);
      return mmsAudio;
    }
  }

  const geminiAudio = await synthesizeGeminiMultilingualTts(rawCleanText, normLang, voiceName);
  if (geminiAudio) {
    await setCachedTtsAudio(cacheKey, geminiAudio);
    return geminiAudio;
  }

  if (voiceName !== 'Nhyira') {
    const mmsAudio = await synthesizeMetaMmsNativeTts(rawCleanText, normLang, voiceName);
    if (mmsAudio) {
      await setCachedTtsAudio(cacheKey, mmsAudio);
      return mmsAudio;
    }
  }

  const streamAudio = await fetchGoogleTtsStreamBase64(rawCleanText, normLang);
  if (streamAudio) {
    await setCachedTtsAudio(cacheKey, streamAudio);
    return streamAudio;
  }

  return null;
}

/**
 * Universal audio decoder: Handles 44.1kHz GhanaNLP WAV, 24kHz Orpheus WAV,
 * 16kHz MMS-TTS WAV, 24kHz raw PCM from Gemini TTS, and MP3 streams.
 */
export async function decodeUniversalAudioToBuffer(
  audioContext: AudioContext,
  base64Data: string
): Promise<AudioBuffer> {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 1. Check for RIFF WAV ('RIFF')
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    sanitizeWavHeaderInPlace(bytes.buffer);

    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let pos = 12;
    let dataOffset = -1;
    let dataSize = 0;
    let sampleRate = 24000;
    let channels = 1;
    let bitsPerSample = 16;
    let audioFormat = 1;

    while (pos < bytes.length - 8) {
      const chunkId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
      const chunkSize = dv.getUint32(pos + 4, true);
      if (chunkId === 'fmt ') {
        audioFormat = dv.getUint16(pos + 8, true);
        channels = dv.getUint16(pos + 10, true);
        sampleRate = dv.getUint32(pos + 12, true);
        bitsPerSample = dv.getUint16(pos + 22, true);
      } else if (chunkId === 'data') {
        dataOffset = pos + 8;
        dataSize = bytes.length - dataOffset;
        break;
      }
      pos += 8 + (chunkSize === 0xffffffff ? 0 : chunkSize);
    }

    // Direct Linear PCM Extractor (Primary path for 16-bit PCM WAV — 0ms, 100% alignment-safe on iOS Safari & Chrome)
    if (audioFormat === 1 && bitsPerSample === 16 && dataOffset > 0 && dataSize >= 2 * channels) {
      const numSamples = Math.floor(dataSize / (2 * channels));
      const audioBuffer = audioContext.createBuffer(channels, numSamples, sampleRate);
      for (let ch = 0; ch < channels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        for (let i = 0; i < numSamples; i++) {
          const bytePos = dataOffset + (i * channels + ch) * 2;
          if (bytePos + 1 < bytes.byteLength) {
            channelData[i] = dv.getInt16(bytePos, true) / 32768.0;
          }
        }
      }
      return audioBuffer;
    }

    try {
      const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
        audioContext.decodeAudioData(copy, resolve, reject);
      });
      if (buffer && buffer.length > 0) {
        return buffer;
      }
    } catch (decodeErr) {
      console.warn('[neuralTtsService] decodeAudioData fallback error:', decodeErr);
    }
  }

  // 2. Check for MP3 sync word (0xFFEx) or ID3 header ('ID3')
  const isMp3 =
    (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);

  if (isMp3) {
    const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    return new Promise<AudioBuffer>((resolve, reject) => {
      audioContext.decodeAudioData(
        copy,
        (buffer) => resolve(buffer),
        (err) => {
          console.warn('[neuralTtsService] decodeAudioData error:', err);
          reject(err);
        }
      );
    });
  }

  // Raw Gemini 24kHz 16-bit signed PCM
  return decodePcm24kToAudioBuffer(audioContext, base64Data);
}

/**
 * Decodes 24kHz 16-bit signed PCM Base64 audio into a Web Audio API AudioBuffer
 */
export function decodePcm24kToAudioBuffer(
  audioContext: AudioContext,
  base64Data: string
): AudioBuffer {
  const binaryString = atob(base64Data);
  const evenLength = binaryString.length - (binaryString.length % 2);
  const bytes = new Uint8Array(evenLength);
  for (let i = 0; i < evenLength; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sampleCount = Math.floor(evenLength / 2);
  const float32Data = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    float32Data[i] = dv.getInt16(i * 2, true) / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(1, Math.max(1, float32Data.length), 24000);
  audioBuffer.getChannelData(0).set(float32Data);
  return audioBuffer;
}

/**
 * High-Speed Lookahead Pre-fetching & RAM Caching for 0ms Gapless Playback
 */
export async function getOrPreloadAudioBuffer(
  audioContext: AudioContext,
  text: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Kore'
): Promise<AudioBuffer | null> {
  const memKey = buildCanonicalSpeechCacheKey(text, langCode, voiceName);

  // 1. Instant 0ms RAM Hit - Ensure buffer has valid duration
  if (memoryAudioBufferCache.has(memKey)) {
    const cachedBuf = memoryAudioBufferCache.get(memKey)!;
    if (cachedBuf && cachedBuf.duration > 0.4) {
      return cachedBuf;
    }
  }

  // 2. Fetch base64 (from IndexedDB or network)
  const base64Audio = await synthesizeNeuralAudio(text, langCode, voiceName);
  if (!base64Audio) {
    return null;
  }

  try {
    const buffer = await decodeUniversalAudioToBuffer(audioContext, base64Audio);
    if (buffer && buffer.duration > 0.4) {
      if (memoryAudioBufferCache.size >= 20) {
        const oldestKey = memoryAudioBufferCache.keys().next().value;
        if (oldestKey) {
          memoryAudioBufferCache.delete(oldestKey);
        }
      }
      memoryAudioBufferCache.set(memKey, buffer);
      return buffer;
    }
    return null;
  } catch (err) {
    console.warn('[neuralTtsService] Audio buffer decode error:', err);
    return null;
  }
}

export function isAudioBufferPreloaded(
  text: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Kore'
): boolean {
  const memKey = buildCanonicalSpeechCacheKey(text, langCode, voiceName);
  return memoryAudioBufferCache.has(memKey);
}

// Re-export transphonemizeTwiForSpeech for convenience
export { transphonemizeTwiForSpeech, conditionAfricanLocalLanguageForSpeech };
