import React from 'react';
import { LegalPageKey } from './LegalInstitutionalModal';

interface GrandSiteFooterProps {
  onOpenLegal: (page: LegalPageKey) => void;
  onOpenSettings: () => void;
  onGoHome: (e?: React.MouseEvent) => void;
  onSelectNavTab: (tab: 'canonical' | 'deuterocanon' | 'list-of-sixty') => void;
  showStrongs: boolean;
  showCommentaries: boolean;
}

export const GrandSiteFooter: React.FC<GrandSiteFooterProps> = ({
  onOpenLegal,
  onOpenSettings,
  onGoHome,
  onSelectNavTab,
  showStrongs,
  showCommentaries,
}) => {
  return (
    <footer className="grand-site-footer" role="contentinfo">
      <div className="footer-top-brand">
        <div className="footer-brand-title">
          <a href="/" onClick={onGoHome} className="footer-logo">
            <span className="brand-icon" aria-hidden="true">✦</span>
            <span>AduBible</span>
          </a>
          <span className="footer-motto">The Word, Side by Side · 100% Ad-Free Exegetical Sanctuary</span>
        </div>

        <p className="footer-dedication-lead">
          Dedicated to Humanity in honor of the Generational Gospel Legacy of <strong>Apostle Kwame Adu</strong> (1938–2015) of{' '}
          <a
            href="https://nsuhia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-highlight-link"
          >
            Nsuhia, Ghana (nsuhia.com ↗)
          </a>.
          Committed to preserving the unadulterated Word of God in Asante Twi, English, and world languages with zero ads and zero behavioral trackers.
        </p>
      </div>

      <div className="footer-grid">
        {/* Column 1: Scriptures & Canons */}
        <div className="footer-col">
          <h3 className="footer-col-title">Holy Scriptures &amp; Canons</h3>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => onSelectNavTab('canonical')}
              >
                📖 66 Canonical Books (OT 39 + NT 27)
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => onSelectNavTab('deuterocanon')}
              >
                📜 16 Deuterocanonical Books (Catholic &amp; Orthodox)
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => onSelectNavTab('list-of-sixty')}
              >
                🏺 25 List of Sixty &amp; Ancient Apocrypha
              </button>
            </li>
            <li>
              <a href="/twi/ephesians/1/" className="footer-text-link">
                🇬🇭 Twerɛ Kronkron (Asante Twi Bible)
              </a>
            </li>
            <li>
              <a href="/nkjv/ephesians/1/" className="footer-text-link">
                📖 New King James Version (NKJV)
              </a>
            </li>
            <li>
              <a href="/kjv/ephesians/1/" className="footer-text-link">
                👑 King James Version (KJV 1769)
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Exegetical Tools */}
        <div className="footer-col">
          <h3 className="footer-col-title">Exegetical &amp; Study Tools</h3>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                🔤 Strong’s Greek &amp; Hebrew Concordance {showStrongs ? '✓ ON' : '(Turn ON)'}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                💬 Matthew Henry Commentaries {showCommentaries ? '✓ ON' : '(Turn ON)'}
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
            <li>
              <span className="footer-static-item">
                🗄️ Sovereign Local &amp; Cloud Study Vault
              </span>
            </li>
            <li>
              <button
                type="button"
                className="footer-btn-link"
                onClick={onOpenSettings}
              >
                🎨 Velvet Purple, Lilac, Midnight &amp; Parchment Themes
              </button>
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
