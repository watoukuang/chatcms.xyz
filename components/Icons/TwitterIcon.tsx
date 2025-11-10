import React from 'react';

interface IconProps {
  className?: string;
}

export default function TwitterIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? ''} aria-hidden>
      <path d="M18.244 2H21l-6.56 7.5L22.5 22H15.9l-5.02-6.54L4.96 22H2l6.99-8-6.5-8H9.1l4.6 6.02L18.244 2z"/>
    </svg>
  );
}
