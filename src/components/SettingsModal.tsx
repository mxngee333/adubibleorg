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
}

const PRESET_CUSTOM_PALETTES: Array<{
  name: string;
  icon: string;
  palette: CustomThemePalette;
}> = [
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
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiKey());
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string>('');
  const [cacheNotice, setCacheNotice] = useState<string>('');
  const [showCustomStudio, setShowCustomStudio] = useState<boolean>(
    prefs.theme === 'custom'
  );

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
    setKeyNotice(apiKeyInput.trim() ? '✅ Custom Gemini key saved!' : 'Custom key removed. Using built-in key.');
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
          <button type="button" onClick={onClose}>
            Close
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
          <div className="picker-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="picker-language">Appearance, Palettes &amp; Themes</div>
              <div
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: 'rgba(212, 175, 55, 0.12)',
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
              {/* Option 1: Royal Tyrian Velvet (Purple Majesty Dark) */}
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
                background: 'rgba(0, 0, 0, 0.15)',
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
                      ✓ Automatically synced to localStorage and your cloud profile.
                    </div>
                  </div>
                </div>
              )}
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
                marginBottom: '10px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>
                  Scripture Font Size ({prefs.fontSize}px)
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                  Adjust Georgia serif reading size across all parallel columns
                </span>
              </div>
              <div className="step-buttons">
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePrefs({ fontSize: Math.max(15, prefs.fontSize - 1) })
                  }
                >
                  T-
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePrefs({ fontSize: Math.min(26, prefs.fontSize + 1) })
                  }
                >
                  T+
                </button>
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

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type={isKeyVisible ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
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
                  type="button"
                  className="add-column"
                  onClick={handleSaveKey}
                  style={{ minWidth: '80px' }}
                >
                  Save
                </button>
              </div>

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
                    <strong style={{ color: 'var(--green)' }}>● Custom Key Active</strong>
                  ) : (
                    <span>● Using Built-in High-Speed Audio Key</span>
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
      </div>
    </div>
  );
};
