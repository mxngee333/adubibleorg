import React from 'react';

export interface AduBibleLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'full' | 'compact' | 'symbol' | 'adaptive';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  isParallelActive?: boolean; // When multiple parallel translations / added books are active
  showRegistered?: boolean;
}

export const AduBibleLogo: React.FC<AduBibleLogoProps> = ({
  size = 'md',
  variant = 'adaptive',
  className = '',
  onClick,
  title = 'AduBible.org® — Sovereign Scripture Engine',
  isParallelActive = false,
  showRegistered = true,
}) => {
  const dims = typeof size === 'number' ? size : size === 'sm' ? 26 : size === 'lg' ? 44 : 34;
  const sizeClass = typeof size === 'string' ? `size-${size}` : '';
  const parallelClass = isParallelActive ? 'has-added-versions' : 'single-version';
  const variantClass = variant ? `variant-${variant}` : '';

  return (
    <div
      className={`adubible-logo-mark ${sizeClass} ${parallelClass} ${variantClass} ${className}`}
      onClick={onClick}
      title={title}
      role="banner"
    >
      <div className="logo-symbol-wrap" aria-hidden="true">
        <img
          src="/brand/icon-128.png"
          srcSet="/brand/icon-128.png 1x, /brand/Symbol_Transparent.png 2x"
          alt="AduBible Transparent Wave Symbol"
          className="logo-symbol-wave"
          width={dims}
          height={dims}
          loading="eager"
        />
      </div>
      {variant !== 'symbol' && (
        <div className="logo-wordmark">
          <span className="logo-word-adu" style={{ color: 'var(--logo-adu-color, #8EA486)' }}>
            Adu
          </span>
          <span className="logo-word-bible" style={{ color: 'var(--logo-bible-color, #B8AC94)' }}>
            Bible
          </span>
          <span className="logo-word-tld" style={{ color: 'var(--logo-tld-color, #8E968D)' }}>
            .org
          </span>
          {showRegistered && (
            <span
              className="logo-registered-mark"
              aria-label="Registered Trademark"
              title="AduBible® Registered Trademark"
            >
              ®
            </span>
          )}
        </div>
      )}
    </div>
  );
};
