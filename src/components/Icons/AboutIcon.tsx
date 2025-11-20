import React from "react";

export default function AboutIcon({className = 'w-5 h-5 text-current transition-colors group-hover:text-lime-500'}: {
    className?: string
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0 5.25-9 10.5-9 10.5S3 13.5 3 8.25a5.25 5.25 0 0 1 9-3.715A5.25 5.25 0 0 1 21 8.25z"/>
        </svg>
    )
}