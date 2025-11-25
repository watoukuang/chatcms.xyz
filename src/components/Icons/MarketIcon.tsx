import React from "react";

export default function MarketIcon({className = 'w-4 h-4'}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  d="M16 11V7a4 4 0 10-8 0v4"/>
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  d="M5 8h14l-1 11H6L5 8z"/>
        </svg>
    );
}