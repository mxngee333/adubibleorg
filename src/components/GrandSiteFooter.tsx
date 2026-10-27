import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { LegalPageKey } from './LegalInstitutionalModal';

interface GrandSiteFooterProps {
  onOpenLegal: (page: LegalPageKey) => void;
  onOpenSettings: () => void;
  onGoHome: (e?: React.MouseEvent) => void;
  onSelectNavTab: (tab: 'canonical' | 'deuterocanon' | 'list-of-sixty' | 'articles') => void;
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
      <div className="footer-scripture-trio">
        <div className="footer-scripture-card">
          <p className="footer-scripture-text">
            &ldquo;Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.&rdquo;
          </p>
          <div className="footer-scripture-ref">
            Ephesians 1:3 · Efesofoɔ 1:3
          </div>
        </div>

        <div className="footer-scripture-card">
          <p className="footer-scripture-text">
            &ldquo;For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow.&rdquo;
          </p>
          <div className="footer-scripture-ref">
            Hebrews 4:12 · Hebrifoɔ 4:12
          </div>
        </div>

        <div className="footer-scripture-card">
          <p className="footer-scripture-text">
            &ldquo;All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.&rdquo;
          </p>
          <div className="footer-scripture-ref">
            2 Timothy 3:16 · 2 Timoteo 3:16
          </div>
        </div>
      </div>

      <div className="footer-grid">
        {/* Column 1: Scriptures, Deuterocanon & Apocrypha */}
        <div className="footer-col">
          <h3 className="footer-col-title">
            <span>📖 Holy Scriptures &amp; Canons (107 Books)</span>
          </h3>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('CANONICAL')}
              >
                <span>📖 66 Canonical Books (OT 39 + NT 27)</span>
                <ChevronRight className="footer-link-chevron" />
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('DC')}
                style={{ color: '#f59e0b' }}
              >
                <span>📜 16 Deuterocanonical Books (Catholic &amp; Orthodox)</span>
                <ChevronRight className="footer-link-chevron" />
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('PSEUD')}
                style={{ color: '#c084fc' }}
              >
                <span>🏺 25 Apocrypha &amp; Pseudepigrapha</span>
                <ChevronRight className="footer-link-chevron" />
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => handleBookPickerTab('ALL')}
              >
                <span>👑 Browse All 107 Holy Scriptures</span>
                <ChevronRight className="footer-link-chevron" />
              </button>
            </li>
            <li className="footer-hubs-wrapper">
              <span className="footer-hubs-label">
                Quick Historical Scripture Hubs:
              </span>
              <div className="footer-hubs-container">
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
          <h3 className="footer-col-title">
            <span>🎨 Reading Palettes &amp; Themes</span>
          </h3>
          <ul className="footer-links">
            <li>
              <div className="footer-theme-grid">
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
                  title="Switch to Obsidian &amp; Amber Gold Theme"
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
            <li className="footer-tool-item">
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                <span>🔤 Strong’s Greek &amp; Hebrew Lexicon</span>
                <span className={`footer-badge ${showStrongs ? 'badge-on' : 'badge-off'}`}>
                  {showStrongs ? 'ON' : 'OFF'}
                </span>
              </button>
            </li>
            <li className="footer-tool-item">
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                <span>💬 Matthew Henry Expository Notes</span>
                <span className={`footer-badge ${showCommentaries ? 'badge-on' : 'badge-off'}`}>
                  {showCommentaries ? 'ON' : 'OFF'}
                </span>
              </button>
            </li>
            <li className="footer-tool-item">
              <span className="footer-static-item">
                <span>🎧 24kHz Google Neural Audio Reader</span>
                <span className="footer-badge badge-on">24kHz</span>
              </span>
            </li>
            <li className="footer-tool-item">
              <span className="footer-static-item">
                <span>⇄ 4-Column Synchronized Parallel Study</span>
                <span className="footer-badge badge-on">4-COL</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Column 3: African & World Languages */}
        <div className="footer-col">
          <h3 className="footer-col-title">
            <span>🌍 African &amp; Global Languages</span>
          </h3>
          <div className="footer-languages-grid">
            <a href="/tw/" className="footer-language-chip">
              <span className="flag-icon">🇬🇭</span>
              <span>Asante Twi</span>
            </a>
            <a href="/ak-twi/" className="footer-language-chip">
              <span className="flag-icon">🇬🇭</span>
              <span>Akuapem Twi</span>
            </a>
            <a href="/ee/" className="footer-language-chip">
              <span className="flag-icon">🇬🇭</span>
              <span>Eʋegbe (Ewe)</span>
            </a>
            <a href="/gaa/" className="footer-language-chip">
              <span className="flag-icon">🇬🇭</span>
              <span>Gã Ŋmalɛ</span>
            </a>
            <a href="/ha/" className="footer-language-chip">
              <span className="flag-icon">🇳🇬</span>
              <span>Hausa</span>
            </a>
            <a href="/yo/" className="footer-language-chip">
              <span className="flag-icon">🇳🇬</span>
              <span>Èdè Yorùbá</span>
            </a>
            <a href="/sw/" className="footer-language-chip">
              <span className="flag-icon">🇰🇪</span>
              <span>Kiswahili</span>
            </a>
            <a href="/fr/" className="footer-language-chip">
              <span className="flag-icon">🇫🇷</span>
              <span>Français</span>
            </a>
            <a href="/es/" className="footer-language-chip">
              <span className="flag-icon">🇪🇸</span>
              <span>Español</span>
            </a>
            <a href="/de/" className="footer-language-chip">
              <span className="flag-icon">🇩🇪</span>
              <span>Deutsch</span>
            </a>
          </div>
        </div>

        {/* Column 4: Institutional & Heritage */}
        <div className="footer-col">
          <h3 className="footer-col-title">
            <span>🏛️ Institutional Trust, Articles &amp; Heritage</span>
          </h3>
          <ul className="footer-links">
            <li>
              <a
                href="/articles/"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectNavTab('articles');
                }}
                className="footer-text-link"
                style={{ color: '#f59e0b', fontWeight: 700 }}
              >
                <span>📖 15 Pillar Scripture &amp; Study Guides</span>
                <ChevronRight className="footer-link-chevron" />
              </a>
            </li>
            <li>
              <a
                href="/editorial-policy/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('editorial-policy');
                }}
                className="footer-text-link"
              >
                <span>Editorial Policy &amp; Translation Standards</span>
                <ChevronRight className="footer-link-chevron" />
              </a>
            </li>
            <li>
              <a
                href="/glossary/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('glossary');
                }}
                className="footer-text-link"
              >
                <span>Biblical Exegesis &amp; Textual Glossary</span>
                <ChevronRight className="footer-link-chevron" />
              </a>
            </li>
            <li>
              <a
                href="/sources/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('sources');
                }}
                className="footer-text-link"
              >
                <span>Manuscript Archives &amp; Scholarly Sources</span>
                <ChevronRight className="footer-link-chevron" />
              </a>
            </li>
            <li>
              <a
                href="/about/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('about');
                }}
                className="footer-text-link"
              >
                <span>Apostle Kwame Adu &amp; About AduBible</span>
                <ChevronRight className="footer-link-chevron" />
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
                <span>How to Use Parallel Reading &amp; Strong’s</span>
                <ChevronRight className="footer-link-chevron" />
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
                <span>Sovereign Privacy (Zero Ads &amp; Tracking)</span>
                <ChevronRight className="footer-link-chevron" />
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
                <span>Terms of Service &amp; Open Scripture Commons</span>
                <ChevronRight className="footer-link-chevron" />
              </a>
            </li>
            <li>
              <a
                href="https://nsuhia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text-link footer-heritage-link"
              >
                <span>Nsuhia Community Heritage (nsuhia.com)</span>
                <ExternalLink className="footer-link-chevron" style={{ width: 14, height: 14 }} />
              </a>
            </li>
            <li className="pt-2 border-t border-stone-800">
              <span className="text-[11px] text-stone-500 block mb-1">Partner &amp; Reference Archives:</span>
              <div className="flex items-center gap-3 text-xs">
                <a
                  href="https://www.biblegateway.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-amber-400 transition underline flex items-center gap-1"
                >
                  <span>Bible Gateway ↗</span>
                </a>
                <span className="text-stone-600">·</span>
                <a
                  href="https://biblehub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-amber-400 transition underline flex items-center gap-1"
                >
                  <span>Bible Hub ↗</span>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-copy">
          © {new Date().getFullYear()} <a href="https://adubible.org/" style={{ textDecoration: 'none' }}><span style={{ color: '#38bdf8', fontWeight: 800 }}>Adu</span><span style={{ color: '#f59e0b', fontWeight: 700 }}>Bible</span><span style={{ color: '#10b981', fontWeight: 700 }}>.org</span></a> · Dedicated to Humanity by the Ministry of Apostle Kwame Adu · Nsuhia, Ghana.
        </div>
      </div>
    </footer>
  );
};
