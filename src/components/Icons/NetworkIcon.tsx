import React from 'react';

export default function NetworkIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07A1.65 1.65 0 0 0 8 19.55a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.66 15 1.65 1.65 0 0 0 2 14H2a2 2 0 1 1 0-4h.07A1.65 1.65 0 0 0 3.66 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.66 1.65 1.65 0 0 0 9 2h.07a2 2 0 0 1 3.86 0H13a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.34 8c.36.5.57 1.1.59 1.72V10a2 2 0 1 1 0 4h-.07a1.65 1.65 0 0 0-1.46 1z"/>
    </svg>
  );
}
