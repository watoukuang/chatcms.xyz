"use client";

import React, {useMemo, useRef, useState} from "react";
import {useRouter} from 'next/router';
import ChatPanel from "@/src/views/home/components/ChatPanel";
import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
import TaskContext from "@/src/views/home/components/TaskContext";
import EmptyState from "@/src/views/home/components/EmptyState";
import ErrorAlert from "@/src/views/home/components/ErrorAlert";
import Overlay from "@/src/views/home/components/Overlay";
import Sidebar, {TaskHistory} from "@/src/views/home/components/Sidebar";
import ToggleBtn from "@/src/views/home/components/ToggleBtn";
import TreePanel from "@/src/views/home/components/TreePanel";
import {useSidebar} from "@/src/contexts/SidebarContext";
import CanvasBackground from "@/src/components/CanvasBackground";
import {
    clearHistoriesFromStorage,
    loadHistoriesFromStorage,
    saveHistoriesToStorage
} from "@/src/views/home/utils/taskHistoryService";
import {applyPrevNext, buildSplitPrompt, requestTasks} from "@/src/shared/service/ChatService";

const normalizeTasksFromHistory = (tasks: UiTask[]): UiTask[] => {
    const withLevelAndVisibility = tasks.map(t => {
        const hasChildren = t.children && t.children.length > 0;
        const hasPrevOrNext = t.prev != null || t.next != null;
        const defaultVisible = t.visibleOnMainFlow ?? (hasChildren && !hasPrevOrNext ? false : true);

        return {
            ...t,
            level: t.level ?? (t.parentId ? 1 : 0),
            visibleOnMainFlow: defaultVisible,
        };
    });

    return withLevelAndVisibility.map((t, i) => {
        const hasExistingChain = t.prev != null || t.next != null;
        if (hasExistingChain) {
            return t;
        }
        return {
            ...t,
            prev: i > 0 ? withLevelAndVisibility[i - 1]?.id : undefined,
            next: i < withLevelAndVisibility.length - 1 ? withLevelAndVisibility[i + 1]?.id : undefined,
        };
    });
};

const splitTaskIntoChildren = (prevTasks: UiTask[], parent: UiTask, childrenRaw: UiTask[]): {
    next: UiTask[];
    children: UiTask[]
} => {
    const next = [...prevTasks];
    const maxId = next.reduce((max, task) => Math.max(max, task.id || 0), 0);

    const childrenWithParent = childrenRaw.map((child, index) => ({
        ...child,
        id: maxId + index + 1,
        parentId: parent.id,
        level: (parent.level || 0) + 1,
        prev: undefined as number | undefined,
        next: undefined as number | undefined,
        visibleOnMainFlow: true,
    }));

    for (let i = 0; i < childrenWithParent.length; i++) {
        if (i > 0) {
            childrenWithParent[i].prev = childrenWithParent[i - 1].id;
        }
        if (i < childrenWithParent.length - 1) {
            childrenWithParent[i].next = childrenWithParent[i + 1].id;
        }
    }

    const parentTask = next.find(task => task.id === parent.id);
    const parentPrev = parentTask?.prev;
    const parentNext = parentTask?.next;

    if (childrenWithParent.length > 0) {
        const firstChild = childrenWithParent[0];
        const lastChild = childrenWithParent[childrenWithParent.length - 1];

        if (parentPrev != null) {
            firstChild.prev = parentPrev;
            const prevTask = next.find(task => task.id === parentPrev);
            if (prevTask) {
                prevTask.next = firstChild.id;
            }
        }

        if (parentNext != null) {
            lastChild.next = parentNext;
            const nextTask = next.find(task => task.id === parentNext);
            if (nextTask) {
                nextTask.prev = lastChild.id;
            }
        }
    }

    const parentIndex = next.findIndex(task => task.id === parent.id);
    if (parentIndex !== -1) {
        next[parentIndex] = {
            ...next[parentIndex],
            children: childrenWithParent.map(c => c.id!),
            collapsed: false,
            prev: undefined,
            next: undefined,
            visibleOnMainFlow: false,
        };
    }

    next.push(...childrenWithParent);
    return {next, children: childrenWithParent};
};

const collectTaskIdsToDelete = (tasks: UiTask[], rootId: number): { remaining: UiTask[]; toDelete: Set<number> } => {
    const toDelete = new Set<number>();
    const queue: number[] = [rootId];

    while (queue.length) {
        const id = queue.pop()!;
        if (toDelete.has(id)) continue;
        toDelete.add(id);
        tasks.forEach(t => {
            if (t.parentId === id && t.id != null) {
                queue.push(t.id as number);
            }
        });
    }

    const remaining = tasks
        .filter(t => t.id != null && !toDelete.has(t.id as number))
        .map(t => ({
            ...t,
            children: t.children?.filter(cid => !toDelete.has(cid)),
        }));

    return {remaining, toDelete};
};

const HomeLanding: React.FC = () => {
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
    // 当前选中的任务 id（用于高亮显示）
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
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
        // 只在任务没有 prev/next 时才应用 applyPrevNext（兼容旧代码）
        // 新代码应该传入已经有 prev/next 的任务
        const tasksWithChain = generated.some(t => t.prev != null || t.next != null)
            ? generated // 已有链表关系，直接使用
            : applyPrevNext(generated); // 没有链表关系，根据数组顺序建立

        const entry: TaskHistory = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title,
            createdAt: new Date().toISOString(),
            tasks: tasksWithChain
        };
        const next = [entry, ...histories];
        setHistories(next);
        saveHistoriesToStorage(next);
        setActiveHistoryId(entry.id);
        setFocusTaskId(null);
    };

    const updateActiveHistoryTasks = (updated: UiTask[]) => {
        if (!activeHistoryId) return;
        // 注意：不调用 applyPrevNext，直接保存更新后的任务列表
        // 因为任务列表中已经包含了正确的 prev/next 链表关系
        const next = histories.map(h => h.id === activeHistoryId ? {...h, tasks: updated} : h);
        setHistories(next);
        saveHistoriesToStorage(next);
        // 不重置 focusTaskId，保持用户当前的视图状态
    };

    const clearAllHistories = () => {
        setActiveHistoryId(null);
        setHistories([]);
        clearHistoriesFromStorage();
        setFocusTaskId(null);
    };

    const restoreFromHistory = (h: TaskHistory) => {
        // 确保从历史记录恢复的任务也有正确的 level 和 visibleOnMainFlow 字段
        const tasksWithChain = normalizeTasksFromHistory(h.tasks || []);
        // 注意：不调用 applyPrevNext，因为它会覆盖已有的链表关系
        // 只有在任务没有 prev/next 时才根据数组顺序建立关系（兼容旧数据）
        setTasks(tasksWithChain);
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
            // 主任务初始化为 level 0 和 visibleOnMainFlow true
            const mainTasks = newTasks.map(t => ({...t, level: 0, visibleOnMainFlow: true}));
            console.log('✅ 设置 level 后的任务:', mainTasks);
            const finalTasks = applyPrevNext(mainTasks);
            console.log('🔗 应用 prev/next 后的任务:', finalTasks);
            setTasks(finalTasks);
            // 保存历史记录（传入已经有 prev/next 的任务）
            addHistory(userText, finalTasks);
            setChatInput("");
            setFocusTaskId(null);
        } catch (err: any) {
            setJsonErrors([err?.message || '请求失败']);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };


    // 点击卡片触发"二次拆解"，建立父子关系
    const handleSplitTask = async (t: UiTask, ctx?: { taskIndex: number }) => {
        setLoading(true);
        try {
            const splitPrompt = buildSplitPrompt(t);
            abortRef.current = new AbortController();
            const childrenRaw = await requestTasks(splitPrompt, abortRef.current.signal);

            setTasks((prev: UiTask[]) => {
                const {next, children} = splitTaskIntoChildren(prev, t, childrenRaw);

                // 调试日志：打印拆分后的任务结构
                console.log('✅ 拆分完成，任务结构：', {
                    parentTask: t.task,
                    parentId: t.id,
                    childrenCount: children.length,
                    children: children.map(c => ({
                        id: c.id,
                        task: c.task,
                        prev: c.prev,
                        next: c.next,
                        parentId: c.parentId,
                        visibleOnMainFlow: c.visibleOnMainFlow
                    })),
                    parentAfterSplit: next.find(task => task.id === t.id),
                });

                updateActiveHistoryTasks(next);
                return next;
            });

            // 拆分完成后，保持当前视图（如果在顶层，继续显示顶层；如果在某个父任务下，继续显示）
            // 不自动切换 focusTaskId，让用户看到子任务已经替换父任务在链表中的位置
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

    // 右侧树形菜单：选择聚焦任务（优化的交互逻辑）
    const handleFocusChange = (id: number | null) => {
        if (id === null) {
            // 点击"顶层视图"，回到主链表
            setFocusTaskId(null);
            return;
        }

        // 找到被点击的任务
        const clickedTask = tasks.find(t => t.id === id);
        if (!clickedTask) {
            setFocusTaskId(null);
            return;
        }

        const hasChildren = clickedTask.children && clickedTask.children.length > 0;

        if (hasChildren) {
            // 有子任务：显示子任务
            setFocusTaskId(id);
        } else {
            // 叶子节点（无子任务）：智能处理
            if (clickedTask.parentId) {
                // 是子任务：显示其父任务的所有子任务（同级兄弟）
                setFocusTaskId(clickedTask.parentId);
            } else {
                // 是根节点且无子任务：回到主链表视图
                setFocusTaskId(null);
            }
        }
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
            const {remaining: next, toDelete} = collectTaskIdsToDelete(prev, taskId);

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
                {/* 左侧历史侧栏：常驻显示，按钮相对侧栏定位；折叠时保留窄容器以便按钮可点击 */}
                <div
                    className={`relative shrink-0 h-[calc(100dvh-60px)] transition-all duration-300 ${isCollapsed ? 'w-6' : 'w-[280px]'}`}
                    aria-hidden={false}
                >
                    {/* 左侧折叠/展开按钮：始终贴着侧栏右边缘 */}
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-30">
                        <ToggleBtn
                            side="left"
                            collapsed={isCollapsed}
                            onToggle={() => {
                                if (isCollapsed) expand(); else collapse();
                            }}
                            labelCollapsed="展开左侧栏"
                            labelExpanded="收起左侧栏"
                        />
                    </div>
                    <div
                        className={`h-full transition-opacity duration-200 ${
                            isCollapsed
                                ? 'opacity-0 pointer-events-none'
                                : 'opacity-100 border-r border-gray-200 dark:border-gray-700'
                        }`}
                    >
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
                <div
                    className="flex-1 h-full overflow-y-auto relative"
                    ref={rightColRef}
                >
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
                                        <TaskContext
                                            tasks={tasks}
                                            onTaskClick={(t, index) => handleSplitTask(t, {taskIndex: index})}
                                            onCardSelect={(taskId) => setSelectedTaskId(taskId)}
                                            onToggleCollapse={handleToggleCollapse}
                                            onReset={() => {
                                                setTasks([]);
                                                updateActiveHistoryTasks([]);
                                                setFocusTaskId(null);
                                                setSelectedTaskId(null);
                                            }}
                                            groupId={activeHistoryId || undefined}
                                            groupTitle={(histories.find(h => h.id === activeHistoryId)?.title) || undefined}
                                            focusTaskId={focusTaskId}
                                            selectedTaskId={selectedTaskId}
                                            onDeleteTask={handleDeleteTaskFromTree}
                                        />
                                    </div>

                                    {/* 右侧：任务树形结构（可收起），按钮相对该面板定位；折叠时保留窄容器以便按钮可点击 */}
                                    <div
                                        className={`relative transition-all duration-300 flex-shrink-0 ${
                                            isRightCollapsed ? 'w-6' : 'w-[260px]'
                                        }`}
                                    >
                                        <div
                                            className={`h-full transition-opacity duration-200 ${
                                                isRightCollapsed
                                                    ? 'opacity-0 pointer-events-none'
                                                    : 'opacity-100 border-l border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 rounded-l-none rounded-md shadow-sm overflow-hidden'
                                            }`}
                                        >
                                            <TreePanel
                                                tasks={tasks}
                                                focusTaskId={focusTaskId}
                                                onFocusChange={handleFocusChange}
                                                onAddChild={handleAddChild}
                                                onEditTask={handleEditTaskFromTree}
                                                onDeleteTask={handleDeleteTaskFromTree}
                                            />
                                        </div>

                                        {/* 右侧栏收缩/展开按钮：贴着面板左边缘 */}
                                        <div className="absolute top-1/2 -left-3 -translate-y-1/2 z-30">
                                            <ToggleBtn
                                                side="right"
                                                collapsed={isRightCollapsed}
                                                onToggle={() => setIsRightCollapsed(prev => !prev)}
                                                labelCollapsed="展开任务结构"
                                                labelExpanded="收起任务结构"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEmpty && (
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

                        {/* loading 浮层：覆盖右侧主内容（画布 + 树），不遮左侧历史栏 */}
                        {loading && (
                            <Overlay
                                onCancel={cancelProcessing}
                                onRetry={canSend ? handleSend : undefined}
                                onImprovePrompt={isEmpty ? undefined : () => {
                                    const summary = tasks.map(t => `${t.startTime}-${t.endTime} ${t.task}`).join('\n');
                                    setChatInput(prev => (prev ? `${prev}\n\n优化方向：\n${summary}` : summary));
                                }}
                                message={chatInput || '正在根据你的输入进行任务拆分'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLanding;
