import React from "react";

export default function RobotIcon({className = 'w-4 h-4'}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="4" r="1" strokeWidth={2}/>
            <path d="M12 5v3" strokeWidth={2} strokeLinecap="round"/>
            <rect x="4" y="9" width="16" height="10" rx="2" strokeWidth={2}/>
            <circle cx="9" cy="14" r="1.25" fill="currentColor"/>
            <circle cx="15" cy="14" r="1.25" fill="currentColor"/>
            <path d="M9 17h6" strokeWidth={2} strokeLinecap="round"/>
        </svg>
    );
}