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
        <div className="mt-20 animate-fadeIn">
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

            {/* 任务流 */}
            <TaskFlow
                tasks={tasks}
                onTaskClick={(t, i) => onTaskClick(t, i)}
            />

            {/* 底部提示 */}
            <div
                className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💡 提示：任务会按时间顺序执行</span>
                <span>总计 {tasks.length} 个步骤</span>
            </div>
        </div>
    );
}