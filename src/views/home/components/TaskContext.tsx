"use client";

import React from "react";
import TaskFlow, {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";

type Props = {
    // 一维任务数组：包含父任务与其后插入的子任务
    tasks: UiTask[];
    onTaskClick: (t: UiTask, index: number) => void;
    onReset?: () => void;
};

export default function TaskContext({tasks, onTaskClick, onReset}: Props): React.ReactElement {
    if (!tasks || tasks.length === 0) return <></>;
    return (
        <div
            className="w-full flex-1 p-2.5 animate-fadeIn flex flex-col rounded border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 shadow-xl mt-3">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {`AI 规划了 ${tasks.length} 个任务`}
                                </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onReset?.()}
                        className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        重置
                    </button>
                </div>
            </div>

            {/* 任务流：≤3 单行展示带箭头；>3 自动换行且隐藏箭头避免错位 */}
            <div className="w-full pb-4">
                {tasks.length <= 3 ? (
                    <div className="flex items-stretch gap-5 py-2">
                        {tasks.map((t, i) => (
                            <TaskFlow
                                key={(t.id ?? i).toString() + '-' + (t.task || '')}
                                task={t}
                                index={i}
                                total={tasks.length}
                                onTaskClick={(task) => onTaskClick(task, i)}
                                showArrow={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-stretch gap-5 py-2">
                        {tasks.map((t, i) => (
                            <div
                                key={(t.id ?? i).toString() + '-' + (t.task || '')}
                                className="basis-full sm:basis-1/2 md:basis-1/3 flex"
                            >
                                <TaskFlow
                                    task={t}
                                    index={i}
                                    total={tasks.length}
                                    onTaskClick={(task) => onTaskClick(task, i)}
                                    showArrow={false}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div
                className="mt-auto pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💡 提示：任务会按时间顺序执行</span>
                <span>总计 {tasks.length} 个步骤</span>
            </div>
        </div>
    );
}