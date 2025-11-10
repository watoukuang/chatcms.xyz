import React from "react";
import Reveal from "@/components/ui/Reveal";

export default function Features(): React.ReactElement {
    return (
        <section className="bg-emerald-50/60 dark:bg-[#0f1115]">
            <div className="mx-auto max-w-screen-2xl px-4 lg:px-12 py-16 md:py-20 border-t border-emerald-100 dark:border-[#1f232b]">
                <h2 className="text-center text-3xl font-extrabold text-emerald-600 md:text-4xl dark:text-emerald-300">AI核心能力</h2>
                <p className="mt-3 text-center text-gray-500 dark:text-gray-400">基于先进AI技术，为您提供全方位的智能内容创作解决方案</p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Reveal delay={0}>
                        <FeatureCard icon={<AIBrainIcon className="h-10 w-10"/>} title="智能文章生成"
                                    desc="AI自动生成高质量文章内容，支持多种风格和主题，让创作更轻松"/>
                    </Reveal>
                    <Reveal delay={100}>
                        <FeatureCard icon={<VideoIcon className="h-10 w-10"/>} title="视频素材制作"
                                    desc="AI生成视频脚本、字幕和素材，一键制作专业级短视频内容"/>
                    </Reveal>
                    <Reveal delay={200}>
                        <FeatureCard icon={<ShareIcon className="h-10 w-10"/>} title="多平台分发"
                                    desc="智能适配各大社交媒体平台格式，一键分发到微博、抖音、小红书等"/>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({icon, title, desc}: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 dark:bg-[#1a1d24] dark:border-[#2a2c31] dark:hover:shadow dark:hover:border-emerald-700/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>
        </div>
    );
}

function AIBrainIcon({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
            <path d="M9.5 2A6.5 6.5 0 003 8.5C3 12 5.5 14.86 9 15.85V22h2v-6.15c3.5-.99 6-3.85 6-7.35A6.5 6.5 0 0010.5 2h-1z"/>
            <circle cx="9" cy="9" r="1"/>
            <circle cx="15" cy="9" r="1"/>
            <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
    );
}

function VideoIcon({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <circle cx="8" cy="12" r="2"/>
            <path d="M14 12l6-3v6l-6-3z"/>
        </svg>
    );
}

function ShareIcon({className = ""}: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
    );
}
