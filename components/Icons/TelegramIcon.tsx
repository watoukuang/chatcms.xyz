import React from 'react';

interface IconProps {
  className?: string;
}

export default function TelegramIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? ''} aria-hidden>
      <path d="M9.036 15.803l-.375 5.297c.535 0 .767-.23 1.045-.505l2.507-2.41 5.195 3.805c.953.525 1.636.25 1.897-.884l3.438-16.098c.314-1.46-.557-2.03-1.49-1.675L1.28 10.064c-1.41.548-1.388 1.337-.24 1.69l5.41 1.687 12.57-7.94c.59-.36 1.127-.16.685.2"/>
    </svg>
  );
}
