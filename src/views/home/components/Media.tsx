import React from "react";

const Media = [
    "微博",
    "抖音",
    "小红书",
    "快手",
    "知乎",
    "B站",
    "微信公众号",
    "今日头条",
    "腾讯视频",
    "西瓜视频",
    "YouTube",
    "TikTok",
    "更多平台...",
];

export default function Platforms(): React.ReactElement {
    return (
        <section className="bg-emerald-50/60 dark:bg-[#0f1115]">
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 border-t border-emerald-100 dark:border-[#1f232b]">
                <h2 className="text-center text-3xl font-extrabold text-emerald-600 md:text-4xl dark:text-emerald-300">支持平台</h2>
                <p className="mt-3 text-center text-gray-500 dark:text-gray-400">支持主流社交媒体平台，智能适配各平台特性，让内容传播更广泛</p>

                <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
                    {Media.map((p) => (
                        <div
                            key={p}
                            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-5 text-sm font-medium text-gray-600 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#1a1d24] dark:border-[#2a2c31] dark:text-gray-300"
                        >
                            {p}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
