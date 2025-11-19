"use client";

import React, {useMemo, useState} from "react";
import ChatPanel from "@/src/views/home/components/ChatPanel";
import {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
import TaskContext from "@/src/views/home/components/TaskContext";
import EmptyState from "@/src/views/home/components/EmptyState";
import ErrorAlert from "@/src/views/home/components/ErrorAlert";

export default function HomeLanding(): React.ReactElement {
    const [startISO, setStartISO] = useState<string>("");
    const [endISO, setEndISO] = useState<string>("");
    const [durationMin, setDurationMin] = useState<string>("");
    const [chatInput, setChatInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [jsonErrors, setJsonErrors] = useState<string[]>([]);
    // 一维任务数组：包含首次生成的任务与后续插入的子任务
    const [tasks, setTasks] = useState<UiTask[]>([]);

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
    }): Promise<UiTask[]> => {
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
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                throw new Error(`API request failed with status ${resp.status}`);
            }

            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content || '';
            return parseTasksJson(text);
        } catch (err) {
            console.error('API call error:', err);
            throw err;
        }
    };

    // 统一计算一维任务列表的 prev/next 链接
    const applyPrevNext = (arr: UiTask[]): UiTask[] => arr.map((t, i) => ({
        ...t,
        prev: i > 0 ? arr[i - 1]?.id : undefined,
        next: i < arr.length - 1 ? arr[i + 1]?.id : undefined,
    }));

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        setJsonErrors([]);
        const userText = chatInput.trim();
        try {
            const newTasks = await requestTasks(userText, {startISO, endISO});
            setTasks(applyPrevNext(newTasks));
            setChatInput("");
        } catch (err: any) {
            setJsonErrors([err?.message || '请求失败']);
        } finally {
            setLoading(false);
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
            const children = await requestTasks(splitPrompt, {startISO, endISO});
            setTasks((prev: UiTask[]) => {
                const next = [...prev];
                const pos = ctx && typeof ctx.taskIndex === 'number' ? ctx.taskIndex + 1 : next.length;
                next.splice(pos, 0, ...children);
                return applyPrevNext(next);
            });
        } finally {
            setLoading(false);
        }
    };

    const isEmpty = tasks.length === 0 && !loading;
    return (
        <div
            className={"relative min-h-screen flex flex-col items-center px-4 pb-0 overflow-hidden"}>
            {/* 背景（极简） */}
            <div className="absolute inset-0 bg-white dark:bg-[#0b0f19]"/>

            {/* 主内容（适当加宽，仅内容区内居中） */}
            <div className="relative z-10 w-full mx-auto">
                {/* 只在内容区内居中：使用内容区最小高度为 (视口高度 - 底栏/安全边距) */}
                <div className={`${isEmpty ? 'grid place-items-center' : ''}`}
                     style={{minHeight: 'calc(100vh - 260px)'}}>
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
                    />
                </div>
            </div>

            {/* 底部输入栏（仅在空内容时显示，避免与任务面板并存） */}
            {isEmpty && (
                <div
                    className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20 bg-transparent pt-3 pb-3 w-full max-w-4xl px-4 md:left-[calc(50%+40px)] md:translate-x-[-50%]">
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
            )}
        </div>
    )
}
