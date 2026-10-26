import React from 'react';
import { ReadingPreferences } from '../types/bible';

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
  if (!isOpen) return null;

  const isNight = prefs.theme !== 'parchment' && prefs.theme !== 'daylight';

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
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              <button
                type="button"
                className={`picker-option ${isNight ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'midnight' })}
              >
                <strong>Sacred Obsidian &amp; Gold (Default)</strong>
                <span>Deep obsidian (#0c0a09) &amp; royal amber gold</span>
              </button>
              <button
                type="button"
                className={`picker-option ${!isNight ? 'active' : ''}`}
                onClick={() => onUpdatePrefs({ theme: 'parchment' })}
              >
                <strong>Warm Parchment (Light)</strong>
                <span>Cream editorial scroll (#faf7f2) &amp; amber</span>
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

          {/* 3. Custom Language / Version Add-on */}
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
