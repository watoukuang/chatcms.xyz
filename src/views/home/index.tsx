"use client";

import React, {useMemo, useRef, useState} from "react";
import {useRouter} from 'next/router';
import moment from 'moment';
import ChatPanel from "@/src/views/home/components/ChatPanel";
import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
import TaskContext from "@/src/views/home/components/TaskContext";
import EmptyState from "@/src/views/home/components/EmptyState";
import ErrorAlert from "@/src/views/home/components/ErrorAlert";
import ProcessingOverlay from "@/src/views/home/components/ProcessingOverlay";
import Sidebar, {TaskHistory} from "@/src/views/home/components/Sidebar";
import {useSidebar} from "@/src/contexts/SidebarContext";
import CanvasBackground from "@/src/components/CanvasBackground";
import {
    clearHistoriesFromStorage,
    loadHistoriesFromStorage,
    saveHistoriesToStorage
} from "@/src/views/home/utils/taskHistoryService";
import {applyPrevNext, buildSplitPrompt, requestTasks} from "@/src/shared/service/ChatService";

type TaskTreePanelProps = {
    tasks: UiTask[];
    focusTaskId: number | null;
    onFocusChange: (id: number | null) => void;
    onAddChild: (parentId: number | null) => void;
    onEditTask: (taskId: number) => void;
    onDeleteTask: (taskId: number) => void;
};

const TaskTreePanel: React.FC<TaskTreePanelProps> = ({
                                                         tasks,
                                                         focusTaskId,
                                                         onFocusChange,
                                                         onAddChild,
                                                         onEditTask,
                                                         onDeleteTask,
                                                     }) => {
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    const childrenMap = React.useMemo(() => {
        const map = new Map<number | 'root', UiTask[]>();
        tasks.forEach(t => {
            const key: number | 'root' = t.parentId ?? 'root';
            const list = map.get(key) || [];
            list.push(t);
            map.set(key, list);
        });
        return map;
    }, [tasks]);

    const renderNodes = (parentKey: number | 'root', depth: number): React.ReactNode => {
        const list = childrenMap.get(parentKey) || [];
        return list
            .filter(task => {
                // 如果有搜索词，只显示匹配的任务
                if (!searchQuery.trim()) return true;
                return task.task?.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map(task => {
                const hasChildren = !!childrenMap.get(task.id!);
                const isSelected = focusTaskId === task.id;
                return (
                    <div key={task.id} style={{marginLeft: depth * 12}} className="mt-0.5">
                        <div
                            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-xs sm:text-sm ${
                                isSelected
                                    ? 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-800 dark:text-gray-200'
                            }`}
                            onClick={() => onFocusChange(task.id!)}
                        >
                            <div className="flex items-center gap-1 min-w-0">
                                {hasChildren && <span className="text-[10px] sm:text-xs">📂</span>}
                                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                                    {task.task || '未命名任务'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddChild(task.id!);
                                    }}
                                    className="px-1 rounded hover:bg-lime-100 dark:hover:bg-lime-900/40"
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
                                    className="px-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                    title="重命名"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTask(task.id!);
                                    }}
                                    className="px-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                                    title="删除任务及子任务"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                        {renderNodes(task.id!, depth + 1)}
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
                {renderNodes('root', 0)}
            </div>
        </div>
    );
};

export default function HomeLanding(): React.ReactElement {
    const router = useRouter();
    const {isCollapsed, collapse, expand} = useSidebar();
    const [chatInput, setChatInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [jsonErrors, setJsonErrors] = useState<string[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    // 一维任务数组：包含首次生成的任务与后续插入的子任务
    const [tasks, setTasks] = useState<UiTask[]>([]);
    // 当前画布聚焦的父任务 id，为 null 表示顶层视图
    const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
    // 本地历史：持久化每次任务拆解结果
    const [histories, setHistories] = useState<TaskHistory[]>([]);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    // 右侧内容区域引用（用于展开左侧栏时点击右侧检测）
    const rightColRef = useRef<HTMLDivElement | null>(null);
    // 右侧任务树是否收起
    const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);

    // 发送条件：只要求有文本
    const canSend = useMemo(() => {
        return !loading && chatInput.trim().length > 0;
    }, [loading, chatInput]);

    // ---------- 历史持久化 ----------
    React.useEffect(() => {
        setHistories(loadHistoriesFromStorage());
    }, []);

    const addHistory = (title: string, generated: UiTask[]) => {
        const entry: TaskHistory = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title,
            createdAt: new Date().toISOString(),
            tasks: applyPrevNext(generated)
        };
        const next = [entry, ...histories];
        setHistories(next);
        saveHistoriesToStorage(next);
        setActiveHistoryId(entry.id);
        setFocusTaskId(null);
    };

    const updateActiveHistoryTasks = (updated: UiTask[]) => {
        if (!activeHistoryId) return;
        const next = histories.map(h => h.id === activeHistoryId ? {...h, tasks: applyPrevNext(updated)} : h);
        setHistories(next);
        saveHistoriesToStorage(next);
    };

    const clearAllHistories = () => {
        setActiveHistoryId(null);
        setHistories([]);
        clearHistoriesFromStorage();
        setFocusTaskId(null);
    };

    const restoreFromHistory = (h: TaskHistory) => {
        // 确保从历史记录恢复的任务也有正确的 level 字段
        const tasksWithLevel = (h.tasks || []).map(t => ({
            ...t,
            level: t.level ?? (t.parentId ? 1 : 0), // 如果没有 level，根据 parentId 推断
        }));
        setTasks(applyPrevNext(tasksWithLevel));
        setActiveHistoryId(h.id);
        setFocusTaskId(null);
    };

    // 支持通过 query 参数 historyId 深链选中历史
    React.useEffect(() => {
        if (!router.isReady) return;
        const raw = router.query?.historyId;
        const historyId = Array.isArray(raw) ? raw[0] : raw;
        if (typeof historyId === 'string' && historyId) {
            const found = histories.find(h => h.id === historyId);
            if (found) {
                restoreFromHistory(found);
            } else {
                setActiveHistoryId(historyId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, histories]);

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        setJsonErrors([]);
        const userText = chatInput.trim();
        try {
            abortRef.current = new AbortController();
            const newTasks = await requestTasks(userText, abortRef.current.signal);
            console.log('📥 AI 返回的原始任务:', newTasks);
            // 主任务初始化为 level 0
            const mainTasks = newTasks.map(t => ({...t, level: 0}));
            console.log('✅ 设置 level 后的任务:', mainTasks);
            const finalTasks = applyPrevNext(mainTasks);
            console.log('🔗 应用 prev/next 后的任务:', finalTasks);
            setTasks(finalTasks);
            // 保存历史记录
            addHistory(userText, mainTasks);
            setChatInput("");
            setFocusTaskId(null);
        } catch (err: any) {
            setJsonErrors([err?.message || '请求失败']);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };


    // 点击卡片触发“二次拆解”，建立父子关系
    const handleSplitTask = async (t: UiTask, ctx?: { taskIndex: number }) => {
        setLoading(true);
        try {
            const splitPrompt = buildSplitPrompt(t);
            abortRef.current = new AbortController();
            const childrenRaw = await requestTasks(splitPrompt, abortRef.current.signal);

            setTasks((prev: UiTask[]) => {
                const next = [...prev];

                // 为子任务设置父子关系
                const childrenWithParent = childrenRaw.map(child => ({
                    ...child,
                    parentId: t.id,
                    level: (t.level || 0) + 1,
                }));

                // 更新父任务的 children 字段
                const parentIndex = next.findIndex(task => task.id === t.id);
                if (parentIndex !== -1) {
                    next[parentIndex] = {
                        ...next[parentIndex],
                        children: childrenWithParent.map(c => c.id!),
                        collapsed: false, // 默认展开
                    };
                }

                // 将子任务添加到列表中
                next.push(...childrenWithParent);

                updateActiveHistoryTasks(next);
                return next;
            });
            // 拆分完成后，将画布聚焦到该父任务的子任务视图
            if (t.id != null) {
                setFocusTaskId(t.id as number);
            }
        } catch (err: any) {
            setJsonErrors([err?.message || '拆分失败']);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };

    // 折叠/展开子任务
    const handleToggleCollapse = (taskId: number) => {
        setTasks(prev => {
            const next = prev.map(t =>
                t.id === taskId ? {...t, collapsed: !t.collapsed} : t
            );
            updateActiveHistoryTasks(next);
            return next;
        });
    };

    const cancelProcessing = () => {
        if (abortRef.current) {
            try {
                abortRef.current.abort();
            } catch {
            }
            abortRef.current = null;
        }
        setLoading(false);
    };

    // 右侧树形菜单：选择聚焦任务
    const handleFocusChange = (id: number | null) => {
        setFocusTaskId(id);
    };

    // 右侧树形菜单：新增子任务（简单手动创建占位任务）
    const handleAddChild = (parentId: number | null) => {
        setTasks(prev => {
            const next = [...prev];
            const maxId = next.reduce((m, t) => Math.max(m, t.id || 0), 0);
            const parent = parentId != null ? next.find(t => t.id === parentId) : undefined;
            const level = parent ? (parent.level || 0) + 1 : 0;
            const newTask: UiTask = {
                id: maxId + 1,
                task: parent ? '新子任务' : '新任务',
                remark: '',
                state: 'pending',
                parentId: parentId ?? undefined,
                level,
            };
            next.push(newTask);

            if (parent && parent.id != null) {
                next.forEach(t => {
                    if (t.id === parent.id) {
                        const children = t.children ? [...t.children] : [];
                        children.push(newTask.id!);
                        (t as any).children = children;
                        (t as any).collapsed = false;
                    }
                });
            }

            updateActiveHistoryTasks(next);
            return next;
        });
        if (parentId != null) {
            setFocusTaskId(parentId);
        }
    };

    // 右侧树形菜单：重命名任务（仅修改标题）
    const handleEditTaskFromTree = (taskId: number) => {
        const target = tasks.find(t => t.id === taskId);
        const currentName = target?.task || '';
        const name = window.prompt('重命名任务', currentName);
        if (name == null) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        setTasks(prev => {
            const next = prev.map(t => t.id === taskId ? {...t, task: trimmed} : t);
            updateActiveHistoryTasks(next);
            return next;
        });
    };

    // 右侧树形菜单：删除任务及其所有子任务
    const handleDeleteTaskFromTree = (taskId: number) => {
        const target = tasks.find(t => t.id === taskId);
        const name = target?.task || `任务 ${taskId}`;
        if (!window.confirm(`确定删除「${name}」及其所有子任务吗？`)) return;

        setTasks(prev => {
            const toDelete = new Set<number>();
            const queue: number[] = [taskId];
            while (queue.length) {
                const id = queue.pop()!;
                if (toDelete.has(id)) continue;
                toDelete.add(id);
                prev.forEach(t => {
                    if (t.parentId === id && t.id != null) {
                        queue.push(t.id as number);
                    }
                });
            }

            const next = prev
                .filter(t => t.id != null && !toDelete.has(t.id as number))
                .map(t => ({
                    ...t,
                    children: t.children?.filter(cid => !toDelete.has(cid))
                }));

            updateActiveHistoryTasks(next);

            // 如果当前聚焦的任务被删除，则回到顶层视图
            setFocusTaskId(prevFocus => (prevFocus != null && toDelete.has(prevFocus) ? null : prevFocus));

            return next;
        });
    };

    const isEmpty = tasks.length === 0 && !loading;
    return (
        <div className={"relative min-h-screen pb-0 pt-[60px] overflow-hidden"}>
            {/* 背景（渐变 + 柔和漂移动效 + 画布网格/斑点） */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-lime-50/40 via-white to-white dark:from-[#0f1115] dark:via-lime-900/5 dark:to-[#0f1115]"/>
            <div
                className="absolute inset-0 pointer-events-none anim-bg-soft-light dark:anim-bg-soft-dark opacity-[0.5]"/>
            <CanvasBackground variant="grid" opacity={0.10}/>
            <CanvasBackground variant="speckle" opacity={0.08}/>

            {/* 主内容容器：左右并排两栏（固定视口高度，避免页面级滚动） */}
            <div className="relative z-10 w-full mx-auto flex gap-4 h-[calc(100dvh-60px)] overflow-hidden">
                {/* 左右栏分割线悬浮把手（始终靠近分割处） */}
                <button
                    type="button"
                    title={isCollapsed ? '展开左侧栏' : '收起左侧栏'}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isCollapsed) expand(); else collapse();
                    }}
                    style={{left: isCollapsed ? 8 : 298}}
                    className="absolute top-1/2 -translate-y-1/2 z-30 h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label={isCollapsed ? '展开左侧栏' : '收起左侧栏'}
                >
                    {isCollapsed ? '⟩' : '⟨'}
                </button>

                {/* 左侧历史侧栏：常驻显示 */}
                <div
                    className={`shrink-0 h-[calc(100dvh-60px)] transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[280px] opacity-100'}`}
                    aria-hidden={isCollapsed}>
                    <div className={`h-full ${isCollapsed ? '' : 'border-r border-gray-200 dark:border-gray-700'}`}>
                        <Sidebar
                            histories={histories}
                            activeId={activeHistoryId}
                            onSelect={restoreFromHistory}
                            onNewTodo={() => {
                                setTasks([]);
                                setActiveHistoryId(null);
                                setChatInput("");
                                setFocusTaskId(null);
                            }}
                            onClearAll={clearAllHistories}
                        />
                    </div>
                </div>

                {/* 右侧主内容（独立滚动容器） */}
                <div className="flex-1 h-full overflow-y-auto" ref={rightColRef} onClick={() => {
                    if (isCollapsed) expand();
                }}>
                    {/* 内容 + 底部输入栏（非固定） */}
                    <div className="flex flex-col h-full">
                        {/* 顶部错误提示 */}
                        {jsonErrors.length > 0 && (
                            <div className="mb-2">
                                <ErrorAlert errors={jsonErrors} onDismiss={() => setJsonErrors([])}/>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col">
                            {isEmpty ? (
                                <div className="flex-1 grid place-items-center">
                                    {tasks.length === 0 && !loading && (
                                        <EmptyState onPickTemplate={(t) => setChatInput(t)}/>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex gap-3">
                                    {/* 左侧：任务流程画布 */}
                                    <div className="flex-1 min-w-0 relative">
                                        {/* 临时调试信息 */}
                                        {/*<div className="absolute top-2 left-2 z-50 bg-yellow-100 dark:bg-yellow-900/50 text-xs p-2 rounded border border-yellow-300 dark:border-yellow-700 max-w-md">*/}
                                        {/*    <div className="font-bold mb-1">🐛 调试信息</div>*/}
                                        {/*    <div>任务总数: {tasks.length}</div>*/}
                                        {/*    <div>focusTaskId: {focusTaskId ?? 'null'}</div>*/}
                                        {/*    <div>顶层任务(level=0且无parentId): {tasks.filter(t => !t.parentId && (t.level ?? 0) === 0).length}</div>*/}
                                        {/*    {tasks.slice(0, 3).map((t, i) => (*/}
                                        {/*        <div key={i} className="mt-1 text-[10px] border-t border-yellow-300 pt-1">*/}
                                        {/*            #{t.id} {t.task?.substring(0, 15)} | level:{t.level} | parentId:{t.parentId ?? 'null'}*/}
                                        {/*        </div>*/}
                                        {/*    ))}*/}
                                        {/*</div>*/}
                                        <TaskContext
                                            tasks={tasks}
                                            onTaskClick={(t, index) => handleSplitTask(t, {taskIndex: index})}
                                            onToggleCollapse={handleToggleCollapse}
                                            onReset={() => {
                                                setTasks([]);
                                                updateActiveHistoryTasks([]);
                                                setFocusTaskId(null);
                                            }}
                                            groupId={activeHistoryId || undefined}
                                            groupTitle={(histories.find(h => h.id === activeHistoryId)?.title) || undefined}
                                            focusTaskId={focusTaskId}
                                        />
                                    </div>

                                    {/* 右侧：任务树形结构（可收起） */}
                                    <div
                                        className={`transition-all duration-300 flex-shrink-0 ${
                                            isRightCollapsed ? 'w-0 opacity-0' : 'w-[260px] opacity-100'
                                        }`}
                                    >
                                        <div
                                            className="h-full border-l border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 rounded-l-none rounded-md shadow-sm overflow-hidden">
                                            <TaskTreePanel
                                                tasks={tasks}
                                                focusTaskId={focusTaskId}
                                                onFocusChange={handleFocusChange}
                                                onAddChild={handleAddChild}
                                                onEditTask={handleEditTaskFromTree}
                                                onDeleteTask={handleDeleteTaskFromTree}
                                            />
                                        </div>
                                    </div>

                                    {/* 右侧栏收缩/展开按钮（固定在画布右边缘） */}
                                    <button
                                        type="button"
                                        title={isRightCollapsed ? '展开任务结构' : '收起任务结构'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsRightCollapsed(prev => !prev);
                                        }}
                                        style={{right: isRightCollapsed ? 8 : 268}}
                                        className="absolute top-1/2 -translate-y-1/2 z-30 h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow transition-all duration-200 hover:scale-105 active:scale-95"
                                        aria-label={isRightCollapsed ? '展开任务结构' : '收起任务结构'}
                                    >
                                        {isRightCollapsed ? '⟨' : '⟩'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 底部输入栏（置于右栏内部）：仅在空状态或加载中显示 */}
                        {(isEmpty || loading) && (
                            <div className="bg-transparent pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="w-full max-w-4xl mx-auto px-4">
                                    <ChatPanel
                                        value={chatInput}
                                        setValue={setChatInput}
                                        loading={loading}
                                        onSubmit={handleSend}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 加工等待交互层 */}
            {loading && (
                <ProcessingOverlay
                    onCancel={cancelProcessing}
                    onRetry={canSend ? handleSend : undefined}
                    onImprovePrompt={isEmpty ? undefined : () => {
                        // 将当前卡片流程摘要写回输入框以便用户优化
                        const summary = tasks.map(t => `${t.startTime}-${t.endTime} ${t.task}`).join('\n');
                        setChatInput((prev) => prev ? `${prev}\n\n优化方向：\n${summary}` : summary);
                    }}
                    message={chatInput || '正在根据你的输入进行任务拆分'}
                />
            )}
        </div>
    );
}
