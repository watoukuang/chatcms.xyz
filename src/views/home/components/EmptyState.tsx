"use client";

import React from "react";

interface EmptyStateProps {
    onPickTemplate?: (text: string) => void;
}

const columns: Array<{ title: string; icon: string; items: string[] }> = [
    {
        title: '快速开始',
        icon: '⚡',
        items: [
            '今天 14:00–17:00，帮我安排一份高效工作计划',
            '把“写周报、处理邮件、优化组件”拆解为可执行步骤',
            '给我一组 30 分钟番茄任务，用于阅读与记录'
        ]
    },
    {
        title: '任务拆解',
        icon: '🧱',
        items: [
            '为“重构首页布局”生成待办清单，含优先级与预计耗时',
            '准备项目会议：资料收集、PPT 提纲、关键里程碑，并给出时间安排',
            '制定一周学习计划：主题为前端性能优化，每天 1 小时'
        ]
    },
    {
        title: '时间安排',
        icon: '⏰',
        items: [
            '我今天 09:00–18:00，14:00–15:00固定会议，其他时间按优先级分配',
            '以 45 分钟为时间块，安排深度工作、沟通、学习与休息',
            '明天 09:00–12:00，写周报→评审→代码整理，串行计划'
        ]
    }
];

export default function EmptyState({onPickTemplate}: EmptyStateProps): React.ReactElement {
    return (
        <div className="max-w-4xl mx-auto mb-2">
            <div className="p-6 md:p-8 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-lime-600 to-lime-500 dark:from-lime-400 dark:to-lime-300 bg-clip-text text-transparent">AI
                        TODO for Me</h1>
                    <p className="mt-10 text-sm md:text-base font-medium text-lime-700 dark:text-lime-300">
                        选择时间窗口，描述你的任务，AI 将帮你拆解为可执行步骤
                    </p>
                </div>

                <div
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {columns.map((col, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex flex-col items-center text-lime-700 dark:text-lime-300">
                                <div
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-lime-50 dark:bg-lime-900/30 border border-lime-200 dark:border-lime-700/40 flex items-center justify-center mb-2">
                                    <span className="text-xl md:text-2xl">{col.icon}</span>
                                </div>
                                <span className="font-medium">{col.title}</span>
                            </div>
                            <div className="space-y-2">
                                {col.items.map((text, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onPickTemplate?.(text)}
                                        className="w-full text-left px-3 py-2 rounded-lg border border-lime-300 dark:border-lime-600 bg-white dark:bg-gray-800/60 hover:bg-lime-50 dark:hover:bg-lime-900/20 transition-colors text-sm text-lime-700 dark:text-lime-300"
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}