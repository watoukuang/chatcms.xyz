import React from "react";

export default function FolderIcon({className = 'h-3.5 w-3.5 text-sky-500'}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
             className="w-4 h-4">
            <path
                d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
        </svg>
    );
}