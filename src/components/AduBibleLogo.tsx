import React from 'react';
import { BookOpen } from 'lucide-react';

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
  title = 'AduBible — Adubible.org',
}) => {
  return (
    <div
      className={`adubible-logo-mark size-${size} ${className}`}
      onClick={onClick}
      title={title}
      role="banner"
    >
      <div className="logo-badge" aria-hidden="true">
        <BookOpen className="logo-icon" />
      </div>
      <div className="logo-wordmark">
        <span className="logo-word-adu">Adu</span>
        <span className="logo-word-bible">Bible</span>
      </div>
    </div>
  );
};
