import React from 'react';

export default function AddIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
           className="w-5 h-5">
          <rect x="4" y="4" width="16" height="16" rx="3"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
      </svg>
  );
}
