import React from 'react';

export interface AduBibleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'compact';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const AduBibleLogo: React.FC<AduBibleLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
  title = 'AduBible.org — Sovereign Scripture Engine',
}) => {
  const dims = size === 'sm' ? 26 : size === 'lg' ? 44 : 34;

  return (
    <div
      className={`adubible-logo-mark size-${size} ${className}`}
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
      <div className="logo-wordmark">
        <span className="logo-word-adu" style={{ color: 'var(--logo-adu-color, #A8354D)' }}>Adu</span>
        <span className="logo-word-bible" style={{ color: 'var(--logo-bible-color, #E8E2D6)' }}>Bible</span>
        <span className="logo-word-tld" style={{ color: 'var(--logo-tld-color, #8E968F)' }}>.org</span>
      </div>
    </div>
  );
};
