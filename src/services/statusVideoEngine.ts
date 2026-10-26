/**
 * ADUBIBLE STATUS VIDEO ENGINE (60fps Canvas + 24kHz Neural Audio + MediaRecorder)
 * Generates pristine 10-second animated video status reels for WhatsApp, Instagram, TikTok, YouTube Shorts, X & Facebook.
 * Features kinetic typography, particle shaders, sacred 432Hz audio pad, and prominent Adubible.org watermark.
 */

import {
  synthesizeNeuralAudio,
  decodePcm24kToAudioBuffer,
  GoogleNeuralVoiceName,
} from './neuralTtsService';

export type VideoAspectRatio = '9:16' | '1:1' | '16:9';

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
    bgStart: '#0d0905',
    bgEnd: '#2c1808',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    textMain: '#fafaf9',
    textHighlight: '#fef08a',
    textSub: '#fde68a',
    particleColor: 'rgba(253, 230, 138, 0.65)',
    waveColor: '#f59e0b',
  },
  {
    id: 'candlelight',
    name: 'Sacred Flame & Parchment',
    description: 'Deep amber warmth and flickering holy sanctuary glow',
    bgStart: '#140c06',
    bgEnd: '#331b0c',
    accent: '#fb923c',
    accentGlow: 'rgba(251, 146, 60, 0.45)',
    textMain: '#fff7ed',
    textHighlight: '#fed7aa',
    textSub: '#fdba74',
    particleColor: 'rgba(254, 215, 170, 0.6)',
    waveColor: '#fb923c',
  },
  {
    id: 'clouds',
    name: 'Clouds of Glory',
    description: 'Ethereal rolling mist, heavenly azure & majestic peaks',
    bgStart: '#081426',
    bgEnd: '#162e4c',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    textMain: '#f0f9ff',
    textHighlight: '#bae6fd',
    textSub: '#7dd3fc',
    particleColor: 'rgba(186, 230, 253, 0.6)',
    waveColor: '#38bdf8',
  },
  {
    id: 'obsidian',
    name: 'Royal Obsidian & Gold Dust',
    description: 'Deep velvet night with shimmering celestial gold stars',
    bgStart: '#09080d',
    bgEnd: '#1e142b',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.4)',
    textMain: '#faf5ff',
    textHighlight: '#fde047',
    textSub: '#e9d5ff',
    particleColor: 'rgba(253, 224, 71, 0.65)',
    waveColor: '#c084fc',
  },
  {
    id: 'covenant',
    name: 'Covenant Living Waters',
    description: 'Emerald sanctuary with gentle aquatic ripples of grace',
    bgStart: '#041611',
    bgEnd: '#093326',
    accent: '#34d399',
    accentGlow: 'rgba(52, 211, 153, 0.45)',
    textMain: '#ecfdf5',
    textHighlight: '#a7f3d0',
    textSub: '#6ee7b7',
    particleColor: 'rgba(167, 243, 208, 0.65)',
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
}

export class StatusVideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 720;
  private height: number = 1280;
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
  private analyser: AnalyserNode | null = null;
  private speechBuffer: AudioBuffer | null = null;
  private speechSource: AudioBufferSourceNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private analyserData: Uint8Array | null = null;

  constructor(canvas: HTMLCanvasElement, options: StatusVideoOptions) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.options = options;
    this.duration = options.durationSeconds || 10.0;
    this.setDimensions(options.aspectRatio);
    this.prepareWords();
    this.initParticles();
  }

  public updateOptions(newOptions: Partial<StatusVideoOptions>): void {
    this.options = { ...this.options, ...newOptions };
    if (newOptions.aspectRatio) {
      this.setDimensions(newOptions.aspectRatio);
      this.initParticles();
    }
    if (newOptions.verseText !== undefined) {
      this.prepareWords();
    }
    if (newOptions.durationSeconds) {
      this.duration = newOptions.durationSeconds;
    }
  }

  private setDimensions(ratio: VideoAspectRatio): void {
    if (ratio === '9:16') {
      // 720x1280 crisp HD mobile status standard
      this.width = 720;
      this.height = 1280;
    } else if (ratio === '1:1') {
      this.width = 1080;
      this.height = 1080;
    } else {
      // 16:9 Landscape
      this.width = 1280;
      this.height = 720;
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
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 1.0,
        speedY: -(Math.random() * 0.4 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Pre-loads the neural speech audio into an AudioBuffer using AduBible's 24kHz Google Neural Audio engine.
   */
  public async preloadAudio(): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      } else if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const voice = this.options.voiceName || 'Charon';
      const lang = this.options.langCode || 'en';
      const base64Audio = await synthesizeNeuralAudio(this.options.verseText, lang, voice);
      this.speechBuffer = decodePcm24kToAudioBuffer(this.audioCtx, base64Audio);
      return true;
    } catch (err) {
      console.warn('[StatusVideoEngine] Speech preload non-fatal notice:', err);
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
      // Gentle swell to 0.12 (warm, quiet underneath voice)
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, now + 1.5);
      this.ambientGain.connect(destNode);

      // Sacred C major 432Hz tuned chord: C3 (129.6Hz), G3 (194.4Hz), C4 (259.2Hz), E4 (324.0Hz)
      const frequencies = [129.6, 194.4, 259.2, 324.0];
      this.ambientOscillators = [];

      for (const freq of frequencies) {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle subtle vibrato / detuning for sacred warmth
        const detune = (Math.random() - 0.5) * 4;
        osc.detune.setValueAtTime(detune, now);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

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
    } catch {}
  }

  /**
   * Draws a single frame at timestamp `elapsedSeconds`.
   */
  public drawFrame(elapsed: number): void {
    const W = this.width;
    const H = this.height;
    const ctx = this.ctx;
    const theme = this.options.theme;
    const progress = Math.min(1.0, elapsed / this.duration);

    // 1. Background Cinematic Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(0.5, theme.bgEnd);
    bgGrad.addColorStop(1, theme.bgStart);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Divine Ray / Ambient Glow from Top
    const rayPulse = 0.85 + Math.sin(elapsed * 1.8) * 0.15;
    const radialGlow = ctx.createRadialGradient(W / 2, H * 0.15, 20, W / 2, H * 0.35, W * 0.8);
    radialGlow.addColorStop(0, theme.accentGlow);
    radialGlow.addColorStop(0.6, 'rgba(0,0,0,0)');
    ctx.fillStyle = radialGlow;
    ctx.globalAlpha = rayPulse;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1.0;

    // 3. Shimmering Floating Particles (Divine Dust)
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(elapsed * 2 + p.phase) * 0.25;
      if (p.y < 0) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
      const alpha = (p.alpha + Math.sin(elapsed * 3 + p.phase) * 0.2) * p.maxAlpha;
      ctx.fillStyle = theme.particleColor;
      ctx.globalAlpha = Math.max(0.05, Math.min(0.9, alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 4. Subtle Luxury Border & Corner Accents
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Corner Ornaments
    const cornerSize = 24;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(28, 28 + cornerSize);
    ctx.lineTo(28, 28);
    ctx.lineTo(28 + cornerSize, 28);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(W - 28 - cornerSize, 28);
    ctx.lineTo(W - 28, 28);
    ctx.lineTo(W - 28, 28 + cornerSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(28, H - 28 - cornerSize);
    ctx.lineTo(28, H - 28);
    ctx.lineTo(28 + cornerSize, H - 28);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(W - 28 - cornerSize, H - 28);
    ctx.lineTo(W - 28, H - 28);
    ctx.lineTo(W - 28, H - 28 - cornerSize);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 5. Header Sanctuary Badge
    const headerFade = Math.min(1.0, elapsed / 0.8);
    ctx.save();
    ctx.globalAlpha = headerFade;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '700 13px Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('✦ ADUBIBLE • SCRIPTURE SANCTUARY ✦', W / 2, 74);

    // Reference Pill & Translation
    const refText = `${this.options.reference.toUpperCase()} • ${this.options.versionName}`;
    ctx.font = '700 24px Georgia, serif';
    ctx.fillStyle = theme.textMain;
    ctx.shadowColor = theme.accentGlow;
    ctx.shadowBlur = 12;
    ctx.fillText(refText, W / 2, 115);
    ctx.shadowBlur = 0;
    ctx.restore();

    // 6. Kinetic Typography (Scripture Text Pacing)
    // Words reveal smoothly between 1.0s and 8.2s, then hold radiant until 10.0s
    const textStartTime = 1.0;
    const textEndTime = 8.2;
    const activeTextDuration = textEndTime - textStartTime;

    const totalWords = this.words.length;
    let revealedWordCount = totalWords;
    if (elapsed < textStartTime) {
      revealedWordCount = 0;
    } else if (elapsed < textEndTime) {
      const textProgress = (elapsed - textStartTime) / activeTextDuration;
      revealedWordCount = Math.floor(textProgress * totalWords) + 1;
      revealedWordCount = Math.min(totalWords, Math.max(1, revealedWordCount));
    }

    // Measure and render wrapped scripture text centered vertically
    const maxTextWidth = W - 110;
    const fontSize = this.computeOptimalFontSize(maxTextWidth, H * 0.48);
    const lineHeight = fontSize * 1.5;

    ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'center';

    // Break into lines
    const lines: { text: string; wordsInLine: { word: string; index: number }[] }[] = [];
    let currentLineWords: { word: string; index: number }[] = [];
    let currentLineText = '';

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

    // Vertically center the text block in the upper-mid area
    const totalBlockHeight = lines.length * lineHeight;
    const startY = Math.max(170, (H - totalBlockHeight) / 2 - 30);

    lines.forEach((lineObj, lineIdx) => {
      const lineY = startY + lineIdx * lineHeight;

      // Draw word by word in line to apply kinetic reveal & active highlight
      const lineTotalWidth = ctx.measureText(lineObj.text).width;
      let curX = (W - lineTotalWidth) / 2;

      for (const item of lineObj.wordsInLine) {
        const isRevealed = item.index < revealedWordCount;
        const isCurrentActive = item.index === revealedWordCount - 1 && elapsed < textEndTime;

        ctx.save();
        if (!isRevealed) {
          // Dim / hidden word
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = theme.textMain;
        } else if (isCurrentActive) {
          // Active speaking word glow
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = theme.textHighlight;
          ctx.shadowColor = theme.accent;
          ctx.shadowBlur = 18;
        } else {
          // Already read word
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = theme.textMain;
        }

        ctx.textAlign = 'left';
        ctx.fillText(item.word, curX, lineY);
        ctx.restore();

        const wordWidth = ctx.measureText(item.word + ' ').width;
        curX += wordWidth;
      }
    });

    // 7. Secondary Translation Excerpt (if parallel study selected)
    if (this.options.secondaryText && this.options.secondaryVersionName) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textSub;
      ctx.globalAlpha = Math.min(0.85, Math.max(0, (elapsed - 2.5) / 1.5));
      ctx.font = 'italic 16px Georgia, serif';
      const secExcerpt = `"${this.options.secondaryText.slice(0, 95)}..." — ${this.options.secondaryVersionName}`;
      ctx.fillText(secExcerpt, W / 2, startY + totalBlockHeight + 40);
      ctx.restore();
    }

    // 8. Animated Waveform Audio Visualizer (Live audio pulse)
    this.drawAudioVisualizer(elapsed, W, H, theme);

    // 9. 10-Second Progress Line
    const progressBarY = H - 98;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(48, progressBarY, W - 96, 3);
    ctx.fillStyle = theme.accent;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 8;
    ctx.fillRect(48, progressBarY, (W - 96) * progress, 3);
    ctx.shadowBlur = 0;

    // Time Indicator (0:00 / 0:10)
    const curSec = Math.min(10, Math.floor(elapsed));
    const timeStr = `0:0${curSec} / 0:10`;
    ctx.fillStyle = theme.textSub;
    ctx.font = '600 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, W - 52, progressBarY - 8);

    // 10. LUXURY PERMANENT WATERMARK OF ADUBIBLE.ORG (The Golden Requirement)
    this.drawLuxuryWatermark(W, H, theme, elapsed);
  }

  private computeOptimalFontSize(maxWidth: number, maxHeight: number): number {
    // Dynamic sizing based on length of text
    const textLen = this.options.verseText.length;
    if (textLen < 60) return Math.min(36, Math.floor(maxWidth / 12));
    if (textLen < 120) return Math.min(28, Math.floor(maxWidth / 15));
    if (textLen < 220) return Math.min(24, Math.floor(maxWidth / 18));
    return Math.min(20, Math.max(16, Math.floor(maxWidth / 22)));
  }

  private drawAudioVisualizer(
    elapsed: number,
    W: number,
    H: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    const barCount = 36;
    const waveY = H - 128;
    const totalWaveWidth = W - 180;
    const barWidth = totalWaveWidth / barCount - 2;

    ctx.save();
    ctx.fillStyle = theme.waveColor;

    for (let i = 0; i < barCount; i++) {
      // Harmonic procedural pulse or real analyser data
      const norm = Math.sin((i / barCount) * Math.PI);
      const wavePhase = elapsed * 5 + i * 0.35;
      const heightMultiplier = Math.sin(wavePhase) * 0.5 + 0.5;
      const barHeight = Math.max(3, norm * heightMultiplier * 26 + Math.cos(elapsed * 3 + i) * 6);

      const x = W / 2 - totalWaveWidth / 2 + i * (barWidth + 2);
      ctx.globalAlpha = 0.4 + norm * 0.45;
      ctx.fillRect(x, waveY - barHeight / 2, barWidth, barHeight);
    }
    ctx.restore();
  }

  /**
   * Prominently and elegantly renders the official Adubible.org Watermark
   * Guarantees that when shared to WhatsApp Status, Facebook, X, or TikTok, viewers immediately see Adubible.org!
   */
  private drawLuxuryWatermark(
    W: number,
    H: number,
    theme: StatusVideoTheme,
    elapsed: number
  ): void {
    const ctx = this.ctx;
    const watermarkY = H - 52;
    const watermarkPulse = 0.9 + Math.sin(elapsed * 2) * 0.1;

    ctx.save();
    ctx.textAlign = 'center';

    // Golden Halo Glow under watermark pill
    const pillWidth = 320;
    const pillHeight = 32;
    const pillX = (W - pillWidth) / 2;
    const pillY = watermarkY - 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 16);
    ctx.fill();

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 16);
    ctx.stroke();

    // Text: ADUBIBLE.ORG
    ctx.globalAlpha = watermarkPulse;
    ctx.fillStyle = theme.accent;
    ctx.font = '700 13px Georgia, serif';
    ctx.letterSpacing = '2px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    ctx.fillText('✦ ADUBIBLE.ORG • FREE SANCTUARY ✦', W / 2, watermarkY);
    ctx.shadowBlur = 0;

    // Subtitle tagline
    ctx.font = '600 10px sans-serif';
    ctx.fillStyle = theme.textSub;
    ctx.globalAlpha = 0.8;
    ctx.fillText('Read & Listen in 35+ Languages & Twi', W / 2, watermarkY + 14);

    ctx.restore();
  }

  /**
   * Plays the live 10-second preview on the canvas with audio.
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
        // Play ambient pad through speakers
        this.startAmbientPad(this.audioCtx.destination);

        // Play speech buffer through speakers if available
        if (this.speechBuffer) {
          this.speechSource = this.audioCtx.createBufferSource();
          this.speechSource.buffer = this.speechBuffer;
          this.speechSource.connect(this.audioCtx.destination);
          this.speechSource.start(this.audioCtx.currentTime + 0.8);
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
   * Records exactly 10.0 seconds of canvas video + synthesized audio into an MP4/WebM Blob.
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

    // 1. Setup Audio Destination Stream
    this.audioDest = this.audioCtx.createMediaStreamDestination();
    this.startAmbientPad(this.audioDest);

    if (this.speechBuffer) {
      this.speechSource = this.audioCtx.createBufferSource();
      this.speechSource.buffer = this.speechBuffer;
      this.speechSource.connect(this.audioDest);
      this.speechSource.start(this.audioCtx.currentTime + 0.8);
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
          videoBitsPerSecond: 6_000_000, // 6 Mbps crystal clear
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          this.stopAudio();
          const finalBlob = new Blob(chunks, { type: selectedMime });
          resolve(finalBlob);
        };

        recorder.onerror = (err) => {
          this.stopAudio();
          reject(err);
        };

        recorder.start(100); // 100ms slice chunks

        const recordStart = performance.now();
        const durationMs = this.duration * 1000;

        const recordLoop = (now: number) => {
          const elapsedMs = now - recordStart;
          const elapsedSec = elapsedMs / 1000;
          const pct = Math.min(100, Math.round((elapsedMs / durationMs) * 100));

          this.drawFrame(elapsedSec);
          if (onProgress) onProgress(pct);

          if (elapsedMs < durationMs) {
            requestAnimationFrame(recordLoop);
          } else {
            recorder.stop();
          }
        };

        requestAnimationFrame(recordLoop);
      } catch (recErr) {
        this.stopAudio();
        reject(recErr);
      }
    });
  }

  public destroy(): void {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stopAudio();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
    }
  }
}
