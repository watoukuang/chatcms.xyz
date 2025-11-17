import React from 'react';

export default function TokenIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 4v8l-7 4-7-4V6l7-4z"/>
      <path d="M12 22V10"/>
      <path d="M19 6l-7 4-7-4"/>
    </svg>
  );
}
