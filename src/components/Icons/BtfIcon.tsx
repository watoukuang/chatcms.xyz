import React from "react";

export default function BtfIcon({className = 'h-3.5 w-3.5 text-pink-500'}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2">
            <path d="M14 4l6 6M8 20h8"/>
            <path d="M3 11l7-7 7 7-7 7-7-7z"/>
        </svg>
    );
}
