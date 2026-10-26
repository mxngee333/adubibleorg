/**
 * 24kHz Google Neural Audio & Authentic Twi TTS Engine
 * Powers real studio-quality voice narration for Scripture across English, Asante Twi, Akuapem Twi, and all 36 languages.
 * Powered by Google Gemini 24kHz Audio Modality (Charon, Kore, Puck, Aoede, Fenrir) + IndexedDB Zero-Cost Audio Vault.
 */

const EDGE_TTS_GATEWAY = 'https://api.modelissa.com/api/gemini-tts';
const DEFAULT_GEMINI_KEY = 'AIzaSyCmYDhFoekesow8HDnv_4zqYeBuEGy58Vo';

export type GoogleNeuralVoiceName = 'Charon' | 'Kore' | 'Puck' | 'Aoede' | 'Fenrir';

export interface NeuralVoiceOption {
  id: GoogleNeuralVoiceName;
  name: string;
  tone: string;
  description: string;
}

export const GOOGLE_NEURAL_VOICES: NeuralVoiceOption[] = [
  {
    id: 'Charon',
    name: 'Charon (Sacred Narrator)',
    tone: 'Deep & Resonant',
    description: 'Solemn, deep, reverent masculine voice tailored for biblical reading.',
  },
  {
    id: 'Kore',
    name: 'Kore (Gentle Warmth)',
    tone: 'Warm & Editorial',
    description: 'Graceful, soothing feminine narration featured in Modelissa.',
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

// v2: Completely purged of any preamble prompts so audio begins straight from the first word
const DB_NAME = 'elohim_tts_audio_cache_v2';
const STORE_NAME = 'audio_tracks';
const memoryAudioBufferCache = new Map<string, AudioBuffer>();

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

/**
 * Synthesizes 24kHz Google Neural Audio with automatic multi-tier retry.
 * NEVER falls back to robotic browser speech!
 */
export async function synthesizeNeuralAudio(
  rawText: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Charon'
): Promise<string> {
  const pureVerseText = cleanVerseForSpeech(rawText);
  if (!pureVerseText) {
    throw new Error('Empty verse text');
  }

  const cacheKey = `${langCode}:${voiceName}:${pureVerseText}`;

  // 1. Check local IndexedDB audio vault (0ms latency, zero bandwidth)
  const cached = await getCachedTtsAudio(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Multi-attempt resilient synthesis from Edge Gateway with backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(EDGE_TTS_GATEWAY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: pureVerseText,
          voiceName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.base64Audio) {
          await setCachedTtsAudio(cacheKey, data.base64Audio);
          return data.base64Audio;
        }
      }
    } catch (edgeErr) {
      console.warn(`[NeuralTTS] Edge Gateway attempt ${attempt + 1} failed:`, edgeErr);
    }

    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 450 * (attempt + 1)));
    }
  }

  // 3. Fallback to Direct Google Gemini Audio API
  const apiKey =
    (typeof window !== 'undefined' &&
      ((window as any).__GEMINI_API_KEY || localStorage.getItem('gemini_api_key'))) ||
    DEFAULT_GEMINI_KEY;

  for (const model of [
    'gemini-2.5-flash-preview-tts',
    'gemini-3.1-flash-tts-preview',
    'gemini-2.0-flash',
  ]) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: pureVerseText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const base64Audio = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          await setCachedTtsAudio(cacheKey, base64Audio);
          return base64Audio;
        }
      }
    } catch {
      // try next model
    }
  }

  throw new Error('Neural TTS synthesis failed after retries');
}

/**
 * Decodes 24kHz 16-bit signed PCM Base64 audio into a Web Audio API AudioBuffer
 */
export function decodePcm24kToAudioBuffer(
  audioContext: AudioContext,
  base64Data: string
): AudioBuffer {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // TTS returns raw PCM 16-bit signed at 24000Hz
  const pcmData = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    float32Data[i] = pcmData[i] / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
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
  voiceName: GoogleNeuralVoiceName = 'Charon'
): Promise<AudioBuffer> {
  const pureVerseText = cleanVerseForSpeech(text);
  const memKey = `${langCode}:${voiceName}:${pureVerseText}`;

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

export function isAudioBufferPreloaded(
  text: string,
  langCode: string,
  voiceName: GoogleNeuralVoiceName = 'Charon'
): boolean {
  const pureVerseText = cleanVerseForSpeech(text);
  const memKey = `${langCode}:${voiceName}:${pureVerseText}`;
  return memoryAudioBufferCache.has(memKey);
}
