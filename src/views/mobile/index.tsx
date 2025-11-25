import React from 'react';
import Articles from "@/src/components/Articles";

export default function MobileHero(): React.ReactElement {
    return (
        <div className="md:hidden">
            {/* 背景渐变与柔光装饰 */}
            <section className="relative overflow-hidden">
                <div className="absolute -z-10 inset-0">
                    <div
                        className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[720px] rounded-full bg-gradient-to-r from-emerald-400/10 via-sky-400/10 to-purple-400/10 blur-3xl"/>
                </div>

                <div className="px-4 sm:px-6 max-w-7xl mx-auto pt-10 pb-8">
                    {/* 标题与说明 */}
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        直观探索主流共识机制
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        通过交互式演示理解 POW、POS、DPoS、BFT、POH 等共识的出块、验证与安全性差异，助你快速建立体系化认知。
                    </p>
                </div>
            </section>

            {/* 轻量推荐区：最新/热门 */}
            <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-8">
                <Articles/>
            </section>
        </div>
    );
}
