import React from "react";
import Image from "next/image";
import LogoIcon from "@/components/Icons/LogoIcon";

export default function Banner(): React.ReactElement {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto max-w-screen-2xl px-0 pt-16 pb-12 md:pt-20 md:pb-16">
                <div className="grid items-center gap-10 md:grid-cols-2">
                    <div>
                        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-emerald-600 md:text-6xl">AI内容创作</h1>
                        <p className="mt-6 text-lg leading-7 text-gray-600">
                            智能生成文章与视频素材。AI驱动创作，
                            <span className="rounded bg-emerald-50 px-1 text-emerald-600">一键分发到多个社交媒体</span>
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700 transition-shadow shadow-none hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                            >
                                开始创作
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center justify-center rounded-lg border px-5 py-3 transition-colors border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-400 dark:hover:bg-emerald-900/20"
                            >
                                体验AI生成
                            </a>
                        </div>
                        <p className="mt-6 text-sm text-gray-400">基于先进AI技术，让内容创作更智能、更高效、更具创意</p>
                    </div>

                    <div className="relative">
                        <div className="relative flex items-center justify-center">
                            <div
                                className="mx-auto h-72 w-72 md:h-80 md:w-80 overflow-hidden rounded-3xl bg-white dark:bg-[#141518] ring-1 ring-emerald-100 dark:ring-emerald-900/30 shadow-[0_0_25px_rgba(16,185,129,0.25)] dark:shadow-[0_0_28px_rgba(16,185,129,0.35)]">
                                <LogoIcon className="w-full h-full"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .float-slow {
                    animation: floatY 6s ease-in-out infinite;
                }

                @keyframes floatY {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-6px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}