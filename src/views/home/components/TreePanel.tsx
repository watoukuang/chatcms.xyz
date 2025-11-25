"use client";

import React from "react";
import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";

type ParentKey = number | 'root';

export type TaskTreePanelProps = {
    tasks: UiTask[];
    focusTaskId: number | null;
    onFocusChange: (id: number | null) => void;
    onAddChild: (parentId: number | null) => void;
    onEditTask: (taskId: number) => void;
    onDeleteTask: (taskId: number) => void;
};

const buildChildrenMap = (tasks: UiTask[]): Map<ParentKey, UiTask[]> => {
    const map = new Map<ParentKey, UiTask[]>();
    tasks.forEach(t => {
        const key: ParentKey = t.parentId ?? 'root';
        const list = map.get(key) || [];
        list.push(t);
        map.set(key, list);
    });
    return map;
};

const TreePanel: React.FC<TaskTreePanelProps> = ({
    tasks,
    focusTaskId,
    onFocusChange,
    onAddChild,
    onEditTask,
    onDeleteTask,
}) => {
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    const childrenMap = React.useMemo(() => buildChildrenMap(tasks), [tasks]);

    const normalizedQuery = React.useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

    const renderNodes = (
        parentKey: ParentKey,
        depth: number,
        visited: Set<number>
    ): React.ReactNode => {
        const list = childrenMap.get(parentKey) || [];

        return list
            .filter(task => {
                // 如果有搜索词，只显示匹配的任务
                if (!normalizedQuery) return true;
                return task.task?.toLowerCase().includes(normalizedQuery);
            })
            .map(task => {
                if (task.id == null) return null;

                // 防止因为错误的 parentId 造成的环形结构，避免无限递归
                if (visited.has(task.id)) {
                    return (
                        <div key={task.id} style={{marginLeft: depth * 12}} className="mt-0.5">
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-[11px] text-red-500 dark:bg-red-900/30 dark:text-red-200">
                                <span>⚠ 循环引用，已停止展开：{task.task || '未命名任务'}</span>
                            </div>
                        </div>
                    );
                }

                const nextVisited = new Set(visited);
                nextVisited.add(task.id);

                const hasChildren = !!childrenMap.get(task.id);

                return (
                    <div key={task.id} style={{marginLeft: depth * 12}} className="mt-0.5">
                        <div
                            className={`cursor-pointer px-2 py-1.5 rounded text-xs transition-colors ${
                                focusTaskId === task.id
                                    ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                            }`}
                            onClick={() => onFocusChange(task.id!)}
                            title={hasChildren
                                ? `点击查看子任务 (${task.children?.length} 个)`
                                : (task.parentId
                                    ? '叶子任务：点击查看同级任务'
                                    : '叶子任务：点击回到主视图')
                            }
                        >
                            <div className="flex items-center justify-between gap-1 min-w-0">
                                <div
                                    className="flex items-center gap-1 min-w-0 text-[11px] text-gray-800 dark:text-gray-200">
                                    {hasChildren && <span className="text-[10px] sm:text-xs">📂</span>}
                                    {!hasChildren && <span className="text-[10px] sm:text-xs">📄</span>}
                                    <span
                                        className="truncate max-w-[140px] sm:max-w-[200px]"
                                        title={task.task || '未命名任务'}
                                    >
                                        {(task.task || '未命名任务').length > 10
                                            ? (task.task || '未命名任务').slice(0, 10) + '…'
                                            : (task.task || '未命名任务')}
                                    </span>
                                </div>
                                <div
                                    className="flex flex-row items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddChild(task.id!);
                                        }}
                                        className="px-1 rounded hover:bg-lime-100 dark:hover:bg-lime-900/40 flex-shrink-0"
                                        title="添加子任务"
                                    >
                                        ＋
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditTask(task.id!);
                                        }}
                                        className="px-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40 flex-shrink-0"
                                        title="编辑任务文案"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteTask(task.id!);
                                        }}
                                        className="px-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 flex-shrink-0"
                                        title="删除任务及子任务"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                        {renderNodes(task.id, depth + 1, nextVisited)}
                    </div>
                );
            });
    };

    if (!tasks.length) {
        return (
            <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2">
                暂无任务，请先在左侧生成 TODO。
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">任务结构</div>
                    <button
                        type="button"
                        className="text-[11px] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                        onClick={() => onFocusChange(null)}
                    >
                        顶层视图
                    </button>
                </div>
                {/* 搜索框 */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索任务..."
                        className="w-full text-xs px-2 py-1.5 pl-7 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-500 dark:focus:ring-lime-600"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
                            title="清除搜索"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
                {renderNodes('root', 0, new Set<number>())}
            </div>
        </div>
    );
};

export default TreePanel;
