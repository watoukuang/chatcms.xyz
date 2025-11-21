import React from 'react';

type LogoProps = { className?: string };

export default function LogoIcon({className = 'w-10 h-10'}: LogoProps): React.ReactElement {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* 松鼠耳朵：尖尖三角，暖棕主色 */}
            <path
                d="M5.2 9.2L7.4 7.0C7.9 6.5 8.7 6.4 9.3 6.7L9.8 7.0L8.8 9.6C8.2 9.8 7.6 10.1 7.1 10.5L5.2 9.2Z"
                fill="#D99559"
            />
            <path
                d="M18.8 9.2L16.6 7.0C16.1 6.5 15.3 6.4 14.7 6.7L14.2 7.0L15.2 9.6C15.8 9.8 16.4 10.1 16.9 10.5L18.8 9.2Z"
                fill="#D99559"
            />

            {/* 松鼠脸部轮廓：两侧收窄，下巴更尖一点，浅棕 */}
            <path
                d="M7.8 9.6C8.6 7.7 10.1 6.4 12 6.4C13.9 6.4 15.4 7.7 16.2 9.6C17.5 10.1 18.4 11.4 18.4 12.9C18.4 15.3 16.4 17.6 12 17.6C7.6 17.6 5.6 15.3 5.6 12.9C5.6 11.4 6.5 10.1 7.8 9.6Z"
                fill="#F5D3A1"
            />

            {/* 腮红：橙粉色 */}
            <circle cx="9" cy="13.6" r="0.9" fill="#F4A8A0" />
            <circle cx="15" cy="13.6" r="0.9" fill="#F4A8A0" />

            {/* 眼睛 */}
            <circle cx="10" cy="11.4" r="0.95" fill="#3B3B3B"/>
            <circle cx="14" cy="11.4" r="0.95" fill="#3B3B3B"/>
            <circle cx="9.7" cy="11.1" r="0.23" fill="#FFFFFF"/>
            <circle cx="13.7" cy="11.1" r="0.23" fill="#FFFFFF"/>

            {/* 鼻子：小一点，用深色固定值以增强对比 */}
            <circle cx="12" cy="12.3" r="0.4" fill="#2A2A2A" />

            {/* 两颗门牙，略微收窄，避免下巴太圆 */}
            <rect x="11.45" y="13" width="0.6" height="1.2" rx="0.15" fill="#FFFFFF"/>
            <rect x="11.95" y="13" width="0.6" height="1.2" rx="0.15" fill="#FFFFFF"/>
        </svg>
    );
}