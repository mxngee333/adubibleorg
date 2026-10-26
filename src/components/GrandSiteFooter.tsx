import React from 'react';
import { LegalPageKey } from './LegalInstitutionalModal';

interface GrandSiteFooterProps {
  onOpenLegal: (page: LegalPageKey) => void;
  onOpenSettings: () => void;
  onGoHome: (e?: React.MouseEvent) => void;
  onSelectNavTab: (tab: 'canonical' | 'deuterocanon' | 'list-of-sixty') => void;
  onSelectTheme?: (themeId: string) => void;
  onOpenBookPickerWithTab?: (tab: 'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD') => void;
  showStrongs: boolean;
  showCommentaries: boolean;
}

export const GrandSiteFooter: React.FC<GrandSiteFooterProps> = ({
  onOpenLegal,
  onOpenSettings,
  onGoHome,
  onSelectNavTab,
  onSelectTheme,
  onOpenBookPickerWithTab,
  showStrongs,
  showCommentaries,
}) => {
  const handleThemeClick = (themeId: string) => {
    if (onSelectTheme) {
      onSelectTheme(themeId);
    } else {
      onOpenSettings();
    }
  };

  const handleBookPickerTab = (tab: 'ALL' | 'CANONICAL' | 'OT' | 'NT' | 'DC' | 'PSEUD') => {
    if (onOpenBookPickerWithTab) {
      onOpenBookPickerWithTab(tab);
    } else if (tab === 'DC') {
      onSelectNavTab('deuterocanon');
    } else if (tab === 'PSEUD') {
      onSelectNavTab('list-of-sixty');
    } else {
      onSelectNavTab('canonical');
    }
  };
  return (
    <footer className="grand-site-footer" role="contentinfo">

      {/* 3 CORNERSTONE SCRIPTURE QUOTES */}
      <div
        className="footer-scripture-trio"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontStyle: 'italic',
              color: 'var(--ink)',
              lineHeight: 1.5,
              fontSize: '13px',
            }}
          >
            &ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo;
          </p>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--green)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Ephesians 1:3 · Efesofoɔ 1:3
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontStyle: 'italic',
              color: 'var(--ink)',
              lineHeight: 1.5,
              fontSize: '13px',
            }}
          >
            &ldquo;For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow.&rdquo;
          </p>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--green)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Hebrews 4:12 · Hebrifoɔ 4:12
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontStyle: 'italic',
              color: 'var(--ink)',
              lineHeight: 1.5,
              fontSize: '13px',
            }}
          >
            &ldquo;All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.&rdquo;
          </p>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--green)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            2 Timothy 3:16 · 2 Timoteo 3:16
          </div>
        </div>
      </div>

      <div className="footer-grid">
        {/* Column 1: Scriptures, Deuterocanon & Apocrypha */}
        <div className="footer-col">
          <h3 className="footer-col-title">Holy Scriptures &amp; Historical Canons (107 Books)</h3>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('CANONICAL')}
              >
                📖 66 Canonical Books (OT 39 + NT 27)
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('DC')}
                style={{ color: '#f59e0b', fontWeight: 700 }}
              >
                📜 16 Deuterocanonical Books (Catholic &amp; Orthodox)
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('PSEUD')}
                style={{ color: '#c084fc', fontWeight: 700 }}
              >
                🏺 25 Ancient Apocrypha &amp; Pseudepigrapha
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('ALL')}
              >
                👑 Browse All 107 Holy Scriptures
              </button>
            </li>
            <li style={{ borderTop: '1px dashed var(--line)', paddingTop: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--subtle)', display: 'block', marginBottom: '4px' }}>
                Quick Historical Scripture Hubs:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <a href="/deuterocanon/" className="footer-pill-link">
                  📜 Deuterocanon Hub
                </a>
                <a href="/list-of-sixty/" className="footer-pill-link">
                  🏺 Apocrypha Hub
                </a>
                <a href="/kjv-apoc/tobit/1/" className="footer-pill-link">
                  Tobit
                </a>
                <a href="/kjv-apoc/wisdom-of-solomon/1/" className="footer-pill-link">
                  Wisdom
                </a>
                <a href="/kjv-apoc/1-maccabees/1/" className="footer-pill-link">
                  1 Maccabees
                </a>
                <a href="/charles/1-enoch/1/" className="footer-pill-link">
                  1 Enoch
                </a>
                <a href="/charles/book-of-jasher/1/" className="footer-pill-link">
                  Jasher
                </a>
                <a href="/charles/jubilees/1/" className="footer-pill-link">
                  Jubilees
                </a>
              </div>
            </li>
          </ul>
        </div>

        {/* Column 2: Exegetical Tools & Themes Dashboard */}
        <div className="footer-col">
          <h3 className="footer-col-title">Reading Palettes &amp; Themes (Settings Dashboard)</h3>
          <ul className="footer-links">
            <li style={{ marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('wisdom-legacy')}
                  title="Switch to Wisdom Pine Legacy Theme"
                >
                  🌿 Wisdom Pine
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('royal-purple')}
                  title="Switch to Royal Tyrian Velvet Theme"
                >
                  👑 Royal Velvet
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('lilac-light')}
                  title="Switch to Sacred Lilac Parchment Theme"
                >
                  🌸 Sacred Lilac
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('burgundy-gold')}
                  title="Switch to Burgundy Leather KJV Theme"
                >
                  📖 Burgundy KJV
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('adubible-si')}
                  title="Switch to AduBible SI Sovereign Theme"
                >
                  ⚡ AduBible SI
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('architect-gold')}
                  title="Switch to Sacred Architect Maroon Theme"
                >
                  📐 Architect
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('covenant-atlas')}
                  title="Switch to Covenant Atlas Theme"
                >
                  🧭 Covenant Atlas
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('sapphire-blue')}
                  title="Switch to Celestial Sapphire Blue Theme"
                  style={{ borderColor: 'rgba(56, 189, 248, 0.45)', color: '#38bdf8' }}
                >
                  🌊 Sapphire Blue
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('midnight')}
                  title="Switch to Obsidian & Amber Gold Theme"
                >
                  🌙 Obsidian Gold
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => handleThemeClick('parchment')}
                  title="Switch to Warm Daylight Parchment Theme"
                >
                  ☀️ Daylight
                </button>
                <button
                  type="button"
                  className="footer-theme-chip"
                  onClick={() => {
                    handleThemeClick('custom');
                    onOpenSettings();
                  }}
                  title="Open Custom Palette Studio in Settings"
                >
                  🎨 Custom Studio
                </button>
              </div>
            </li>
            <li style={{ borderTop: '1px dashed var(--line)', paddingTop: '6px' }}>
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                🔤 Strong’s Greek &amp; Hebrew Lexicon {showStrongs ? '✓ ON' : '(Turn ON)'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                💬 Matthew Henry Expository Notes {showCommentaries ? '✓ ON' : '(Turn ON)'}
              </button>
            </li>
            <li>
              <span className="footer-static-item">
                🎧 24kHz Google Neural Audio Reader
              </span>
            </li>
            <li>
              <span className="footer-static-item">
                ⇄ 4-Column Synchronized Parallel Study
              </span>
            </li>
          </ul>
        </div>

        {/* Column 3: African & World Languages */}
        <div className="footer-col">
          <h3 className="footer-col-title">African &amp; Global Languages</h3>
          <ul className="footer-links">
            <li>
              <a href="/tw/" className="footer-text-link">
                🇬🇭 Asante Twi (Twerɛ Kronkron)
              </a>
            </li>
            <li>
              <a href="/ha/" className="footer-text-link">
                🇳🇬 Hausa (Littafi Mai Tsarki)
              </a>
            </li>
            <li>
              <a href="/yo/" className="footer-text-link">
                🇳🇬 Èdè Yorùbá (Bíbélì Mímọ́)
              </a>
            </li>
            <li>
              <a href="/sw/" className="footer-text-link">
                🇰🇪 Kiswahili (Swahili Union Version)
              </a>
            </li>
            <li>
              <a href="/fr/" className="footer-text-link">
                🇫🇷 Français (Louis Segond 1910)
              </a>
            </li>
            <li>
              <a href="/es/" className="footer-text-link">
                🇪🇸 Español (Reina-Valera 1909)
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Institutional & Heritage */}
        <div className="footer-col">
          <h3 className="footer-col-title">Institutional &amp; Legacy</h3>
          <ul className="footer-links">
            <li>
              <a
                href="/about/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('about');
                }}
                className="footer-text-link"
              >
                Apostle Kwame Adu &amp; About AduBible
              </a>
            </li>
            <li>
              <a
                href="/how-to-use/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('how-to-use');
                }}
                className="footer-text-link"
              >
                How to Use Parallel Reading &amp; Strong’s
              </a>
            </li>
            <li>
              <a
                href="/privacy/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('privacy');
                }}
                className="footer-text-link"
              >
                Sovereign Privacy (Zero Tracking &amp; Zero Ads)
              </a>
            </li>
            <li>
              <a
                href="/terms/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('terms');
                }}
                className="footer-text-link"
              >
                Terms of Service &amp; Open Scripture Commons
              </a>
            </li>
            <li>
              <a
                href="https://nsuhia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text-link"
                style={{ color: 'var(--green)', fontWeight: 600 }}
              >
                Nsuhia Community Heritage (nsuhia.com ↗)
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-copy">
          © {new Date().getFullYear()} <strong>AduBible</strong> (<a href="https://adubible.org/">adubible.org</a>) · Dedicated to Humanity in Honor of Apostle Kwame Adu · Nsuhia, Ghana.
        </div>
        <div className="footer-security-note">
          100% Ad-Free · Sovereign Local Study Vault · 24kHz Neural Exegesis
        </div>
      </div>
    </footer>
  );
};
