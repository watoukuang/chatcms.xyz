"use client";

import React from "react";
import TaskFlow, {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";

type Props = {
    // 一维任务数组：包含父任务与其后插入的子任务
    tasks: UiTask[];
    onTaskClick: (t: UiTask, index: number) => void;
};

export default function TaskContext({tasks, onTaskClick}: Props): React.ReactElement {
    if (!tasks || tasks.length === 0) return <></>;
    return (
        <div
            className="w-full flex-1 p-2.5 animate-fadeIn flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 shadow-xl mt-3">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {`AI 规划了 ${tasks.length} 个任务`}
                                </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    点击任意卡片可进一步拆解
                </div>
            </div>

            {/* 任务流：在此遍历任务并渲染每个卡片与箭头 */}
            <div className="w-full overflow-x-auto pb-2">
                <div className="flex items-stretch gap-3 py-2 min-w-max">
                    {tasks.map((t, i) => (
                        <TaskFlow
                            key={(t.id ?? i).toString() + '-' + (t.task || '')}
                            task={t}
                            index={i}
                            total={tasks.length}
                            onTaskClick={(task) => onTaskClick(task, i)}
                        />
                    ))}
                </div>
            </div>
            <div
                className="mt-auto pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💡 提示：任务会按时间顺序执行</span>
                <span>总计 {tasks.length} 个步骤</span>
            </div>
        </div>
    );
}