/**
 * ADUBIBLE STATUS VIDEO ENGINE (60fps Canvas + 24kHz Neural Audio + MediaRecorder)
 * Generates pristine 10-second animated video status reels for WhatsApp, Instagram, TikTok, YouTube Shorts, X & Facebook.
 * Features 3:4 High-Impact Portrait Ratio, Illuminated Scripture Plaque, Kinetic Typography, 432Hz Sacred Pad, and Adubible.org Watermark.
 */

import {
  synthesizeNeuralAudio,
  decodePcm24kToAudioBuffer,
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
    bgStart: '#120a05',
    bgEnd: '#30180a',
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
    bgStart: '#061020',
    bgEnd: '#132842',
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
    bgStart: '#08060c',
    bgEnd: '#1a1026',
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
    bgStart: '#03120e',
    bgEnd: '#082b20',
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
    if (ratio === '3:4') {
      // 1080x1440 Crisp QHD Portrait (Social Feeds, Reels, WhatsApp Status)
      this.width = 1080;
      this.height = 1440;
    } else if (ratio === '9:16') {
      // 1080x1920 Full HD Vertical Story/Reel
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
    const count = 60;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.8 + 1.2,
        speedY: -(Math.random() * 0.5 + 0.25),
        speedX: (Math.random() - 0.5) * 0.35,
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
      if (base64Audio) {
        this.speechBuffer = decodePcm24kToAudioBuffer(this.audioCtx, base64Audio);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[StatusVideoEngine] Speech preload notice:', err);
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
      // Gentle swell to warm, quiet underneath voice
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, now + 1.5);
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
   * High-impact 3:4 & 9:16 layout with illuminated scripture plaque, kinetic gold typography, and luxury watermark.
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
    const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    // 3. Divine Celestial God-Ray Bloom from Top Center
    const rayPulse = 0.85 + Math.sin(elapsed * 1.8) * 0.15;
    const radialGlow = ctx.createRadialGradient(W / 2, H * 0.12, 30, W / 2, H * 0.38, W * 0.85);
    radialGlow.addColorStop(0, theme.accentGlow);
    radialGlow.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.globalAlpha = rayPulse;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1.0;

    // 4. Shimmering Floating Divine Dust & Embers
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += Math.sin(elapsed * 2 + p.phase) * 0.3;
      if (p.y < 0) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
      const alpha = (p.alpha + Math.sin(elapsed * 3 + p.phase) * 0.2) * p.maxAlpha;
      ctx.fillStyle = theme.particleColor;
      ctx.globalAlpha = Math.max(0.08, Math.min(0.9, alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 5. Luxury Regal Outer Hairline Frame & Corner Brackets
    const frameInset = 34;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(frameInset, frameInset, W - frameInset * 2, H - frameInset * 2);

    // Delicate inner hairline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(frameInset + 8, frameInset + 8, W - (frameInset + 8) * 2, H - (frameInset + 8) * 2);

    // Corner Ornaments
    const cornerSize = 32;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;

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
    ctx.globalAlpha = 1.0;

    // 6. Top Sanctuary Masthead
    const headerFade = Math.min(1.0, elapsed / 0.6);
    ctx.save();
    ctx.globalAlpha = headerFade;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '700 15px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '4px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 8;
    ctx.fillText('✦ ADUBIBLE • SCRIPTURE SANCTUARY ✦', W / 2, 76);
    ctx.shadowBlur = 0;

    ctx.font = '600 11px sans-serif';
    ctx.fillStyle = theme.textSub;
    ctx.letterSpacing = '2.5px';
    ctx.globalAlpha = headerFade * 0.75;
    ctx.fillText('THE LIVING WORD • PARALLEL REEL', W / 2, 98);
    ctx.restore();

    // 7. Calculate Typography & Kinetic Plaque Dimensions
    const plaqueMargin = Math.max(50, Math.floor(W * 0.06));
    const plaqueW = W - plaqueMargin * 2;
    const maxTextWidth = plaqueW - 100;

    // Dynamic High-Impact Font Sizing (Tuned for 1080p canvas)
    const textLen = this.options.verseText.length;
    let fontSize = 48;
    if (textLen < 60) fontSize = 56;
    else if (textLen < 120) fontSize = 46;
    else if (textLen < 200) fontSize = 40;
    else if (textLen < 320) fontSize = 34;
    else fontSize = 28;

    if (H <= 1080) {
      fontSize = Math.floor(fontSize * 0.88);
    }
    const lineHeight = Math.round(fontSize * 1.55);

    const serifStack = '"Cinzel", "Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif';
    ctx.font = `600 ${fontSize}px ${serifStack}`;

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

    // Compute Plaque Height & Vertical Centering
    const topQuoteH = 46;
    const spacingUnderQuote = 20;
    const spacingUnderText = 24;
    const dividerH = 22;
    const refH = 34;
    const versionH = 22;
    const secondaryH = hasSecondary ? 46 : 0;
    const plaquePaddingTop = 40;
    const plaquePaddingBottom = 38;

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

    const topSafeZone = 126;
    const bottomSafeZone = 190;
    const availableMidHeight = H - topSafeZone - bottomSafeZone;
    const plaqueX = plaqueMargin;
    const plaqueY = Math.max(topSafeZone + 10, topSafeZone + (availableMidHeight - plaqueH) / 2);

    // 8. Draw Central Illuminated Scripture Plaque / Card
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 10;

    // Glassmorphic Plaque Background
    const plaqueGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
    plaqueGrad.addColorStop(0, 'rgba(12, 9, 6, 0.75)');
    plaqueGrad.addColorStop(0.5, 'rgba(22, 16, 10, 0.82)');
    plaqueGrad.addColorStop(1, 'rgba(12, 9, 6, 0.75)');
    ctx.fillStyle = plaqueGrad;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 26);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Golden Filigree Plaque Border
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.75;
    ctx.globalAlpha = 0.45;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 26);
    ctx.stroke();

    // Inner Delicate Filament
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    drawRoundedRect(ctx, plaqueX + 6, plaqueY + 6, plaqueW - 12, plaqueH - 12, 20);
    ctx.stroke();
    ctx.restore();

    // 9. Decorative Opening Quote Mark Inside Plaque
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '700 52px Georgia, serif';
    ctx.globalAlpha = 0.75;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 14;
    ctx.fillText('“', W / 2, plaqueY + plaquePaddingTop + 30);
    ctx.restore();

    // 10. Kinetic Typography Rendering
    const textStartTime = 0.8;
    const textEndTime = 8.2;
    const activeTextDuration = textEndTime - textStartTime;

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

      ctx.font = `600 ${fontSize}px ${serifStack}`;
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
          // Glorious synchronized holding finale
          const holdPulse = Math.sin((elapsed - textEndTime) * 4) * 0.08;
          ctx.globalAlpha = 0.95 + holdPulse;
          ctx.fillStyle = theme.textMain;
          ctx.shadowColor = theme.accent;
          ctx.shadowBlur = 14;
        } else if (isCurrentActive) {
          // Active spoken word: radiant golden sunlight
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = theme.textHighlight;
          ctx.shadowColor = theme.accent;
          ctx.shadowBlur = 24;

          // Glowing underline beneath active word
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(curX, lineY + 6);
          ctx.lineTo(curX + item.width, lineY + 6);
          ctx.stroke();
        } else if (isRevealed) {
          // Already read word: crisp luminous cream
          ctx.globalAlpha = 0.98;
          ctx.fillStyle = theme.textMain;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 8;
        } else {
          // Unrevealed word: elegant readable parchment
          ctx.globalAlpha = 0.38;
          ctx.fillStyle = theme.textMain;
        }

        ctx.fillText(item.word, curX, lineY);
        ctx.restore();

        curX += item.width + spaceWidth;
      });
    });

    // 11. Ornate Divider Inside Plaque
    const dividerY = textStartY + totalTextHeight + spacingUnderText - 6;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '600 15px sans-serif';
    ctx.letterSpacing = '4px';
    ctx.globalAlpha = 0.65;
    ctx.fillText('━━━━ ✦ ━━━━', W / 2, dividerY);
    ctx.restore();

    // 12. Scripture Reference & Translation Attribution
    const refY = dividerY + refH;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = '700 28px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '4px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 12;
    ctx.fillText(this.options.reference.toUpperCase(), W / 2, refY);
    ctx.shadowBlur = 0;

    // Translation name
    ctx.font = '700 13px sans-serif';
    ctx.fillStyle = theme.textSub;
    ctx.letterSpacing = '2.5px';
    ctx.globalAlpha = 0.85;
    const versionLabel = this.options.versionName.toUpperCase();
    ctx.fillText(versionLabel, W / 2, refY + versionH);
    ctx.restore();

    // 13. Secondary Translation Excerpt (if parallel study selected)
    if (hasSecondary && this.options.secondaryText) {
      const secY = refY + versionH + 34;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textSub;
      ctx.globalAlpha = Math.min(0.85, Math.max(0, (elapsed - 2.0) / 1.5));
      ctx.font = 'italic 18px Georgia, serif';
      const cleanSec = this.options.secondaryText.slice(0, 85).trim();
      const secExcerpt = `"${cleanSec}..." — ${this.options.secondaryVersionName}`;
      ctx.fillText(secExcerpt, W / 2, secY);
      ctx.restore();
    }

    // 14. Animated Waveform Audio Visualizer (Live audio pulse)
    const waveY = Math.min(H - 128, plaqueY + plaqueH + 42);
    this.drawAudioVisualizer(elapsed, W, waveY, theme);

    // 15. 10-Second Golden Progress Rail
    const progressBarY = H - 86;
    const barMargin = Math.max(60, Math.floor(W * 0.08));
    const barWidth = W - barMargin * 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(barMargin, progressBarY, barWidth, 3);

    ctx.fillStyle = theme.accent;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 8;
    ctx.fillRect(barMargin, progressBarY, barWidth * progress, 3);
    ctx.shadowBlur = 0;

    // Time Indicator (0:00 / 0:10)
    const curSec = Math.min(10, Math.floor(elapsed));
    const timeStr = `0:0${curSec} / 0:10`;
    ctx.fillStyle = theme.textSub;
    ctx.font = '600 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, barMargin + barWidth, progressBarY - 8);

    // 16. LUXURY PERMANENT WATERMARK OF ADUBIBLE.ORG
    this.drawLuxuryWatermark(W, H, theme, elapsed);
  }

  private drawAudioVisualizer(
    elapsed: number,
    W: number,
    waveY: number,
    theme: StatusVideoTheme
  ): void {
    const ctx = this.ctx;
    const barCount = 32;
    const totalWaveWidth = Math.min(W - 200, 440);
    const spacing = 4;
    const barWidth = (totalWaveWidth - spacing * (barCount - 1)) / barCount;

    ctx.save();
    ctx.fillStyle = theme.waveColor;

    for (let i = 0; i < barCount; i++) {
      const norm = Math.sin((i / (barCount - 1)) * Math.PI);
      const wavePhase = elapsed * 5.5 + i * 0.4;
      const heightMultiplier = Math.sin(wavePhase) * 0.5 + 0.5;
      const barHeight = Math.max(4, norm * heightMultiplier * 32 + Math.cos(elapsed * 3.2 + i * 0.8) * 6);

      const x = W / 2 - totalWaveWidth / 2 + i * (barWidth + spacing);
      ctx.globalAlpha = 0.45 + norm * 0.45;
      drawRoundedRect(ctx, x, waveY - barHeight / 2, barWidth, barHeight, barWidth / 2);
      ctx.fill();
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
    const watermarkY = H - 42;
    const watermarkPulse = 0.92 + Math.sin(elapsed * 2) * 0.08;

    ctx.save();
    ctx.textAlign = 'center';

    const pillWidth = 370;
    const pillHeight = 34;
    const pillX = (W - pillWidth) / 2;
    const pillY = watermarkY - 22;

    // Dark glass pill backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 17);
    ctx.fill();

    // Golden halo rim
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.25;
    ctx.globalAlpha = 0.7;
    drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 17);
    ctx.stroke();

    // Main Brand: ADUBIBLE.ORG
    ctx.globalAlpha = watermarkPulse;
    ctx.fillStyle = theme.accent;
    ctx.font = '700 13px "Cinzel", Georgia, serif';
    ctx.letterSpacing = '2.5px';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    ctx.fillText('✦ ADUBIBLE.ORG • FREE SCRIPTURE SANCTUARY ✦', W / 2, watermarkY - 4);
    ctx.shadowBlur = 0;

    // Subtitle tagline
    ctx.font = '600 9.5px sans-serif';
    ctx.fillStyle = theme.textSub;
    ctx.letterSpacing = '1px';
    ctx.globalAlpha = 0.85;
    ctx.fillText('Read & Listen in 35+ Global Languages', W / 2, watermarkY + 9);

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
        this.startAmbientPad(this.audioCtx.destination);

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
   * Records exactly 10.0 seconds of canvas video + synthesized audio into an MP4/WebM Blob at high 8 Mbps bitrate.
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
          videoBitsPerSecond: 8_000_000, // 8 Mbps crystal clear
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

        recorder.start(100);

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
