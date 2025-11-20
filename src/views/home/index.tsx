"use client";

import React, {useMemo, useRef, useState} from "react";
import ChatPanel from "@/src/views/home/components/ChatPanel";
import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
import TaskContext from "@/src/views/home/components/TaskContext";
import EmptyState from "@/src/views/home/components/EmptyState";
import ErrorAlert from "@/src/views/home/components/ErrorAlert";
import ProcessingOverlay from "@/src/views/home/components/ProcessingOverlay";
import HistorySidebar, {TaskHistory} from "@/src/views/home/components/HistorySidebar";
import {useSidebar} from "@/src/contexts/SidebarContext";

export default function HomeLanding(): React.ReactElement {
    const {isCollapsed, collapse, expand, toggleSidebar} = useSidebar();
    const [startISO, setStartISO] = useState<string>("");
    const [endISO, setEndISO] = useState<string>("");
    const [durationMin, setDurationMin] = useState<string>("");
    const [chatInput, setChatInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [jsonErrors, setJsonErrors] = useState<string[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    // 一维任务数组：包含首次生成的任务与后续插入的子任务
    const [tasks, setTasks] = useState<UiTask[]>([]);
    // 本地历史：持久化每次任务拆解结果
    const [histories, setHistories] = useState<TaskHistory[]>([]);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const HISTORY_KEY = "aitodo.taskHistory.v1";
    const [historySearch, setHistorySearch] = useState<string>("");
    // 右侧内容区域引用（用于展开左侧栏时点击右侧检测）
    const rightColRef = useRef<HTMLDivElement | null>(null);

    const diffMinutes = useMemo(() => {
        if (!startISO || !endISO) return undefined;
        const s = new Date(startISO).getTime();
        const e = new Date(endISO).getTime();
        const diff = Math.round((e - s) / 60000);
        return Number.isFinite(diff) ? diff : undefined;
    }, [startISO, endISO]);

    const validation = useMemo(() => {
        const errors: string[] = [];
        if (startISO && endISO) {
            if (new Date(startISO) >= new Date(endISO)) {
                errors.push("结束时间必须大于开始时间");
            }
        }
        const dur = durationMin ? Number(durationMin) : undefined;
        if (durationMin !== "" && (!Number.isFinite(dur!) || dur! <= 0)) {
            errors.push("目标总时长需为大于0的数字（分钟）");
        }
        if (diffMinutes !== undefined && durationMin !== "") {
            const durNum = Number(durationMin);
            if (Number.isFinite(durNum) && durNum > diffMinutes) {
                errors.push(`目标总时长(${durNum}m)不能大于时间窗(${diffMinutes}m)`);
            }
        }
        return errors;
    }, [startISO, endISO, durationMin, diffMinutes]);

    const canSend = useMemo(() => {
        return !loading && chatInput.trim().length > 0 && validation.length === 0 && !!startISO && !!endISO;
    }, [loading, chatInput, validation.length, startISO, endISO]);

    // 移除未使用的 API_URL 变量

    // ---------- 新增：将自然语言请求转化为 Task[] 的请求与解析 ----------
    // 移除未使用的日期格式化辅助函数

    const buildTasksPrompt = (content: string) => {
        return `你是专业的时间规划助手。请根据用户的任务描述与时间窗，把任务拆解为在时间窗内可执行的步骤。只输出 JSON 数组，不要任何解释或 markdown。

用户内容：${content}

输出数组元素格式：
{
  "id": 数字,
  "taskTime": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "task": "步骤标题",
  "remark": "详细说明（可选）",
  "state": "pending"
}

规划约束：
1) 所有步骤必须位于指定时间窗内，时间按顺序排列；
2) 每步时长建议 15–120 分钟，时间对齐到 5 分钟粒度（如 15:10、15:15）；
3) 步骤之间可留 5–10 分钟间隔用于过渡；
4) 不要重叠时间段，确保 endTime > startTime；
5) 任务数量建议 3–7 个；若内容较短，至少生成 1–3 个；
6) 不要输出除上述字段外的其他字段（例如 prev 或 next），这两个字段由前端自动计算。

示例：
[{"id":1,"taskTime":"2025-11-19","startTime":"15:10","endTime":"15:20","task":"需求分析","remark":"明确网站目标","state":"pending"}]`;
    };

    const buildSplitPrompt = (task: UiTask, window: { startISO: string; endISO: string }) => {
        const taskDuration = task.startTime && task.endTime ? `${task.startTime}-${task.endTime}` : '未指定';
        return `你是任务拆解助手。请把选中的父 TODO 进一步细化为更小、可执行的子步骤。只输出 JSON 数组，不要任何解释或 markdown。

父 TODO：
- 任务名称：${task.task ?? '未命名任务'}
- 日期：${task.taskTime ?? '未指定'}
- 时间段：${taskDuration}
- 说明：${task.remark || '无'}

输出数组元素格式：
{
  "id": 数字,
  "taskTime": "${task.taskTime ?? ''}",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "task": "子步骤标题",
  "remark": "详细说明（结合父任务上下文，可选）",
  "state": "pending"
}

约束：
1) 所有子步骤必须位于父任务时间段内，时间按顺序排列；
2) 每步建议 10–60 分钟，时间对齐到 5 分钟粒度；
3) 子步骤之间可留 5–10 分钟间隔；
4) 不要重叠时间段，确保 endTime > startTime；
5) 直接输出 JSON 数组，不要任何其他文字；
6) 不要输出除上述字段外的其他字段（例如 prev 或 next），这两个字段由前端自动计算。

示例：
[{"id":101,"taskTime":"${task.taskTime ?? '2025-11-19'}","startTime":"15:20","endTime":"15:30","task":"确认技术栈","remark":"评估框架与工具","state":"pending"}]`;
    };

    const parseTasksJson = (text: string): UiTask[] => {
        let jsonText = text;
        // 提取可能的 JSON 数组
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
            jsonText = match[0];
        }

        try {
            const arr = JSON.parse(jsonText);
            if (!Array.isArray(arr)) return [];

            // 映射字段：title -> task，并添加 state 如果缺失；若无 id 则使用索引生成
            const mapped: UiTask[] = arr.map((item: any, i: number) => ({
                id: item.id ?? i + 1,
                taskTime: item.taskTime,
                startTime: item.startTime,
                endTime: item.endTime,
                task: item.title || item.task || 'Untitled',
                remark: item.remark || '',
                state: item.state || 'pending'
            }));

            // 根据顺序填充 prev/next（使用相邻任务的 id）
            for (let i = 0; i < mapped.length; i++) {
                const prev = i > 0 ? mapped[i - 1]?.id : undefined;
                const next = i < mapped.length - 1 ? mapped[i + 1]?.id : undefined;
                mapped[i].prev = prev as number | undefined;
                mapped[i].next = next as number | undefined;
            }

            return mapped;
        } catch (err) {
            console.error('Parse error:', err);
            return [];
        }
    };

    const requestTasks = async (userText: string, windowISO: {
        startISO: string;
        endISO: string
    }, signal?: AbortSignal): Promise<UiTask[]> => {
        // 构建用户消息为 user 与 system prompt
        const prompt = `${buildTasksPrompt(userText)}\n用户内容：${userText}\n起止时间窗(ISO)：${windowISO.startISO} ~ ${windowISO.endISO}`;

        // 使用同源相对路径，配合 next.config.js 的 rewrites 进行代理，避免 CORS
        const apiUrl = "/api/v1/chat";
        const body = {
            model: "deepseek-chat",
            messages: [{role: "user", content: prompt}],
            temperature: 0.7,
            max_tokens: 256
        };

        try {
            const resp = await fetch(apiUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
                signal
            });

            if (!resp.ok) {
                throw new Error(`API request failed with status ${resp.status}`);
            }

            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content || '';
            return parseTasksJson(text);
        } catch (err: any) {
            console.error('API call error:', err);
            // 若为主动取消请求，直接返回空数组，避免错误提示
            if (err?.name === 'AbortError') return [];
            throw err;
        }
    };

    // 统一计算一维任务列表的 prev/next 链接
    const applyPrevNext = (arr: UiTask[]): UiTask[] => arr.map((t, i) => ({
        ...t,
        prev: i > 0 ? arr[i - 1]?.id : undefined,
        next: i < arr.length - 1 ? arr[i + 1]?.id : undefined,
    }));

    // ---------- 历史持久化 ----------
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            if (raw) {
                const parsed: TaskHistory[] = JSON.parse(raw);
                setHistories(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
        }
    }, []);

    const persistHistories = (next: TaskHistory[]) => {
        setHistories(next);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
        }
    };

    const addHistory = (title: string, generated: UiTask[]) => {
        const entry: TaskHistory = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title,
            createdAt: new Date().toISOString(),
            startISO,
            endISO,
            tasks: applyPrevNext(generated)
        };
        const next = [entry, ...histories];
        persistHistories(next);
        setActiveHistoryId(entry.id);
    };

    const updateActiveHistoryTasks = (updated: UiTask[]) => {
        if (!activeHistoryId) return;
        const next = histories.map(h => h.id === activeHistoryId ? {...h, tasks: applyPrevNext(updated)} : h);
        persistHistories(next);
    };

    const clearAllHistories = () => {
        setActiveHistoryId(null);
        persistHistories([]);
        try {
            localStorage.removeItem(HISTORY_KEY);
        } catch {
        }
    };

    const restoreFromHistory = (h: TaskHistory) => {
        setTasks(applyPrevNext(h.tasks || []));
        if (h.startISO) setStartISO(h.startISO);
        if (h.endISO) setEndISO(h.endISO);
        setActiveHistoryId(h.id);
    };

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        setJsonErrors([]);
        const userText = chatInput.trim();
        try {
            abortRef.current = new AbortController();
            const newTasks = await requestTasks(userText, {startISO, endISO}, abortRef.current.signal);
            setTasks(applyPrevNext(newTasks));
            // 保存历史记录
            addHistory(userText, newTasks);
            setChatInput("");
        } catch (err: any) {
            setJsonErrors([err?.message || '请求失败']);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };


    const onKeyDownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
            e.preventDefault();
            void handleSend();
        }
    };


    // 点击卡片触发“二次拆解”，将返回的子任务紧贴父任务所在流程后展示
    const handleSplitTask = async (t: UiTask, ctx?: { taskIndex: number }) => {
        if (!startISO || !endISO) return;
        setLoading(true);
        try {
            const splitPrompt = buildSplitPrompt(t, {startISO, endISO});
            abortRef.current = new AbortController();
            const children = await requestTasks(splitPrompt, {startISO, endISO}, abortRef.current.signal);
            setTasks((prev: UiTask[]) => {
                const next = [...prev];
                const pos = ctx && typeof ctx.taskIndex === 'number' ? ctx.taskIndex + 1 : next.length;
                next.splice(pos, 0, ...children);
                const applied = applyPrevNext(next);
                // 同步更新当前历史的任务快照
                setTimeout(() => updateActiveHistoryTasks(applied), 0);
                return applied;
            });
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
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

    const isEmpty = tasks.length === 0 && !loading;
    return (
        <div className={"relative min-h-screen pb-0 pt-[60px] overflow-hidden"}>
            {/* 背景（极简） */}
            <div className="absolute inset-0 bg-white dark:bg-[#0b0f19]"/>

            {/* 主内容容器：左右并排两栏（固定视口高度，避免页面级滚动） */}
            <div className="relative z-10 w-full mx-auto flex gap-4 h-[calc(100dvh-60px)] overflow-hidden">
                {/* 左侧历史侧栏：常驻显示 */}
                <div
                    className={`shrink-0 h-[calc(100dvh-60px)] transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[280px] opacity-100'}`}
                    aria-hidden={isCollapsed}>
                    <div
                        className={`h-full p-3 bg-white/90 dark:bg-gray-800/60 flex flex-col ${isCollapsed ? 'border-transparent' : 'border-r border-gray-200 dark:border-gray-700'}`}>
                        {/* 固定头部：新对话 / 清空 / 搜索 */}
                        <div
                            className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/60 -mx-3 px-3 pt-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTasks([]);
                                        setActiveHistoryId(null);
                                        setChatInput("");
                                    }}
                                    className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                >新对话
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllHistories}
                                    className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >清空
                                </button>
                            </div>
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="搜索会话/任务"
                                className="w-full border border-gray-300 dark:border-gray-600 bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                            />
                        </div>

                        {/* 仅鼠标悬停时允许滚动的内容区 */}
                        <div className="flex-1 overflow-y-hidden hover:overflow-y-auto overscroll-contain pt-3">
                            <HistorySidebar
                                histories={histories.filter(h => !historySearch.trim() || (h.title || "").toLowerCase().includes(historySearch.trim().toLowerCase()))}
                                activeId={activeHistoryId}
                                onSelect={restoreFromHistory}
                                onClearAll={undefined}
                            />
                        </div>
                    </div>
                </div>

                {/* 右侧主内容（独立滚动容器） */}
                <div className="flex-1 h-full overflow-y-auto" ref={rightColRef} onClick={() => {
                    if (isCollapsed) expand();
                }}>
                    {/* 右栏左上角：收起/展开按钮 */}
                    <div className="sticky top-0 z-20">
                        <div className="px-2 pt-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isCollapsed) {
                                        expand();
                                    } else {
                                        collapse();
                                    }
                                }}
                                title={isCollapsed ? '展开左侧栏' : '收起左侧栏'}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {isCollapsed ? '⟩ 展开' : '⟨ 收起'}
                            </button>
                        </div>
                    </div>
                    {/* 内容 + 底部输入栏（非固定） */}
                    <div className="flex flex-col min-h-full">
                        <div className={`${isEmpty ? 'flex-1 grid place-items-center' : 'flex-1 flex flex-col'}`}>
                            {tasks.length === 0 && !loading && (
                                <EmptyState onPickTemplate={(t) => setChatInput(t)}/>
                            )}

                            {/* 错误提示 */}
                            {jsonErrors.length > 0 && (
                                <ErrorAlert errors={jsonErrors} onDismiss={() => setJsonErrors([])}/>
                            )}
                            {/* 任务上下文：填充主页并渲染任务流程块 */}
                            <TaskContext
                                tasks={tasks}
                                onTaskClick={(t, index) => handleSplitTask(t, {taskIndex: index})}
                                onReset={() => {
                                    setTasks([]);
                                    updateActiveHistoryTasks([]);
                                }}
                            />
                        </div>

                        {/* 底部输入栏（置于右栏内部）：仅在空状态或加载中显示 */}
                        {(isEmpty || loading) && (
                            <div className="bg-transparent pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="w-full max-w-4xl mx-auto px-4">
                                    <ChatPanel
                                        startISO={startISO}
                                        setStartISO={setStartISO}
                                        endISO={endISO}
                                        setEndISO={setEndISO}
                                        durationMin={durationMin}
                                        setDurationMin={setDurationMin}
                                        chatInput={chatInput}
                                        setChatInput={setChatInput}
                                        loading={loading}
                                        lastMessage={""}
                                        diffMinutes={diffMinutes}
                                        validation={validation}
                                        canSend={canSend}
                                        handleSend={handleSend}
                                        onKeyDownTextArea={onKeyDownTextArea}
                                        showTemplates={false}
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

            {/* 底部输入栏已并入右栏内部，非固定 */}
        </div>
    )
}
