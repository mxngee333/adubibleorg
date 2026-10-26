import React from 'react';

export interface AduBibleLogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const AduBibleLogo: React.FC<AduBibleLogoProps> = ({
  variant = 'full',
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
  title = 'AduBible — Ad-Free Multilingual Holy Scriptures | Adubible.org',
}) => {
  const iconSizes = {
    sm: 26,
    md: 34,
    lg: 46,
    xl: 60,
  };
  const iconPx = iconSizes[size];

  return (
    <div
      className={`adubible-brand-lockup size-${size} variant-${variant} ${className}`}
      onClick={onClick}
      title={title}
      role="banner"
    >
      <div className="brand-emblem-wrapper" style={{ width: iconPx, height: iconPx }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-emblem-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Rich 24K Gold Sheen Gradient */}
            <linearGradient id="aduEmblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="20%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Sacred Velvet Jewel Background */}
            <linearGradient id="aduEmblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b0764" />
              <stop offset="45%" stopColor="#2e1065" />
              <stop offset="85%" stopColor="#17062e" />
              <stop offset="100%" stopColor="#0c0418" />
            </linearGradient>

            {/* Inner Scripture Light Gradient */}
            <linearGradient id="aduPageSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>

            {/* Aura Drop Glow */}
            <filter id="aduGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Squircle with Precision Gold Border */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#aduEmblemBg)"
            stroke="url(#aduEmblemGold)"
            strokeWidth="2.8"
          />

          {/* Inner Filigree Accent Inset Border */}
          <rect
            x="9"
            y="9"
            width="82"
            height="82"
            rx="18"
            fill="none"
            stroke="url(#aduEmblemGold)"
            strokeWidth="0.9"
            strokeOpacity="0.45"
            strokeDasharray="4 2"
          />

          {/* Celestial Divine Spark / Cross Star hovering above */}
          <g filter="url(#aduGoldGlow)">
            {/* Latin Cross Vertical & Horizontal Rays */}
            <path
              d="M50 14 L50 31 M42 21.5 L58 21.5"
              stroke="url(#aduEmblemGold)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            {/* Center Radiant 4-Point Diamond Spark */}
            <path
              d="M50 16 Q50 21.5 54 21.5 Q50 21.5 50 27 Q50 21.5 46 21.5 Q50 21.5 50 16 Z"
              fill="#ffffff"
            />
            {/* Divine Light Center Core */}
            <circle cx="50" cy="21.5" r="1.5" fill="#fef08a" />
          </g>

          {/* Open Holy Scripture (Dual Curved Exegetical Columns) */}
          {/* Left Page Volume */}
          <path
            d="M50 43 C41 38, 27 36, 18 41 C17 41.5, 16 42.5, 16 44 L16 75 C16 76.5, 17.5 77.5, 19 77 C27 73, 41 74, 50 80 Z"
            fill="url(#aduPageSheen)"
            stroke="url(#aduEmblemGold)"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Right Page Volume */}
          <path
            d="M50 43 C59 38, 73 36, 82 41 C83 41.5, 84 42.5, 84 44 L84 75 C84 76.5, 82.5 77.5, 81 77 C73 73, 59 74, 50 80 Z"
            fill="url(#aduPageSheen)"
            stroke="url(#aduEmblemGold)"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Sacred Book Spine & Center Binding */}
          <path
            d="M50 43 L50 80"
            stroke="url(#aduEmblemGold)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Scripture Parallel Lines - Left Column (original languages / Twi) */}
          <path d="M23 51 C29 48, 38 49, 44 52" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
          <path d="M23 58 C29 55, 38 56, 44 59" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
          <path d="M24 65 C30 62, 38 63, 44 66" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

          {/* Scripture Parallel Lines - Right Column (parallel translation) */}
          <path d="M56 52 C62 49, 71 48, 77 51" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
          <path d="M56 59 C62 56, 71 55, 77 58" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
          <path d="M56 66 C62 63, 70 62, 76 65" stroke="url(#aduEmblemGold)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

          {/* Golden Ribbon Bookmark (Tasselled Bookmark) */}
          <path
            d="M50 80 Q53 86 56 89 L53 86 L50 90 Z"
            fill="url(#aduEmblemGold)"
            stroke="url(#aduEmblemGold)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {variant !== 'icon-only' && (
        <div className="brand-typography">
          <div className="brand-wordmark">
            <span className="brand-adu">Adu</span>
            <span className="brand-bible">Bible</span>
            <span className="brand-spark">✦</span>
          </div>

          {variant === 'full' && showSubtitle && (
            <div className="brand-subtitle">
              <span>HOLY SCRIPTURES</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
