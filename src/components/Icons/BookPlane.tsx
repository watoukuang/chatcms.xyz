import React from "react";

export default function BookPlane({ className = "", width = 120, height = 120 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="bp_grad_emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        <linearGradient id="bp_grad_teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
        <filter id="bp_soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feOffset dy="2" result="offset"/>
          <feMerge>
            <feMergeNode in="offset"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Book shadow */}
      <path d="M28 178c0 10 8 18 18 18h120c10 0 22 6 28 12 4 4 12 0 12-6v-14c0-10-8-18-18-18H68c-10 0-22-6-28-12-4-4-12 0-12 6v14z" fill="#0f172a0f"/>

      {/* Book base */}
      <path d="M36 76c0-10 8-18 18-18h70c14 0 26 12 26 26v84c0 6-6 10-12 8-12-4-28-8-40-8H54c-10 0-18-8-18-18V76z" fill="#F9FAFB" filter="url(#bp_soft)"/>
      <path d="M132 84c0-10 8-18 18-18h52c10 0 18 8 18 18v78c0 10-8 18-18 18h-52c-12 0-28 4-40 8-6 2-12-2-12-8V92c0-4 2-6 6-6h28z" fill="#FFFFFF"/>

      {/* Book edges */}
      <path d="M54 60h70c14 0 26 12 26 26v84c0 6-6 10-12 8-12-4-28-8-40-8H54c-10 0-18-8-18-18V76c0-10 8-16 18-16z" stroke="#CBD5E1" strokeWidth="2"/>
      <path d="M150 66h52c10 0 18 8 18 18v78c0 10-8 18-18 18h-52c-12 0-28 4-40 8" stroke="#CBD5E1" strokeWidth="2"/>

      {/* Book center fold */}
      <path d="M126 74v98" stroke="#E5E7EB" strokeWidth="2"/>

      {/* Book lines */}
      <path d="M168 96h36M168 114h32M168 132h28" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round"/>

      {/* Small brand mark on left page */}
      <path d="M70 150c0-6 4-10 10-10s10 4 10 10-4 10-10 10-10-4-10-10z" fill="url(#bp_grad_emerald)" opacity="0.2"/>

      {/* Paper plane */}
      <g transform="translate(154 18) rotate(10)">
        <path d="M4 42L84 4c3-2 8 2 6 6l-24 46-26-10-36-4z" fill="url(#bp_grad_teal)"/>
        <path d="M4 42l36 4 10 26 46-84" fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M40 46l14-26 18 18-32 8z" fill="#D1FAE5"/>
      </g>

      {/* Subtle outline */}
      <path d="M36 76c0-10 8-18 18-18h70c14 0 26 12 26 26v84c0 6-6 10-12 8-12-4-28-8-40-8H54c-10 0-18-8-18-18V76z" fill="none" stroke="#64748B" strokeOpacity="0.25"/>
    </svg>
  );
}
