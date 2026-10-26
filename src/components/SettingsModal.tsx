import React, { useState } from 'react';
import { ReadingPreferences } from '../types/bible';
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prefs,
  onUpdatePrefs,
  onOpenLanguageAddonModal,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiKey());
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string>('');
  const [cacheNotice, setCacheNotice] = useState<string>('');

  if (!isOpen) return null;

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
    prefs.theme !== 'lilac-light';

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
            <div className="picker-language">Appearance &amp; Typography</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {/* Option 1: Royal Tyrian Velvet (Purple Majesty Dark) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'royal-purple' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'royal-purple' })}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>👑 Royal Tyrian Velvet</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#160d24',
                      border: '1px solid #c084fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc' }} />
                  </div>
                </div>
                <span>Exodus 28:5 · Deep imperial violet, alabaster silk &amp; sacred amethyst</span>
              </button>

              {/* Option 2: Sacred Lilac Parchment (Purple Light) */}
              <button
                type="button"
                className={`picker-option ${prefs.theme === 'lilac-light' ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'lilac-light' })}
                style={{ textAlign: 'left', padding: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px' }}>🌸 Sacred Lilac Parchment</strong>
                  <div
                    style={{
                      width: '28px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#fdfcfe',
                      border: '1px solid #7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7e22ce' }} />
                  </div>
                </div>
                <span>Proverbs 31:22 · Holy morning lavender paper &amp; deep aubergine ink</span>
              </button>

              {/* Option 3: Sacred Obsidian & Gold */}
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

              {/* Option 4: Warm Daylight Parchment */}
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

              {/* Option 5: Celestial Sapphire Blue */}
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
                <span>Exodus 28:31 · Tekhelet (תְּכֵלֶת) sanctuary blue, starlight silver &amp; ocean sapphire</span>
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
