/**
 * ADUBIBLE STATUS VIDEO ENGINE (60fps Canvas + 24kHz Neural Audio + MediaRecorder)
 * Generates pristine 10-second animated video status reels for WhatsApp, Instagram, TikTok, YouTube Shorts, X & Facebook.
 * Features 3:4 High-Impact Portrait Ratio, Illuminated Scripture Plaque, Bold Kinetic Typography,
 * 48-Bar Symmetrical Broadcast Visualizer ("Graphvis"), 432Hz Sacred Pad, and Adubible.org Watermark.
 */

import {
  synthesizeNeuralAudio,
  decodeUniversalAudioToBuffer,
  getOrPreloadAudioBuffer,
  GoogleNeuralVoiceName,
} from './neuralTtsService';

export type VideoAspectRatio = '3:4' | '9:16' | '1:1' | '16:9';

export interface StatusVideoTheme {
  id: string;
  name: string;
  description: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
  accentGlow: string;
  textMain: string;
  textHighlight: string;
  textSub: string;
  particleColor: string;
  waveColor: string;
}

export const STATUS_THEMES: StatusVideoTheme[] = [
  {
    id: 'celestial',
    name: 'Celestial Dawn',
    description: 'Radiant golden sunbeams & divine morning glow',
    bgStart: '#0c0804',
    bgEnd: '#291606',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    textMain: '#ffffff',
    textHighlight: '#fef08a',
    textSub: '#fde68a',
    particleColor: 'rgba(253, 230, 138, 0.75)',
    waveColor: '#f59e0b',
  },
  {
    id: 'candlelight',
    name: 'Sacred Flame & Parchment',
    description: 'Deep amber warmth and flickering holy sanctuary glow',
    bgStart: '#120a05',
    bgEnd: '#30180a',
    accent: '#fb923c',
    accentGlow: 'rgba(251, 146, 60, 0.45)',
    textMain: '#ffffff',
    textHighlight: '#fed7aa',
    textSub: '#fdba74',
    particleColor: 'rgba(254, 215, 170, 0.7)',
    waveColor: '#fb923c',
  },
  {
    id: 'clouds',
    name: 'Clouds of Glory',
    description: 'Ethereal rolling mist, heavenly azure & majestic peaks',
    bgStart: '#061020',
    bgEnd: '#132842',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    textMain: '#ffffff',
    textHighlight: '#bae6fd',
    textSub: '#7dd3fc',
    particleColor: 'rgba(186, 230, 253, 0.7)',
    waveColor: '#38bdf8',
  },
  {
    id: 'obsidian',
    name: 'Royal Obsidian & Gold Dust',
    description: 'Deep velvet night with shimmering celestial gold stars',
    bgStart: '#08060c',
    bgEnd: '#1a1026',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.45)',
    textMain: '#ffffff',
    textHighlight: '#fde047',
    textSub: '#e9d5ff',
    particleColor: 'rgba(253, 224, 71, 0.75)',
    waveColor: '#c084fc',
  },
  {
    id: 'covenant',
    name: 'Covenant Living Waters',
    description: 'Emerald sanctuary with gentle aquatic ripples of grace',
    bgStart: '#03120e',
    bgEnd: '#082b20',
    accent: '#34d399',
    accentGlow: 'rgba(52, 211, 153, 0.45)',
    textMain: '#ffffff',
    textHighlight: '#a7f3d0',
    textSub: '#6ee7b7',
    particleColor: 'rgba(167, 243, 208, 0.75)',
    waveColor: '#34d399',
  },
];

export interface StatusVideoOptions {
  reference: string;
  versionName: string;
  verseText: string;
  secondaryVersionName?: string;
  secondaryText?: string;
  theme: StatusVideoTheme;
  aspectRatio: VideoAspectRatio;
  durationSeconds?: number; // default 10.0
  voiceName?: GoogleNeuralVoiceName;
  langCode?: string;
  includeAmbientMusic?: boolean;
  boldTypography?: boolean;
  voiceBoost?: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  maxAlpha: number;
  phase: number;
  isSpark: boolean;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Calculates smart tailored video duration based on word count or audio buffer duration.
 * Intro: 0.5s + Speech: full duration + Outro holding climax: 1.8s
 * Guarantees that 100% of the scripture verse is read in full with zero cutoff or rush.
 */
export function calculateTailoredDuration(
  verseText: string,
  audioBuffer?: AudioBuffer | null
): number {
  if (audioBuffer && audioBuffer.duration > 1.0) {
    // 0.5s intro pad + actual audio duration + 1.8s holding outro
    return Math.max(7.0, Math.min(60.0, Math.ceil(0.5 + audioBuffer.duration + 1.8)));
  }
  const words = verseText.trim().split(/\s+/).filter(Boolean).length;
  // Average reverent biblical narration cadence is ~2.3 words per second
  const estimatedSpeechSec = Math.max(4.0, words / 2.3);
  return Math.max(7.0, Math.min(60.0, Math.ceil(0.5 + estimatedSpeechSec + 1.8)));
}

/**
 * Creates an ultra-clean, sacred acoustic chime buffer as graceful fallback
 * when network voice narration is completely offline, ensuring zero keyboard or buzzing artifacts!
 */
export function createSacredChimeBuffer(
  audioCtx: AudioContext,
  durationSec: number = 8.5
): AudioBuffer {
  const sampleRate = audioCtx.sampleRate || 24000;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Gentle, warm 432Hz harmonic bell chime at start
  const chimeFreq = 432.0;
  const chimeSamples = Math.min(numSamples, Math.floor(sampleRate * 2.5));
  for (let i = 0; i < chimeSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 2.2);
    const wave =
      Math.sin(2 * Math.PI * chimeFreq * t) * 0.45 +
      Math.sin(2 * Math.PI * chimeFreq * 2 * t) * 0.18 +
      Math.sin(2 * Math.PI * chimeFreq * 3 * t) * 0.08;
    data[i] = wave * decay * 0.22;
  }

  return buffer;
}

export class StatusVideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1080;
  private height: number = 1440;
  private particles: Particle[] = [];
  private options: StatusVideoOptions;
  private words: string[] = [];
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private duration: number = 10.0;
  private isRendering: boolean = false;

  // Web Audio pipeline
  private audioCtx: AudioContext | null = null;
  private audioDest: MediaStreamAudioDestinationNode | null = null;
  private speechBuffer: AudioBuffer | null = null;
  private speechSource: AudioBufferSourceNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private speechGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;

  // Visualizer graphvis peak tracker
  private visualizerPeaks: number[] = new Array(48).fill(0);

  constructor(canvas: HTMLCanvasElement, options: StatusVideoOptions) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.options = {
      boldTypography: true,
      voiceBoost: true,
      includeAmbientMusic: true,
      ...options,
    };
    this.duration =
      options.durationSeconds && options.durationSeconds > 0
        ? options.durationSeconds
        : calculateTailoredDuration(options.verseText);
    this.setDimensions(options.aspectRatio);
    this.prepareWords();
    this.initParticles();
  }

  public getDuration(): number {
    return this.duration;
  }

  public getSpeechBuffer(): AudioBuffer | null {
    return this.speechBuffer;
  }

  public ensureAudioUnlocked(): void {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Plays the generated scripture voice narration solo using the renderer's own AudioContext,
   * guaranteeing zero cross-context NotSupportedError exceptions and crystal-clear loudness.
   */
  public playVoiceSolo(onEnded?: () => void, isRetry = false): () => void {
    this.stopAudio();
    this.ensureAudioUnlocked();

    if (!this.audioCtx || !this.speechBuffer) {
      if (onEnded) onEnded();
      return () => {};
    }

    try {
      this.speechSource = this.audioCtx.createBufferSource();
      try {
        this.speechSource.buffer = this.speechBuffer;
      } catch (bufErr) {
        console.warn('[StatusVideoRenderer] Cross-context buffer mismatch, refreshing:', bufErr);
        if (isRetry) {
          if (onEnded) onEnded();
          return () => {};
        }
        // Refresh buffer for current AudioContext once
        this.preloadAudio().then((ok) => {
          if (ok && this.speechBuffer && this.audioCtx) {
            this.playVoiceSolo(onEnded, true);
          } else if (onEnded) {
            onEnded();
          }
        });
        return () => {};
      }

      this.speechGain = this.audioCtx.createGain();
      const boost = this.options.voiceBoost !== false ? 1.6 : 1.25;
      this.speechGain.gain.setValueAtTime(boost, this.audioCtx.currentTime);

      this.speechSource.connect(this.speechGain);
      this.speechGain.connect(this.audioCtx.destination);

      this.speechSource.onended = () => {
        if (onEnded) onEnded();
      };

      this.speechSource.start();

      return () => {
        try {
          if (this.speechSource) {
            this.speechSource.stop();
            this.speechSource.disconnect();
            this.speechSource = null;
          }
        } catch {}
      };
    } catch (err) {
      console.warn('[StatusVideoRenderer] playVoiceSolo error:', err);
      if (onEnded) onEnded();
      return () => {};
    }
  }

  public updateOptions(newOptions: Partial<StatusVideoOptions>): void {
    const textChanged = newOptions.verseText !== undefined && newOptions.verseText !== this.options.verseText;
    const voiceChanged = newOptions.voiceName !== undefined && newOptions.voiceName !== this.options.voiceName;
    if (textChanged || voiceChanged) {
      this.speechBuffer = null;
    }
    this.options = { ...this.options, ...newOptions };
    if (newOptions.aspectRatio) {
      this.setDimensions(newOptions.aspectRatio);
      this.initParticles();
    }
    if (newOptions.verseText !== undefined) {
      this.prepareWords();
      if (!this.options.durationSeconds || this.options.durationSeconds <= 0) {
        this.duration = calculateTailoredDuration(this.options.verseText, this.speechBuffer);
      }
    }
    if (newOptions.durationSeconds !== undefined) {
      this.duration =
        newOptions.durationSeconds > 0
          ? newOptions.durationSeconds
          : calculateTailoredDuration(this.options.verseText, this.speechBuffer);
    }
  }

  public destroy(): void {
    this.stopAudio();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private setDimensions(ratio: VideoAspectRatio): void {
    if (ratio === '3:4') {
      // 1080x1440 Crisp QHD Portrait (Social Feeds, WhatsApp Status, Instagram)
      this.width = 1080;
      this.height = 1440;
    } else if (ratio === '9:16') {
      // 1080x1920 Full HD Vertical Reel/TikTok
      this.width = 1080;
      this.height = 1920;
    } else if (ratio === '1:1') {
      // 1080x1080 Square Feed
      this.width = 1080;
      this.height = 1080;
    } else {
      // 1920x1080 Landscape
      this.width = 1920;
      this.height = 1080;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  private prepareWords(): void {
    const raw = this.options.verseText.trim();
    this.words = raw.split(/\s+/).filter(Boolean);
  }

  private initParticles(): void {
    this.particles = [];
    const count = 75;
    for (let i = 0; i < count; i++) {
      const isSpark = i % 3 === 0;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: isSpark ? Math.random() * 2.2 + 1.0 : Math.random() * 4.2 + 2.0,
        speedY: -(Math.random() * 0.65 + 0.2),
        speedX: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.6 + 0.2,
        maxAlpha: isSpark ? 0.95 : 0.45,
        phase: Math.random() * Math.PI * 2,
        isSpark,
      });
    }
  }

  /**
   * Pre-loads the neural speech audio into an AudioBuffer using Google Neural Audio or Google Voice Stream.
   * Guarantees authentic human voice narration with ZERO synthesizer keyboard sounds!
   */
  public async preloadAudio(): Promise<boolean> {
    try {
      this.ensureAudioUnlocked();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      } else if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const voice = this.options.voiceName || 'Kore';
      const lang = this.options.langCode || 'en';

      const buffer = await getOrPreloadAudioBuffer(this.audioCtx, this.options.verseText, lang, voice);
      if (buffer) {
        this.speechBuffer = buffer;
        if (!this.options.durationSeconds || this.options.durationSeconds <= 0) {
          this.duration = calculateTailoredDuration(this.options.verseText, buffer);
        }
        return true;
      }

      return false;
    } catch (err) {
      console.warn('[StatusVideoEngine] Speech preload warning:', err);
      return false;
    }
  }

  /**
   * Starts ambient reverent 432Hz sacred harmonic soundscape pad.
   */
  private startAmbientPad(destNode: AudioNode): void {
    if (!this.audioCtx || !this.options.includeAmbientMusic) return;

    try {
      const now = this.audioCtx.currentTime;
      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      // Gentle swell to a soft, reverent bed underneath the powerful studio voice
      this.ambientGain.gain.exponentialRampToValueAtTime(0.04, now + 1.2);
      this.ambientGain.connect(destNode);

      // Sacred C major 432Hz tuned chord: C3 (129.6Hz), G3 (194.4Hz), C4 (259.2Hz), E4 (324.0Hz)
      const frequencies = [129.6, 194.4, 259.2, 324.0];
      this.ambientOscillators = [];

      for (const freq of frequencies) {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const detune = (Math.random() - 0.5) * 4;
        osc.detune.setValueAtTime(detune, now);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        osc.connect(filter);
        filter.connect(this.ambientGain);
        osc.start(now);
        this.ambientOscillators.push(osc);
      }
    } catch {
      // Non-fatal
    }
  }

  private stopAudio(): void {
    try {
      if (this.speechSource) {
        this.speechSource.stop();
        this.speechSource.disconnect();
        this.speechSource = null;
      }
      for (const osc of this.ambientOscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      }
      this.ambientOscillators = [];
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
      if (this.speechGain) {
        this.speechGain.disconnect();
        this.speechGain = null;
      }
      if (this.masterCompressor) {
        this.masterCompressor.disconnect();
        this.masterCompressor = null;
      }
    } catch {}
  }

  /**
   * Draws a single frame at timestamp `elapsedSeconds`.
   * High-impact 3:4 & 9:16 layout with illuminated scripture plaque, bold typography,
   * celestial astrolabe, volumetric light rays, and 48-bar visualizer ("graphvis").
   */
  public drawFrame(elapsed: number): void {
    const W = this.width;
    const H = this.height;
    const ctx = this.ctx;
    const theme = this.options.theme;
    const progress = Math.min(1.0, elapsed / this.duration);

    // 1. Cinematic Multi-Stop Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(0.3, theme.bgEnd);
    bgGrad.addColorStop(0.7, theme.bgEnd);
    bgGrad.addColorStop(1, theme.bgStart);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Cinematic Vignette Overlay
    const vignette = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.78
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // 3. Volumetric Heavenly God Rays
    this.drawVolumetricGodRays(W, H, elapsed, theme);

    // 4. Celestial Sacred Astrolabe & Geometric Halo (Background Graphvis)
    this.drawSacredGeometricHalo(W, H, elapsed, theme);

    // 5. Dual-Depth Shimmering Floating Stardust Embers
    this.drawStardustParticles(W, H, elapsed, theme);

    // 6. Regal Outer Frame & Corner Brackets
    this.drawRegalOuterFrame(W, H, theme);

    // 7. Calculate Bold Typography & Kinetic Plaque Dimensions
    const plaqueMargin = Math.max(46, Math.floor(W * 0.055));
    const plaqueW = W - plaqueMargin * 2;
    const maxTextWidth = plaqueW - 96;

    // Dynamic High-Impact Font Sizing (Tuned for maximum readability on mobile screens)
    const textLen = this.options.verseText.length;
    let fontSize = 48;
    if (textLen < 60) fontSize = 58;
    else if (textLen < 120) fontSize = 48;
    else if (textLen < 200) fontSize = 42;
    else if (textLen < 320) fontSize = 36;
    else fontSize = 30;

    if (H <= 1080) {
      fontSize = Math.floor(fontSize * 0.88);
    }
    const lineHeight = Math.round(fontSize * 1.52);

    const serifStack = '"Cinzel", "Cormorant Garamond", "Playfair Display", Georgia, serif';
    const fontWeight = this.options.boldTypography !== false ? '800' : '700';
    ctx.font = `${fontWeight} ${fontSize}px ${serifStack}`;

    // Break text into balanced lines
    const lines: { text: string; wordsInLine: { word: string; index: number }[] }[] = [];
    let currentLineWords: { word: string; index: number }[] = [];
    let currentLineText = '';
    const totalWords = this.words.length;

    for (let i = 0; i < totalWords; i++) {
      const word = this.words[i];
      const testLine = currentLineText ? `${currentLineText} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxTextWidth && currentLineWords.length > 0) {
        lines.push({ text: currentLineText, wordsInLine: currentLineWords });
        currentLineWords = [{ word, index: i }];
        currentLineText = word;
      } else {
        currentLineWords.push({ word, index: i });
        currentLineText = testLine;
      }
    }
    if (currentLineWords.length > 0) {
      lines.push({ text: currentLineText, wordsInLine: currentLineWords });
    }

    const totalTextHeight = lines.length * lineHeight;
    const hasSecondary = Boolean(this.options.secondaryText && this.options.secondaryVersionName);

    // Compute Plaque Height & Centering (Symmetrically balanced with prehead removed)
    const topQuoteH = 48;
    const spacingUnderQuote = 20;
    const spacingUnderText = 24;
    const dividerH = 24;
    const refH = 38;
    const versionH = 22;
    const secondaryH = hasSecondary ? 46 : 0;
    const plaquePaddingTop = 42;
    const plaquePaddingBottom = 40;

    const plaqueH =
      plaquePaddingTop +
      topQuoteH +
      spacingUnderQuote +
      totalTextHeight +
      spacingUnderText +
      dividerH +
      refH +
      versionH +
      secondaryH +
      plaquePaddingBottom;

    const topSafeZone = 48;
    const bottomSafeZone = 145; // Generous safe margin protecting 48-bar visualizer, progress rail & locked AduBible.org watermark
    const availableMidHeight = H - topSafeZone - bottomSafeZone;
    const plaqueX = plaqueMargin;
    const plaqueY = Math.max(topSafeZone + 10, topSafeZone + (availableMidHeight - plaqueH) / 2);

    // 9. Central Illuminated Glassmorphic Scripture Plaque
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;

    const plaqueGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
    plaqueGrad.addColorStop(0, 'rgba(12, 9, 6, 0.82)');
    plaqueGrad.addColorStop(0.5, 'rgba(24, 18, 12, 0.88)');
    plaqueGrad.addColorStop(1, 'rgba(12, 9, 6, 0.82)');
    ctx.fillStyle = plaqueGrad;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 28);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Glowing Golden Filigree Plaque Border
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.65;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 12;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 28);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner Filigree Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    drawRoundedRect(ctx, plaqueX + 8, plaqueY + 8, plaqueW - 16, plaqueH - 16, 22);
    ctx.stroke();

    // 4 Corner Gold Studs
    const studR = 4;
    const studOffset = 18;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.85;
    [
      [plaqueX + studOffset, plaqueY + studOffset],
      [plaqueX + plaqueW - studOffset, plaqueY + studOffset],
      [plaqueX + studOffset, plaqueY + plaqueH - studOffset],
      [plaqueX + plaqueW - studOffset, plaqueY + plaqueH - studOffset],
    ].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, studR, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 10. Decorative Top Quote Mark Inside Plaque
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '800 56px Georgia, serif';
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 16;
    ctx.fillText('“', W / 2, plaqueY + plaquePaddingTop + 32);
    ctx.restore();

    // 10. Kinetic Typography Rendering (Ultra-Bold & Dynamic Spoken Highlighter)
    const textStartTime = 0.5;
    const speechDuration =
      this.speechBuffer && this.speechBuffer.duration > 1.0
        ? this.speechBuffer.duration
        : Math.max(3.5, totalWords / 2.3);
    const textEndTime = textStartTime + speechDuration;
    const activeTextDuration = Math.max(0.1, textEndTime - textStartTime);

    let revealedWordCount = totalWords;
    if (elapsed < textStartTime) {
      revealedWordCount = 0;
    } else if (elapsed < textEndTime) {
      const textProgress = (elapsed - textStartTime) / activeTextDuration;
      revealedWordCount = Math.floor(textProgress * totalWords) + 1;
      revealedWordCount = Math.min(totalWords, Math.max(1, revealedWordCount));
    }

    const textStartY = plaqueY + plaquePaddingTop + topQuoteH + spacingUnderQuote + fontSize * 0.95;
    const isHoldPhase = elapsed >= textEndTime;

    lines.forEach((lineObj, lineIdx) => {
      const lineY = textStartY + lineIdx * lineHeight;

      ctx.font = `${fontWeight} ${fontSize}px ${serifStack}`;
      const spaceWidth = ctx.measureText(' ').width;
      const wordMetrics = lineObj.wordsInLine.map((item) => ({
        ...item,
        width: ctx.measureText(item.word).width,
      }));
      const totalLineWidth =
        wordMetrics.reduce((sum, item) => sum + item.width, 0) +
        spaceWidth * (wordMetrics.length - 1);

      let curX = (W - totalLineWidth) / 2;

      wordMetrics.forEach((item) => {
        const isRevealed = item.index < revealedWordCount;
        const isCurrentActive =
          item.index === revealedWordCount - 1 && elapsed >= textStartTime && elapsed < textEndTime;

        ctx.save();
        ctx.textAlign = 'left';

        if (isHoldPhase) {
          // Final holding climax: synchronized pure luminous light
          const holdPulse = Math.sin((elapsed - textEndTime) * 3.5) * 0.05;
          ctx.globalAlpha = 0.98 + holdPulse;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = theme.accent;
          ctx.shadowBlur = 18;
        } else if (isCurrentActive) {
          // Radiant Spoken Word: Golden Highlighter Pill & Intense Beam
          const pillPad = 8;
          ctx.fillStyle = theme.accentGlow;
          drawRoundedRect(
            ctx,
            curX - pillPad,
            lineY - fontSize * 0.88,
            item.width + pillPad * 2,
            fontSize * 1.15,
            8
          );
          ctx.fill();

          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.globalAlpha = 1.0;
          ctx.fillStyle = theme.textHighlight;
          ctx.shadowColor = theme.accent;
          ctx.shadowBlur = 24;

          // Underline beam
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(curX - 2, lineY + 6);
          ctx.lineTo(curX + item.width + 2, lineY + 6);
          ctx.stroke();
        } else if (isRevealed) {
          // Spoken/Read Word: Brilliant Solid White with dark edge outline for maximum punch
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 14;
        } else {
          // Upcoming Word: 100% VISIBLE, CRISP, AND LEGIBLE FROM FRAME 0!
          // High contrast bright ivory with strong drop shadow so verse text never vanishes
          ctx.globalAlpha = 0.88;
          ctx.fillStyle = '#f8fafc';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 10;
        }

        ctx.fillText(item.word, curX, lineY);
        ctx.restore();

        curX += item.width + spaceWidth;
      });
    });

    // 12. Ornate Golden Divider
    const dividerY = textStartY + totalTextHeight + spacingUnderText - 4;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '700 16px sans-serif';
    ctx.letterSpacing = '5px';
    ctx.globalAlpha = 0.75;
    ctx.fillText('━━━━ ✦ ━━━━', W / 2, dividerY);
    ctx.restore();

    // 13. Scripture Reference Cartouche (Bold & Authoritative)
    const refY = dividerY + refH;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '800 32px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '4.5px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 14;
    ctx.fillText(`✦ ${this.options.reference.toUpperCase()} ✦`, W / 2, refY);
    ctx.shadowBlur = 0;

    // Translation name badge
    ctx.font = '800 13.5px sans-serif';
    ctx.fillStyle = theme.textSub;
    ctx.letterSpacing = '3px';
    ctx.globalAlpha = 0.9;
    const versionLabel = `${this.options.versionName.toUpperCase()} • PARALLEL REEL`;
    ctx.fillText(versionLabel, W / 2, refY + versionH);
    ctx.restore();

    // 14. Secondary Translation Excerpt (if parallel study selected)
    if (hasSecondary && this.options.secondaryText) {
      const secY = refY + versionH + 34;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textSub;
      ctx.globalAlpha = Math.min(0.9, Math.max(0, (elapsed - 1.8) / 1.5));
      ctx.font = 'italic 18px Georgia, serif';
      const cleanSec = this.options.secondaryText.slice(0, 85).trim();
      const secExcerpt = `"${cleanSec}..." — ${this.options.secondaryVersionName}`;
      ctx.fillText(secExcerpt, W / 2, secY);
      ctx.restore();
    }

    // 15. 48-Bar Symmetrical Audio Visualizer ("Graphvis")
    const waveY = Math.min(H - 138, plaqueY + plaqueH + 46);
    this.draw48BarBroadcastVisualizer(elapsed, W, waveY, theme);

    // 16. Golden Progress Rail
    const progressBarY = H - 86;
    const barMargin = Math.max(60, Math.floor(W * 0.08));
    const barWidth = W - barMargin * 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(barMargin, progressBarY, barWidth, 3.5);

    ctx.fillStyle = theme.accent;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    ctx.fillRect(barMargin, progressBarY, barWidth * progress, 3.5);
    ctx.shadowBlur = 0;

    // Playhead glowing bead
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(barMargin + barWidth * progress, progressBarY + 1.75, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Time Indicator (Sample-accurate, formatted as M:SS / M:SS)
    const formatMmSs = (sec: number) => {
      const clamped = Math.max(0, Math.floor(sec));
      const m = Math.floor(clamped / 60);
      const s = clamped % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    const timeStr = `${formatMmSs(elapsed)} / ${formatMmSs(this.duration)}`;
    ctx.fillStyle = theme.textSub;
    ctx.font = '700 12.5px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, barMargin + barWidth, progressBarY - 9);

    // 17. LUXURY PERMANENT WATERMARK OF ADUBIBLE.ORG
    this.drawLuxuryWatermark(W, H, theme, elapsed);
  }

  /**
   * Cinematic Volumetric Heavenly Godrays & Ethereal Atmospheric Corona
   * Replaces harsh polygon triangles with soft, feathery additive light shafts,
   * an anamorphic celestial lens streak, and organic luminous breathing.
   */
  private drawVolumetricGodRays(
    W: number,
    H: number,
    elapsed: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    ctx.save();

    // 1. Additive / Screen blending for realistic optical illumination
    ctx.globalCompositeOperation = 'screen';

    const originX = W / 2;
    const originY = -35;

    // 2. Celestial Apex Ambient Corona (Broad Heavenly Source Bloom)
    const coronaRadius = Math.max(W * 0.75, H * 0.52);
    const coronaGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, coronaRadius);
    const coronaPulse = 0.28 + Math.sin(elapsed * 1.6) * 0.05;
    coronaGrad.addColorStop(0, `rgba(255, 255, 245, ${coronaPulse})`);
    coronaGrad.addColorStop(0.22, theme.accentGlow);
    coronaGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
    coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coronaGrad;
    ctx.fillRect(0, 0, W, H * 0.7);

    // 3. Anamorphic Ethereal Lens Flare Ribbon (Horizontal Cinematic Streak)
    const anamorphicGrad = ctx.createRadialGradient(originX, 48, 0, originX, 48, W * 0.42);
    anamorphicGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    anamorphicGrad.addColorStop(0.25, theme.accentGlow);
    anamorphicGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = anamorphicGrad;
    ctx.beginPath();
    ctx.ellipse(originX, 48, W * 0.44, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Soft Feathery Volumetric Light Shafts (7 Organic Rays)
    const rayAngles = [-0.38, -0.24, -0.11, 0.0, 0.12, 0.25, 0.39];
    const reach = H * 0.88;

    for (let i = 0; i < rayAngles.length; i++) {
      const baseAngle = Math.PI / 2 + rayAngles[i];
      const gentleSway = Math.sin(elapsed * 1.1 + i * 0.9) * 0.035;
      const angle = baseAngle + gentleSway;

      // Shaft target vector
      const endX = originX + Math.cos(angle) * reach;
      const endY = originY + Math.sin(angle) * reach;

      // Atmospheric density pulsation
      const rayAlpha = 0.14 + Math.sin(elapsed * 1.8 + i * 1.4) * 0.06;

      // Draw multi-pass feathered beam (broad haze + focused core)
      // Pass A: Wide soft haze with smooth curvature
      const hazeWidth = 160 + Math.sin(elapsed * 1.4 + i) * 20;
      const hazeGrad = ctx.createLinearGradient(originX, originY, endX, endY);
      hazeGrad.addColorStop(0, theme.accentGlow);
      hazeGrad.addColorStop(0.35, `rgba(255, 250, 235, ${rayAlpha * 0.45})`);
      hazeGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
      hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = hazeGrad;
      ctx.beginPath();
      ctx.moveTo(originX - 15, originY);
      ctx.lineTo(originX + 15, originY);
      ctx.quadraticCurveTo(
        originX + (endX - originX) * 0.5 + hazeWidth * 0.2,
        originY + (endY - originY) * 0.5,
        endX + hazeWidth * 0.5,
        endY
      );
      ctx.lineTo(endX - hazeWidth * 0.5, endY);
      ctx.quadraticCurveTo(
        originX + (endX - originX) * 0.5 - hazeWidth * 0.2,
        originY + (endY - originY) * 0.5,
        originX - 15,
        originY
      );
      ctx.closePath();
      ctx.fill();

      // Pass B: Inner radiant spine
      const coreWidth = 55 + Math.sin(elapsed * 2.2 + i * 1.5) * 12;
      const coreGrad = ctx.createLinearGradient(originX, originY, endX, endY);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${rayAlpha * 0.75})`);
      coreGrad.addColorStop(0.4, `rgba(255, 245, 220, ${rayAlpha * 0.55})`);
      coreGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(originX - 5, originY);
      ctx.lineTo(originX + 5, originY);
      ctx.lineTo(endX + coreWidth * 0.5, endY);
      ctx.lineTo(endX - coreWidth * 0.5, endY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Rotating Sacred Geometric Astrolabe / Celestial Halo ("Graphvis")
   */
  private drawSacredGeometricHalo(
    W: number,
    H: number,
    elapsed: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    const centerX = W / 2;
    const centerY = H * 0.44;
    const radius = Math.min(W, H) * 0.38;
    const rot = elapsed * 0.06;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);

    // Outer Thin Orbit Ring
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Concentric Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    // 12 Cardinal Star Vertices
    const numPoints = 12;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < numPoints; i++) {
      const a = (i / numPoints) * Math.PI * 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      ctx.beginPath();
      ctx.arc(px, py, i % 3 === 0 ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Dual-Depth Shimmering Stardust Particles
   */
  private drawStardustParticles(
    W: number,
    H: number,
    elapsed: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(elapsed * 2.2 + p.phase) * 0.35;
      if (p.y < 0) {
        p.y = H + 12;
        p.x = Math.random() * W;
      }
      const twinkle = Math.sin(elapsed * 5 + p.phase) * 0.25;
      const alpha = Math.max(0.1, Math.min(0.95, (p.alpha + twinkle) * p.maxAlpha));

      ctx.save();
      ctx.fillStyle = p.isSpark ? '#ffffff' : theme.particleColor;
      ctx.globalAlpha = alpha;
      if (p.isSpark) {
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Regal Outer Hairline Frame & Corner Fleurons
   */
  private drawRegalOuterFrame(W: number, H: number, theme: StatusVideoTheme): void {
    const ctx = this.ctx;
    const frameInset = 34;

    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(frameInset, frameInset, W - frameInset * 2, H - frameInset * 2);

    // Inner hairline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      frameInset + 8,
      frameInset + 8,
      W - (frameInset + 8) * 2,
      H - (frameInset + 8) * 2
    );

    // 4 Corner Brackets
    const cornerSize = 34;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.88;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(frameInset, frameInset + cornerSize);
    ctx.lineTo(frameInset, frameInset);
    ctx.lineTo(frameInset + cornerSize, frameInset);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(W - frameInset - cornerSize, frameInset);
    ctx.lineTo(W - frameInset, frameInset);
    ctx.lineTo(W - frameInset, frameInset + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(frameInset, H - frameInset - cornerSize);
    ctx.lineTo(frameInset, H - frameInset);
    ctx.lineTo(frameInset + cornerSize, H - frameInset);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(W - frameInset - cornerSize, H - frameInset);
    ctx.lineTo(W - frameInset, H - frameInset);
    ctx.lineTo(W - frameInset, H - frameInset - cornerSize);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 48-Bar Symmetrical Broadcast Visualizer ("Graphvis")
   * Features dynamic amplitude bars, peak indicators, and horizon mirror reflection.
   */
  private draw48BarBroadcastVisualizer(
    elapsed: number,
    W: number,
    waveY: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    const barCount = 48;
    const totalWaveWidth = Math.min(W - 160, 520);
    const spacing = 4;
    const barWidth = (totalWaveWidth - spacing * (barCount - 1)) / barCount;

    ctx.save();

    for (let i = 0; i < barCount; i++) {
      // Symmetrical bell-curve normalization around center
      const centerDist = Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
      const norm = Math.cos(centerDist * (Math.PI / 2.2));

      // Dynamic reactive speech amplitude envelope
      const wavePhase1 = elapsed * 6.0 + i * 0.45;
      const wavePhase2 = elapsed * 9.5 - i * 0.3;
      const speechReact = Math.sin(wavePhase1) * 0.5 + Math.cos(wavePhase2) * 0.5;

      // Base bar height
      const targetHeight = Math.max(
        5,
        norm * (24 + speechReact * 36) + Math.sin(elapsed * 4 + i) * 6
      );

      // Peak tracking
      if (targetHeight > this.visualizerPeaks[i]) {
        this.visualizerPeaks[i] = targetHeight;
      } else {
        this.visualizerPeaks[i] = Math.max(targetHeight, this.visualizerPeaks[i] - 0.45);
      }

      const x = W / 2 - totalWaveWidth / 2 + i * (barWidth + spacing);

      // 1. Upright Main Bar with Multi-Stop Golden Gradient
      const barGrad = ctx.createLinearGradient(0, waveY - targetHeight, 0, waveY);
      barGrad.addColorStop(0, '#fef08a');
      barGrad.addColorStop(0.5, theme.accent);
      barGrad.addColorStop(1, 'rgba(245, 158, 11, 0.4)');

      ctx.fillStyle = barGrad;
      ctx.globalAlpha = 0.55 + norm * 0.45;
      drawRoundedRect(ctx, x, waveY - targetHeight, barWidth, targetHeight, barWidth / 2);
      ctx.fill();

      // 2. Mirrored Under-Horizon Reflection
      const reflectHeight = targetHeight * 0.45;
      const reflectGrad = ctx.createLinearGradient(0, waveY, 0, waveY + reflectHeight);
      reflectGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      reflectGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = reflectGrad;
      drawRoundedRect(ctx, x, waveY + 2, barWidth, reflectHeight, barWidth / 2);
      ctx.fill();

      // 3. Floating Peak Indicator Pip
      const peakY = waveY - this.visualizerPeaks[i] - 3;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, peakY, barWidth, 1.8);
    }

    // Glowing Horizon Line
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(W / 2 - totalWaveWidth / 2 - 20, waveY);
    ctx.lineTo(W / 2 + totalWaveWidth / 2 + 20, waveY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Official Luxury Permanent Watermark of AduBible.org
   * Centered, crystal-clear, unbloated branding for WhatsApp, TikTok, Instagram & Shorts
   */
  private drawLuxuryWatermark(
    W: number,
    H: number,
    theme: StatusVideoTheme,
    elapsed: number
  ): void {
    const ctx = this.ctx;
    const watermarkY = H - 38;
    const watermarkPulse = 0.94 + Math.sin(elapsed * 2.5) * 0.06;

    ctx.save();
    ctx.textAlign = 'center';

    const pillWidth = 246;
    const pillHeight = 36;
    const pillX = (W - pillWidth) / 2;
    const pillY = watermarkY - 18;

    // Dark glass pill backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 18);
    ctx.fill();

    // Golden halo rim
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.35;
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Permanent Locked Watermark: AduBible.org
    ctx.globalAlpha = watermarkPulse;
    ctx.fillStyle = theme.accent;
    ctx.font = '800 15px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 12;
    ctx.fillText('✦ AduBible.org® ✦', W / 2, watermarkY + 5.5);

    ctx.restore();
  }

  /**
   * Plays the live 10-second preview on the canvas with bold audio & speech.
   */
  public playPreview(
    onProgress?: (seconds: number) => void,
    onEnded?: () => void
  ): () => void {
    this.stopAudio();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.audioCtx) {
        // Master Dynamics Compressor for Ambient Soundscape
        this.masterCompressor = this.audioCtx.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-18, this.audioCtx.currentTime);
        this.masterCompressor.knee.setValueAtTime(24, this.audioCtx.currentTime);
        this.masterCompressor.ratio.setValueAtTime(10, this.audioCtx.currentTime);
        this.masterCompressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
        this.masterCompressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);
        this.masterCompressor.connect(this.audioCtx.destination);

        // Ambient pad (soft, quiet bed at 0.04 volume)
        this.startAmbientPad(this.masterCompressor);

        // Speech Narration with Studio Presence Boost directly to destination
        if (this.speechBuffer) {
          this.speechSource = this.audioCtx.createBufferSource();
          try {
            this.speechSource.buffer = this.speechBuffer;
          } catch {
            this.preloadAudio().then(() => {
              if (this.speechBuffer && this.audioCtx && this.isRendering) {
                const s = this.audioCtx.createBufferSource();
                s.buffer = this.speechBuffer;
                const g = this.audioCtx.createGain();
                g.gain.setValueAtTime(this.options.voiceBoost !== false ? 1.6 : 1.25, this.audioCtx.currentTime);
                s.connect(g);
                g.connect(this.audioCtx.destination);
                s.start(this.audioCtx.currentTime);
                this.speechSource = s;
                this.speechGain = g;
              }
            });
          }

          this.speechGain = this.audioCtx.createGain();
          const boost = this.options.voiceBoost !== false ? 1.6 : 1.25;
          this.speechGain.gain.setValueAtTime(boost, this.audioCtx.currentTime);

          this.speechSource.connect(this.speechGain);
          this.speechGain.connect(this.audioCtx.destination);
          this.speechSource.start(this.audioCtx.currentTime + 0.5);
        } else {
          // If speech is still fetching from Groq, start it immediately when buffer arrives!
          this.preloadAudio().then((ok) => {
            if (ok && this.isRendering && this.speechBuffer && this.audioCtx && !this.speechSource) {
              const now = this.audioCtx.currentTime;
              this.speechSource = this.audioCtx.createBufferSource();
              this.speechSource.buffer = this.speechBuffer;

              this.speechGain = this.audioCtx.createGain();
              const boost = this.options.voiceBoost !== false ? 1.6 : 1.25;
              this.speechGain.gain.setValueAtTime(boost, now);

              this.speechSource.connect(this.speechGain);
              this.speechGain.connect(this.audioCtx.destination);
              this.speechSource.start(now);
            }
          });
        }
      }
    }

    this.startTime = performance.now();
    this.isRendering = true;

    const loop = (now: number) => {
      if (!this.isRendering) return;
      const elapsed = (now - this.startTime) / 1000;

      this.drawFrame(elapsed);
      if (onProgress) onProgress(elapsed);

      if (elapsed < this.duration) {
        this.animationFrameId = requestAnimationFrame(loop);
      } else {
        this.stopAudio();
        this.isRendering = false;
        if (onEnded) onEnded();
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);

    return () => {
      this.isRendering = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.stopAudio();
    };
  }

  /**
   * Records exactly 10.0 seconds of canvas video + synthesized speech audio into an MP4/WebM Blob at high 8 Mbps bitrate.
   */
  public async exportVideo(
    onProgress?: (progressPercent: number) => void
  ): Promise<Blob> {
    this.stopAudio();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API not supported in this browser');
    }

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    } else if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // 1. Setup Audio Destination Stream with Broadcast Dynamics Compressor
    this.audioDest = this.audioCtx.createMediaStreamDestination();

    this.masterCompressor = this.audioCtx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-18, this.audioCtx.currentTime);
    this.masterCompressor.knee.setValueAtTime(24, this.audioCtx.currentTime);
    this.masterCompressor.ratio.setValueAtTime(10, this.audioCtx.currentTime);
    this.masterCompressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
    this.masterCompressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);
    this.masterCompressor.connect(this.audioDest);

    // Start ambient pad
    this.startAmbientPad(this.masterCompressor);

    // Guarantee speech buffer is ready
    if (!this.speechBuffer) {
      await this.preloadAudio();
    }

    if (this.speechBuffer) {
      this.speechSource = this.audioCtx.createBufferSource();
      try {
        this.speechSource.buffer = this.speechBuffer;
      } catch (err) {
        console.warn('[StatusVideoRenderer] exportVideo buffer refresh for current AudioContext:', err);
        await this.preloadAudio();
        if (this.speechBuffer) {
          this.speechSource.buffer = this.speechBuffer;
        }
      }

      this.speechGain = this.audioCtx.createGain();
      const boost = this.options.voiceBoost !== false ? 1.65 : 1.3;
      this.speechGain.gain.setValueAtTime(boost, this.audioCtx.currentTime);

      this.speechSource.connect(this.speechGain);
      this.speechGain.connect(this.audioDest);
      this.speechSource.start(this.audioCtx.currentTime + 0.5);
    }

    // 2. Setup Canvas Capture Stream (60fps)
    const canvasStream = (this.canvas as any).captureStream
      ? (this.canvas as any).captureStream(60)
      : (this.canvas as any).mozCaptureStream(60);

    const combinedTracks: MediaStreamTrack[] = [
      ...canvasStream.getVideoTracks(),
      ...this.audioDest.stream.getAudioTracks(),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // 3. Select Best Supported Codec (MP4 / WebM VP9 / WebM VP8)
    const mimeTypes = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }
    if (!selectedMime) selectedMime = 'video/webm';

    return new Promise((resolve, reject) => {
      try {
        const recorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 8_000_000, // 8 Mbps crystal clear
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          this.stopAudio();
          const finalBlob = new Blob(chunks, { type: selectedMime });
          resolve(finalBlob);
        };

        recorder.onerror = (e) => {
          this.stopAudio();
          reject(e);
        };

        recorder.start(100);

        // Animate canvas for 10.0 seconds
        const exportStart = performance.now();
        const exportDuration = this.duration * 1000;

        const recordLoop = () => {
          const elapsedMs = performance.now() - exportStart;
          const elapsedSec = elapsedMs / 1000;

          this.drawFrame(elapsedSec);

          if (onProgress) {
            const pct = Math.min(100, Math.floor((elapsedMs / exportDuration) * 100));
            onProgress(pct);
          }

          if (elapsedMs < exportDuration) {
            requestAnimationFrame(recordLoop);
          } else {
            recorder.stop();
          }
        };

        requestAnimationFrame(recordLoop);
      } catch (err) {
        this.stopAudio();
        reject(err);
      }
    });
  }
}
