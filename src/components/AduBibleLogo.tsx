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
          width="34"
          height="34"
          loading="eager"
        />
      </div>
      <div className="logo-wordmark">
        <span className="logo-word-adu">Adu</span>
        <span className="logo-word-bible">Bible</span>
        <span className="logo-word-tld">.org</span>
      </div>
    </div>
  );
};
