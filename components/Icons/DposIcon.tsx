import React from "react";

export default function DposIcon({className = 'h-3.5 w-3.5 text-indigo-500'}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2">
            <path d="M3 7h18M6 12h12M9 17h6"/>
            <rect x="4" y="4" width="16" height="16" rx="3"/>
        </svg>
    )
}