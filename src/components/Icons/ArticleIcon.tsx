import React from "react";

export default function ArticleIcon({className = 'w-4 h-4'}: { className?: string }) {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
            <rect x="5" y="3" width="14" height="18" rx="2"/>
            <path d="M8 8h8"/>
            <path d="M8 12h8"/>
            <path d="M8 16h6"/>
        </svg>
    )
}