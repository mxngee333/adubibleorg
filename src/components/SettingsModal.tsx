import React, { useState } from 'react';
import { ReadingPreferences, CustomThemePalette, UserProfile } from '../types/bible';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  clearTtsAudioCache,
} from '../services/neuralTtsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: ReadingPreferences;
  onUpdatePrefs: (next: Partial<ReadingPreferences>) => void;
  onOpenLanguageAddonModal: () => void;
  user?: UserProfile | null;
  initialSection?: 'general' | 'theme' | 'commentaries' | 'api';
}

const PRESET_CUSTOM_PALETTES: Array<{
  name: string;
  icon: string;
  palette: CustomThemePalette;
}> = [
  {
    name: 'Midnight Navy & Gold (Symbol)',
    icon: '🏛️',
    palette: {
      id: 'symbol-midnight-gold',
      name: 'Midnight Navy & Antique Gold',
      paper: '#0b141f',
      surface: '#15283c',
      ink: '#fdfbf7',
      subtle: '#c5a059',
      line: 'rgba(189, 145, 63, 0.28)',
      accent: '#bd913f',
      isDark: true,
    },
  },
  {
    name: 'Wisdom Pine Legacy',
    icon: '🌲',
    palette: {
      id: 'wisdom-pine-legacy',
      name: 'Wisdom Pine Legacy',
      paper: '#20271f',
      surface: '#171d17',
      ink: '#e3e6d8',
      subtle: '#a5ae9e',
      line: '#394435',
      accent: '#b7c99f',
      isDark: true,
    },
  },
  {
    name: 'Emerald Sanctuary',
    icon: '🌿',
    palette: {
      id: 'emerald-sanctuary',
      name: 'Emerald Sanctuary',
      paper: '#071b12',
      surface: '#03100a',
      ink: '#ecfdf5',
      subtle: '#a7f3d0',
      line: 'rgba(16, 185, 129, 0.3)',
      accent: '#10b981',
      isDark: true,
    },
  },
  {
    name: 'Rose Gold Covenant',
    icon: '🌹',
    palette: {
      id: 'rose-gold',
      name: 'Rose Gold Covenant',
      paper: '#1a0d14',
      surface: '#12070c',
      ink: '#fff1f2',
      subtle: '#fecdd3',
      line: 'rgba(244, 63, 94, 0.3)',
      accent: '#fb7185',
      isDark: true,
    },
  },
  {
    name: 'Cedar of Lebanon',
    icon: '🌲',
    palette: {
      id: 'cedar-lebanon',
      name: 'Cedar of Lebanon',
      paper: '#181a13',
      surface: '#0f110c',
      ink: '#f7fee7',
      subtle: '#d9f99d',
      line: 'rgba(132, 204, 22, 0.3)',
      accent: '#a3e635',
      isDark: true,
    },
  },
  {
    name: 'Midnight Cobalt',
    icon: '🌌',
    palette: {
      id: 'midnight-cobalt',
      name: 'Midnight Cobalt',
      paper: '#0b1329',
      surface: '#060a17',
      ink: '#f8fafc',
      subtle: '#94a3b8',
      line: 'rgba(59, 130, 246, 0.3)',
      accent: '#60a5fa',
      isDark: true,
    },
  },
  {
    name: 'Antique Vellum (Light)',
    icon: '📜',
    palette: {
      id: 'antique-vellum',
      name: 'Antique Vellum',
      paper: '#fdfbf7',
      surface: '#f4ede1',
      ink: '#292524',
      subtle: '#78716c',
      line: 'rgba(120, 113, 108, 0.25)',
      accent: '#b45309',
      isDark: false,
    },
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prefs,
  onUpdatePrefs,
  onOpenLanguageAddonModal,
  user,
  initialSection = 'general',
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiKey());
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string>('');
  const [cacheNotice, setCacheNotice] = useState<string>('');
  const [showCustomStudio, setShowCustomStudio] = useState<boolean>(
    prefs.theme === 'custom'
  );

  React.useEffect(() => {
    if (isOpen && initialSection === 'theme') {
      const el = document.getElementById('settings-theme-section');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    }
  }, [isOpen, initialSection]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCustomTheme: CustomThemePalette = prefs.customTheme || {
    id: 'custom-user',
    name: 'My Sacred Palette',
    paper: '#181424',
    surface: '#100c1c',
    ink: '#f5f0fa',
    subtle: '#b1a1c9',
    line: 'rgba(192, 132, 252, 0.25)',
    accent: '#c084fc',
    isDark: true,
  };

  const handleUpdateCustomColor = (key: keyof CustomThemePalette, val: any) => {
    const updated: CustomThemePalette = {
      ...currentCustomTheme,
      [key]: val,
    };
    onUpdatePrefs({
      theme: 'custom',
      customTheme: updated,
    });
  };

  const handleApplyPreset = (preset: CustomThemePalette) => {
    onUpdatePrefs({
      theme: 'custom',
      customTheme: preset,
    });
  };

  const handleSaveKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setKeyNotice(
      apiKeyInput.trim()
        ? '✅ Custom Gemini key saved! 24kHz Google Neural Audio unlocked.'
        : 'Custom key removed. Using instant Natural Voice Narration.'
    );
    setTimeout(() => setKeyNotice(''), 3000);
  };

  const handleClearCache = async () => {
    await clearTtsAudioCache();
    setCacheNotice('Audio cache cleared (0 bytes)');
    setTimeout(() => setCacheNotice(''), 3000);
  };

  const isNight =
    prefs.theme !== 'parchment' &&
    prefs.theme !== 'daylight' &&
    prefs.theme !== 'lilac-light' &&
    (prefs.theme !== 'custom' || (prefs.customTheme?.isDark ?? true));

  return (
    <div
      className="picker-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Reading Settings"
      onClick={onClose}
    >
      <div
        className="picker-dialog"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="picker-head">
          <div>
            <span className="eyebrow">READING SANCTUARY SETTINGS</span>
            <h3>Fluid Reading &amp; Study Controls</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'var(--soft)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ✕ Close
          </button>
        </div>

        <p
          style={{
            margin: '0 0 18px',
            fontSize: '14px',
            lineHeight: 1.55,
            color: 'var(--subtle)',
          }}
        >
          Strong’s Concordance and Open-Source Commentaries are turned <strong>OFF by default</strong> so your parallel reading stays 100% fluid and distraction-free. Turn them on anytime below.
        </p>

        <div className="picker-groups">
          {/* 1. Exegetical Study Tools (Default OFF) */}
          <div className="picker-group">
            <div className="picker-language">Exegetical Study Layers (Default: Off for Fluid Reading)</div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                    Strong’s Exhaustive Concordance &amp; Interlinear
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                    Show clickable Hebrew/Greek Strong’s numbers (G2128, G5485, H430), transliterations, and Twi root glosses under verses.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.showStrongsInline}
                  className={`wisdom-toggle ${prefs.showStrongsInline ? 'on' : ''}`}
                  onClick={() => onUpdatePrefs({ showStrongsInline: !prefs.showStrongsInline })}
                >
                  <span className="wisdom-toggle-knob" />
                </button>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                    Open-Source Commentaries &amp; Cross-References
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                    Display Matthew Henry, Jamieson-Fausset-Brown, John Gill, Geneva 1599, TSK Cross-References, and Twi Synthesis below the chapter.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.showCommentaries}
                  className={`wisdom-toggle ${prefs.showCommentaries ? 'on' : ''}`}
                  onClick={() => onUpdatePrefs({ showCommentaries: !prefs.showCommentaries })}
                >
                  <span className="wisdom-toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Reading Appearance & Theme */}
          <div className="picker-group" id="settings-theme-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="picker-language">Appearance, Palettes &amp; Themes</div>
              <div
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: 'var(--soft)',
                  color: 'var(--green)',
                  border: '1px solid var(--line)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {user ? `☁️ Cloud Synced (${user.displayName || user.email?.split('@')[0]})` : '💾 Synced Locally (Persistent)'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {/* Option 1: Wisdom Bible Legacy (Default) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'wisdom-legacy' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'wisdom-legacy' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/wisdom-legacy-banner.png"
                  alt="Wisdom Bible Legacy"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #b7c99f',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(67, 85, 59, 0.45)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>🌿 Wisdom Bible Legacy</strong>
                    <span style={{ fontSize: '11px', color: '#b7c99f', fontWeight: 700 }}>DEFAULT</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Authentic original edition · Contemplative deep pine (#171d17), warm ivory script (#e3e6d8) &amp; luminous sage (#b7c99f)
                  </span>
                </div>
              </button>

              {/* Option: Midnight Navy & Antique Gold (Symbol Edition) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'symbol-midnight-gold' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'symbol-midnight-gold' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/brand/icon-128.png"
                  alt="Midnight Navy & Antique Gold"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    background: '#0b141f',
                    padding: '4px',
                    border: '1px solid #bd913f',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(189, 145, 63, 0.35)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>🏛️ Midnight Navy &amp; Antique Gold</strong>
                    <span style={{ fontSize: '11px', color: '#bd913f', fontWeight: 700 }}>SYMBOL</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Symbol Edition · Signature Midnight Navy (#15283C), Pure Ivory Scripture &amp; Antique Gold wave (#BD913F)
                  </span>
                </div>
              </button>

              {/* Option 2: Royal Tyrian Velvet (Purple Majesty Dark) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'royal-purple' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'royal-purple' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/royal-open-bible.png"
                  alt="Royal Velvet"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #c084fc',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.35)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>👑 Royal Tyrian Velvet</strong>
                    <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700 }}>DARK</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Deep imperial violet, alabaster silk script &amp; 3D open Scripture with gold ribbon
                  </span>
                </div>
              </button>

              {/* Option 2: Sacred Lilac Parchment (Purple Light) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'lilac-light' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'lilac-light' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/lilac-bible.png"
                  alt="Sacred Lilac"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #7e22ce',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(126, 34, 206, 0.2)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>🌸 Sacred Lilac Parchment</strong>
                    <span style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 700 }}>LIGHT</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Holy morning lavender paper, cross emblem &amp; deep aubergine ink
                  </span>
                </div>
              </button>

              {/* Option 3: Burgundy Red Leather & Gold KJV */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'burgundy-gold' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'burgundy-gold' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/burgundy-kjv-bible.png"
                  alt="Burgundy KJV"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #f59e0b',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(185, 28, 28, 0.35)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>📖 Burgundy Leather KJV</strong>
                    <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>HEIRLOOM</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Classic KJV embossed wine leather, gilded gold leaf edges &amp; warm cream script
                  </span>
                </div>
              </button>

              {/* Option 4: AduBible SI Sovereign Gold */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'adubible-si' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'adubible-si' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/adubible-si-banner.png"
                  alt="AduBible SI"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #d4af37',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>⚡ AduBible SI Sovereign</strong>
                    <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: 700 }}>OFFICIAL</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Pitch obsidian black, sovereign circular emblem gold &amp; ivory Scripture
                  </span>
                </div>
              </button>

              {/* Option 5: Sacred Architect & Royal Maroon */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'architect-gold' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'architect-gold' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/architect-gold-bible.png"
                  alt="Sacred Architect"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #c89e34',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(200, 158, 52, 0.35)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>📐 Sacred Architect Maroon</strong>
                    <span style={{ fontSize: '11px', color: '#c89e34', fontWeight: 700 }}>MASON</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Imperial maroon leather (#200813), compass sacred geometry &amp; gold leaf
                  </span>
                </div>
              </button>

              {/* Option 6: Covenant Atlas (Scripture Compass) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'covenant-atlas' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'covenant-atlas' })}
                style={{ textAlign: 'left', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <img
                  src="/themes/covenant-atlas.png"
                  alt="Covenant Atlas"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #2dd4bf',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(45, 212, 191, 0.35)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <strong style={{ fontSize: '13px' }}>🧭 Covenant Atlas</strong>
                    <span style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 700 }}>NAVIGATOR</span>
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                    Scripture compass: abyssal slate, terracotta star &amp; emerald sea teal
                  </span>
                </div>
              </button>

              {/* Option 5: Sacred Obsidian & Gold */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'midnight' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'midnight' })}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>🌙 Obsidian &amp; Amber Gold</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#0c0a09',
                      border: '1px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                  </div>
                </div>
                <span>Temple Night · Deep obsidian (#0c0a09) &amp; glowing candlelight gold</span>
              </button>

              {/* Option 6: Warm Daylight Parchment */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'parchment' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'parchment' })}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>☀️ Warm Daylight Parchment</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#faf7f2',
                      border: '1px solid #78716c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }} />
                  </div>
                </div>
                <span>Editorial Scroll · Warm daylight cream scroll (#faf7f2) &amp; deep ink</span>
              </button>

              {/* Option 7: Celestial Sapphire Blue */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'sapphire-blue' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'sapphire-blue' })}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>🌊 Celestial Sapphire Blue</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#0c192c',
                      border: '1px solid #38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
                  </div>
                </div>
                <span>Exodus 28:31 · Tekhelet sanctuary blue &amp; starlight silver</span>
              </button>

              {/* Option 8: Custom Palette Studio */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'custom' ? 'active' : ''}`}
                onClick={() => {
                  onUpdatePrefs({ theme: 'custom' });
                  setShowCustomStudio(true);
                }}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>🎨 Custom Palette Studio</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: currentCustomTheme.paper,
                      border: `1px solid ${currentCustomTheme.accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentCustomTheme.accent }} />
                  </div>
                </div>
                <span>Design your own template · Custom colors, swatches &amp; instant sync</span>
              </button>
            </div>

            {/* Custom Palette Studio Section */}
            <div
              style={{
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>🎨 Interactive Palette Studio</strong>
                  <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                    Pick custom colors or choose a 1-click starter preset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomStudio((prev) => !prev)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {showCustomStudio ? 'Hide Studio' : 'Open Studio'}
                </button>
              </div>

              {showCustomStudio && (
                <div>
                  {/* Preset Swatches */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Quick Starter Presets
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {PRESET_CUSTOM_PALETTES.map((preset) => (
                        <button
                          key={preset.palette.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.palette)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${preset.palette.accent}`,
                            background: preset.palette.surface,
                            color: preset.palette.ink,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.name}</span>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: preset.palette.accent,
                              border: '1px solid rgba(255,255,255,0.4)',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Six Color Pickers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    {/* 1. Paper / Background */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Paper (Background)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={currentCustomTheme.paper.startsWith('#') ? currentCustomTheme.paper : '#181424'}
                          onChange={(e) => handleUpdateCustomColor('paper', e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentCustomTheme.paper}</span>
                      </div>
                    </div>

                    {/* 2. Surface / Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Surface (Panels)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={currentCustomTheme.surface.startsWith('#') ? currentCustomTheme.surface : '#100c1c'}
                          onChange={(e) => handleUpdateCustomColor('surface', e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentCustomTheme.surface}</span>
                      </div>
                    </div>

                    {/* 3. Primary Text / Ink */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Script Ink (Text)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={currentCustomTheme.ink.startsWith('#') ? currentCustomTheme.ink : '#f5f0fa'}
                          onChange={(e) => handleUpdateCustomColor('ink', e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentCustomTheme.ink}</span>
                      </div>
                    </div>

                    {/* 4. Subtle / Verses */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Subtle (Notes/Labels)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={currentCustomTheme.subtle.startsWith('#') ? currentCustomTheme.subtle : '#b1a1c9'}
                          onChange={(e) => handleUpdateCustomColor('subtle', e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentCustomTheme.subtle}</span>
                      </div>
                    </div>

                    {/* 5. Accent / Glow */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Accent (Buttons/Glow)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="color"
                          value={currentCustomTheme.accent.startsWith('#') ? currentCustomTheme.accent : '#c084fc'}
                          onChange={(e) => handleUpdateCustomColor('accent', e.target.value)}
                          style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentCustomTheme.accent}</span>
                      </div>
                    </div>

                    {/* 6. Dark / Light Toggle */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
                        Light / Dark Mode
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpdateCustomColor('isDark', !currentCustomTheme.isDark)}
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--line)',
                          background: 'var(--surface)',
                          color: 'var(--ink)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {currentCustomTheme.isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </button>
                    </div>
                  </div>

                  {/* Realtime Live Scripture Preview Card */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      background: currentCustomTheme.paper,
                      color: currentCustomTheme.ink,
                      border: `1px solid ${currentCustomTheme.accent}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: currentCustomTheme.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                        ✦ LIVE PREVIEW (Ephesians 1:3)
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: currentCustomTheme.accent,
                          color: currentCustomTheme.isDark ? '#000000' : '#ffffff',
                          fontWeight: 700,
                        }}
                      >
                        Active
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, fontFamily: 'Georgia, serif' }}>
                      <strong style={{ color: currentCustomTheme.accent, marginRight: '6px' }}>3</strong>
                      Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: currentCustomTheme.subtle }}>
                      ✓ Automatically saved to your Sanctuary Study Vault and cloud profile.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Typography & Font Family Selector */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'grid',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                  Scripture Font Style
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  BibleHub clean sans-serif is default for maximum clarity on mobile and desktop
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  className={`picker-option ${prefs.fontFamily === 'sans' || !prefs.fontFamily ? 'active' : ''}`}
                  onClick={() => onUpdatePrefs({ fontFamily: 'sans' })}
                  style={{ padding: '8px 10px', textAlign: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  <strong style={{ fontSize: '13px', display: 'block' }}>BibleHub Sans</strong>
                  <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>Arial / Clean (Default)</span>
                </button>
                <button
                  type="button"
                  className={`picker-option ${prefs.fontFamily === 'serif' ? 'active' : ''}`}
                  onClick={() => onUpdatePrefs({ fontFamily: 'serif' })}
                  style={{ padding: '8px 10px', textAlign: 'left', fontFamily: 'Georgia, serif' }}
                >
                  <strong style={{ fontSize: '13px', display: 'block' }}>Classic Serif</strong>
                  <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>Georgia / Literary</span>
                </button>
                <button
                  type="button"
                  className={`picker-option ${prefs.fontFamily === 'mono' ? 'active' : ''}`}
                  onClick={() => onUpdatePrefs({ fontFamily: 'mono' })}
                  style={{ padding: '8px 10px', textAlign: 'left', fontFamily: 'monospace' }}
                >
                  <strong style={{ fontSize: '13px', display: 'block' }}>Monospace</strong>
                  <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>SF Mono / Study</span>
                </button>
              </div>
            </div>

            {/* Scripture Font Size */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                marginBottom: '10px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>
                  BibleHub Reading Size ({prefs.fontSize || 17}px)
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  Standard BibleHub default is 17px with comfortable line height
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="quiet-button"
                  onClick={() => onUpdatePrefs({ fontSize: 17 })}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  title="Reset to BibleHub default 17px"
                >
                  Reset (17px)
                </button>
                <div className="step-buttons">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePrefs({ fontSize: Math.max(14, (prefs.fontSize || 17) - 1) })
                    }
                    title="Smaller text"
                  >
                    T-
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePrefs({ fontSize: Math.min(26, (prefs.fontSize || 17) + 1) })
                    }
                    title="Larger text"
                  >
                    T+
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                  Section Headings &amp; Study Indicators
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  Show pericope headings and subtle bookmark/pin/note indicators on verses
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.showHeadings}
                className={`wisdom-toggle ${prefs.showHeadings ? 'on' : ''}`}
                onClick={() =>
                  onUpdatePrefs({
                    showHeadings: !prefs.showHeadings,
                    showStudyBadges: !prefs.showHeadings,
                  })
                }
              >
                <span className="wisdom-toggle-knob" />
              </button>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                marginTop: '10px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                  Announce Book &amp; Chapter on New Chapter
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  When narration starts or advances to a new chapter, announce the Book and Chapter first (default ON) while skipping superscriptions and headers
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.announceChapterTitle !== false}
                className={`wisdom-toggle ${prefs.announceChapterTitle !== false ? 'on' : ''}`}
                onClick={() =>
                  onUpdatePrefs({
                    announceChapterTitle: !(prefs.announceChapterTitle !== false),
                  })
                }
              >
                <span className="wisdom-toggle-knob" />
              </button>
            </div>
          </div>

          {/* 3. 24kHz Google Neural Audio & API Key Sanctuary */}
          <div className="picker-group">
            <div className="picker-language">24kHz Neural Audio &amp; Gemini Studio Key</div>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                  Google Gemini 24kHz Audio API Key
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)', lineHeight: 1.5 }}>
                  The reader uses Google Gemini Studio 24kHz voices (Charon, Kore, Puck, Aoede, Fenrir). To ensure uninterrupted daily narration across long Bible sessions without free tier quota limits, you can add your own free Gemini API key below.
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveKey();
                }}
                autoComplete="off"
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <input
                  type={isKeyVisible ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  name="gemini_user_api_key_vault_field"
                  id="gemini_user_api_key_vault_field"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  placeholder="Paste AIzaSy... key (optional)"
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="button"
                  className="quiet-button"
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                >
                  {isKeyVisible ? '🙈' : '👁️'}
                </button>
                <button
                  type="submit"
                  className="add-column"
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </form>

              {keyNotice && (
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 500 }}>
                  {keyNotice}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--line)',
                  fontSize: '11px',
                  color: 'var(--subtle)',
                }}
              >
                <span>
                  {apiKeyInput.trim() ? (
                    <strong style={{ color: 'var(--green)' }}>● Custom Key Active (Google 24kHz Unlocked)</strong>
                  ) : (
                    <span>● Natural Voice Active (Instant · Zero Quota)</span>
                  )}
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--green)', textDecoration: 'underline' }}
                >
                  Get free key at Google AI Studio ↗
                </a>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Zero-Cost Audio Vault Cache</div>
                  <div style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                    Verses already downloaded are stored locally in IndexedDB for 0ms offline playback.
                  </div>
                </div>
                <button
                  type="button"
                  className="quiet-button"
                  onClick={handleClearCache}
                  style={{ fontSize: '11px' }}
                >
                  {cacheNotice || 'Clear Audio Cache'}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Custom Language / Version Add-on */}
          <div className="picker-group">
            <div className="picker-language">Language &amp; Translation Add-ons</div>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '3px' }}>
                  Install New Language or Custom Version
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  Browse 1,000+ Free Use Bible Cloud translations or import custom JSON/TSV Bibles
                </span>
              </div>
              <button
                type="button"
                className="add-column"
                onClick={() => {
                  onClose();
                  onOpenLanguageAddonModal();
                }}
              >
                + Add-on Hub
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer to close card easily from anywhere */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'sticky',
            bottom: '-1px',
            marginTop: '20px',
            padding: '12px 16px max(14px, env(safe-area-inset-bottom))',
            background: 'var(--surface)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 10,
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 -4px 14px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--green)' }}>✓</span>
            <span>Settings saved automatically</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              background: 'var(--green)',
              color: 'var(--paper)',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}
          >
            ✓ Done / Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
