import React from "react";

export default function DocIcon({className = 'h-3.5 w-3.5 text-emerald-500'}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
             className="w-4 h-4">
            <rect x="4" y="3" width="16" height="18" rx="2"/>
        </svg>
    )
}