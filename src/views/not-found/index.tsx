import React from 'react';
import Link from 'next/link';

export default function NotFound(): React.ReactElement {
    return (
        <div className="relative overflow-hidden">
            {/* 背景装饰（暗色更明显） */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-[720px] rounded-full bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-emerald-500/10 blur-3xl"/>
            </div>

            <div className="px-4 lg:px-12 max-w-screen-2xl mx-auto py-16 md:py-24">
                <div className="mx-auto w-full max-w-md text-center">
                    <div
                        className="mx-auto mb-6 w-48 h-36 rounded-2xl border border-gray-200 bg-white/70 shadow-sm backdrop-blur dark:bg-[#1a1b1e]/70 dark:border-[#2a2c31] flex items-center justify-center">
                        <span
                            className="text-4xl font-bold tracking-widest bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">404</span>
                    </div>
                    <h1 className="text-lg md:text-xl font-semibold mb-2">404 - 页面未找到</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">你访问的页面不存在或已被移动。</p>
                    <Link href="/"
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-sm hover:opacity-90 transition-opacity dark:from-emerald-400 dark:to-lime-400">返回首页</Link>
                </div>
            </div>
        </div>
    );
}