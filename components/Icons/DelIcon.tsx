import React from "react";

export default function DelIcon({className = 'h-3.5 w-3.5 text-yellow-500'}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
             className="w-4 h-4">
            <path d="M9 3h6"/>
            <path d="M4 7h16"/>
            <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
        </svg>
    )
}