"use client";

import React, {useEffect, useMemo, useState} from "react";
import AddTodo from "@/src/views/home/components/AddTodo";
import TodoPanel from "@/src/views/home/components/TodoPanel";
import ChatPanel from "@/src/views/home/components/ChatPanel";
import storage from "@/src/shared/utils/storage";

export default function HomeLanding(): React.ReactElement {
    const [startISO, setStartISO] = useState<string>("");
    const [endISO, setEndISO] = useState<string>("");
    const [durationMin, setDurationMin] = useState<string>("");
    const [chatInput, setChatInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const [jsonInput, setJsonInput] = useState<string>("");
    const [jsonErrors, setJsonErrors] = useState<string[]>([]);
    const [parsedPlan, setParsedPlan] = useState<Plan | null>(null);
    const [useMockData, setUseMockData] = useState<boolean>(false);

    // 从 localStorage 加载数据
    useEffect(() => {
        const stored = storage.get<Plan>('taskPlan');
        if (stored) {
            setParsedPlan(stored);
        }
    }, []);

    // 保存到 localStorage
    useEffect(() => {
        if (parsedPlan) {
            storage.set('taskPlan', parsedPlan);
        }
    }, [parsedPlan]);

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

    const API_URL = process.env.NEXT_PUBLIC_PLANNER_API as string | undefined;

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        const payload = {
            window: {startISO, endISO},
            targetMinutes: durationMin ? Number(durationMin) : undefined,
            prompt: chatInput.trim(),
        };
        setLastMessage(JSON.stringify(payload, null, 2));
        setJsonErrors([]);
        try {
            if (!API_URL) {
                const mock = createMockPlan();
                setParsedPlan(mock);
                setJsonInput(JSON.stringify(mock, null, 2));
                return;
            }
            const resp = await fetch(API_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });
            const text = await resp.text();
            let data: unknown;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error("响应不是合法 JSON");
            }
            const res = validatePlan(data);
            if (res.ok) {
                setParsedPlan(res.data);
                setJsonInput(JSON.stringify(res.data, null, 2));
            } else {
                setJsonErrors(res.errors);
            }
        } catch (err: any) {
            setJsonErrors([err?.message || "请求失败"]);
        } finally {
            setLoading(false);
        }
    };

    const createEmptyPlanFromForm = (): Plan => {
        const validStart = startISO && !Number.isNaN(new Date(startISO).getTime());
        const validEnd = endISO && !Number.isNaN(new Date(endISO).getTime());
        let s: Date;
        let e: Date;
        if (validStart && validEnd && new Date(startISO) < new Date(endISO)) {
            s = new Date(startISO);
            e = new Date(endISO);
        } else {
            const now = new Date();
            s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
            e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0);
        }
        return {
            window: {startISO: toLocalISO(s), endISO: toLocalISO(e)},
            tasks: [],
            schedule: [],
        };
    };

    const onKeyDownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
            e.preventDefault();
            handleSend();
        }
    };

    type Priority = "low" | "medium" | "high";
    type Energy = "low" | "medium" | "high";

    type Window = {
        startISO: string;
        endISO: string;
    };

    type FixedSlot = {
        startISO: string;
        endISO: string;
    };

    type Task = {
        id: string;
        title: string;
        durationMin: number;
        priority: Priority;
        deadlineISO?: string;
        fixedSlot?: FixedSlot;
        dependsOn?: string[];
        energy?: Energy;
        pomodoro?: number;
    };

    type Schedule = {
        taskId: string;
        startISO: string;
        endISO: string;
        note?: string;
    };

    type Plan = {
        window: Window;
        tasks: Task[];
        schedule: Schedule[];
    };

    const isISODate = (s: unknown) => typeof s === "string" && !Number.isNaN(new Date(s).getTime());
    const isNonEmptyString = (s: unknown) => typeof s === "string" && s.trim().length > 0;
    const isPositiveNumber = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n > 0;
    const isPriority = (p: unknown): p is Priority => p === "low" || p === "medium" || p === "high";
    const isEnergy = (e: unknown): e is Energy => e === "low" || e === "medium" || e === "high";

    const validatePlan = (raw: unknown): { ok: true; data: Plan } | { ok: false; errors: string[] } => {
        const errs: string[] = [];
        if (typeof raw !== "object" || raw === null) return {ok: false, errors: ["根对象应为 JSON 对象"]};
        const obj = raw as Record<string, any>;
        const w = obj.window;
        if (!w || typeof w !== "object") errs.push("缺少 window 对象");
        const tasks = Array.isArray(obj.tasks) ? obj.tasks : (errs.push("tasks 应为数组"), [] as any[]);
        const schedule = Array.isArray(obj.schedule) ? obj.schedule : (errs.push("schedule 应为数组"), [] as any[]);
        if (w) {
            if (!isISODate(w.startISO)) errs.push("window.startISO 非法 ISO 日期");
            if (!isISODate(w.endISO)) errs.push("window.endISO 非法 ISO 日期");
            if (isISODate(w.startISO) && isISODate(w.endISO)) {
                if (new Date(w.startISO) >= new Date(w.endISO)) errs.push("window 时间窗必须 start < end");
            }
        }
        const taskIds = new Set<string>();
        tasks.forEach((t, idx) => {
            if (typeof t !== "object" || t === null) {
                errs.push(`tasks[${idx}] 非对象`);
                return;
            }
            if (!isNonEmptyString(t.id)) errs.push(`tasks[${idx}].id 缺失或空`);
            if (isNonEmptyString(t.id)) taskIds.add(t.id);
            if (!isNonEmptyString(t.title)) errs.push(`tasks[${idx}].title 缺失或空`);
            if (!isPositiveNumber(t.durationMin)) errs.push(`tasks[${idx}].durationMin 必须为正数`);
            if (!isPriority(t.priority)) errs.push(`tasks[${idx}].priority 非法`);
            if (t.deadlineISO !== undefined && !isISODate(t.deadlineISO)) errs.push(`tasks[${idx}].deadlineISO 非法`);
            if (t.fixedSlot !== undefined) {
                const fs = t.fixedSlot;
                if (!fs || typeof fs !== "object") errs.push(`tasks[${idx}].fixedSlot 非对象`);
                else {
                    if (!isISODate(fs.startISO)) errs.push(`tasks[${idx}].fixedSlot.startISO 非法`);
                    if (!isISODate(fs.endISO)) errs.push(`tasks[${idx}].fixedSlot.endISO 非法`);
                    if (isISODate(fs.startISO) && isISODate(fs.endISO)) {
                        if (new Date(fs.startISO) >= new Date(fs.endISO)) errs.push(`tasks[${idx}].fixedSlot 必须 start < end`);
                    }
                }
            }
            if (t.dependsOn !== undefined) {
                if (!Array.isArray(t.dependsOn) || !t.dependsOn.every(isNonEmptyString)) errs.push(`tasks[${idx}].dependsOn 必须为字符串数组`);
            }
            if (t.energy !== undefined && !isEnergy(t.energy)) errs.push(`tasks[${idx}].energy 非法`);
            if (t.pomodoro !== undefined && !(typeof t.pomodoro === "number" && Number.isInteger(t.pomodoro) && t.pomodoro >= 0)) errs.push(`tasks[${idx}].pomodoro 非法`);
        });
        schedule.forEach((s, idx) => {
            if (typeof s !== "object" || s === null) {
                errs.push(`schedule[${idx}] 非对象`);
                return;
            }
            if (!isNonEmptyString(s.taskId)) errs.push(`schedule[${idx}].taskId 缺失或空`);
            if (!isISODate(s.startISO)) errs.push(`schedule[${idx}].startISO 非法`);
            if (!isISODate(s.endISO)) errs.push(`schedule[${idx}].endISO 非法`);
            if (isISODate(s.startISO) && isISODate(s.endISO)) {
                if (new Date(s.startISO) >= new Date(s.endISO)) errs.push(`schedule[${idx}] 必须 start < end`);
            }
        });
        schedule.forEach((s, idx) => {
            if (isNonEmptyString(s.taskId) && !taskIds.has(s.taskId)) errs.push(`schedule[${idx}].taskId 未在 tasks 中定义`);
        });
        if (errs.length > 0) return {ok: false, errors: errs};
        return {ok: true, data: obj as Plan};
    };

    const handleValidateJson = () => {
        setJsonErrors([]);
        setParsedPlan(null);
        let raw: unknown;
        try {
            raw = JSON.parse(jsonInput);
        } catch (e) {
            setJsonErrors(["JSON 解析失败"]);
            return;
        }
        const res = validatePlan(raw);
        if (res.ok) {
            setParsedPlan(res.data);
        } else {
            setJsonErrors(res.errors);
        }
    };

    const toLocalISO = (d: Date) => {
        const tzOffsetMin = d.getTimezoneOffset();
        const sign = tzOffsetMin > 0 ? "-" : "+";
        const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
        const offH = pad(Math.floor(Math.abs(tzOffsetMin) / 60));
        const offM = pad(Math.abs(tzOffsetMin) % 60);
        const y = d.getFullYear();
        const mo = pad(d.getMonth() + 1);
        const da = pad(d.getDate());
        const h = pad(d.getHours());
        const mi = pad(d.getMinutes());
        const s = pad(d.getSeconds());
        return `${y}-${mo}-${da}T${h}:${mi}:${s}${sign}${offH}:${offM}`;
    };

    const createMockPlan = (): Plan => {
        const now = new Date();
        const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0);
        const meetingStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0, 0);
        const meetingEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0, 0);
        const learnStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0, 0);
        const learnEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0);
        const reportStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
        const reportEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 45, 0, 0);
        return {
            window: {startISO: toLocalISO(base), endISO: toLocalISO(end)},
            tasks: [
                {id: "weekly-report", title: "写周报", durationMin: 45, priority: "high", deadlineISO: toLocalISO(end)},
                {id: "react-perf", title: "学习 React 性能优化", durationMin: 120, priority: "medium"},
                {
                    id: "meeting",
                    title: "项目会议",
                    durationMin: 60,
                    priority: "high",
                    fixedSlot: {startISO: toLocalISO(meetingStart), endISO: toLocalISO(meetingEnd)}
                },
            ],
            schedule: [
                {taskId: "weekly-report", startISO: toLocalISO(reportStart), endISO: toLocalISO(reportEnd)},
                {
                    taskId: "meeting",
                    startISO: toLocalISO(meetingStart),
                    endISO: toLocalISO(meetingEnd),
                    note: "固定日程"
                },
                {taskId: "react-perf", startISO: toLocalISO(learnStart), endISO: toLocalISO(learnEnd), note: "2个番茄"},
            ],
        };
    };

    const handleFillMock = () => {
        const mock = createMockPlan();
        setJsonInput(JSON.stringify(mock, null, 2));
        setJsonErrors([]);
        setParsedPlan(mock);
    };

    const startOfDay = (d: Date) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };
    const endOfDay = (d: Date) => {
        const x = new Date(d);
        x.setHours(23, 59, 59, 999);
        return x;
    };
    const addDays = (d: Date, days: number) => {
        const x = new Date(d);
        x.setDate(x.getDate() + days);
        return x;
    };
    const fmtYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekdayCN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    type DayFragment = {
        taskId: string;
        start: Date;
        end: Date;
        minutesStart: number;
        minutesEnd: number;
    };

    const buildDays = (plan: Plan) => {
        const ws = new Date(plan.window.startISO);
        const we = new Date(plan.window.endISO);
        const startDay = startOfDay(ws);
        const endDay = startOfDay(we);
        const days: Date[] = [];
        for (let d = new Date(startDay); d.getTime() <= endDay.getTime(); d = addDays(d, 1)) {
            days.push(new Date(d));
        }
        return days;
    };

    const splitToDayFragments = (plan: Plan) => {
        if (!plan) return {} as Record<string, DayFragment[]>;
        const days = buildDays(plan);
        const map: Record<string, DayFragment[]> = {};
        days.forEach((d) => (map[fmtYMD(d)] = []));
        const we = new Date(plan.window.endISO);
        plan.schedule.forEach((s) => {
            const st = new Date(s.startISO);
            const en = new Date(s.endISO);
            let cur = startOfDay(st);
            while (cur.getTime() <= startOfDay(en).getTime()) {
                const dayKey = fmtYMD(cur);
                const dayStart = startOfDay(cur);
                const dayEnd = endOfDay(cur);
                const segStart = new Date(Math.max(st.getTime(), dayStart.getTime()));
                const segEnd = new Date(Math.min(en.getTime(), dayEnd.getTime(), we.getTime()));
                if (segStart < segEnd && map[dayKey] !== undefined) {
                    const minutesStart = Math.max(0, Math.floor((segStart.getTime() - dayStart.getTime()) / 60000));
                    const minutesEnd = Math.min(24 * 60, Math.ceil((segEnd.getTime() - dayStart.getTime()) / 60000));
                    map[dayKey].push({taskId: s.taskId, start: segStart, end: segEnd, minutesStart, minutesEnd});
                }
                cur = addDays(cur, 1);
            }
        });
        return map;
    };

    const computeLanes = (fragments: DayFragment[]) => {
        const items = [...fragments].sort((a, b) => a.minutesStart - b.minutesStart || a.minutesEnd - b.minutesEnd);
        const lanes: DayFragment[][] = [];
        const laneIndex: number[] = [];
        items.forEach((it, idx) => {
            let placed = false;
            for (let l = 0; l < lanes.length; l++) {
                const last = lanes[l][lanes[l].length - 1];
                if (it.minutesStart >= last.minutesEnd) {
                    lanes[l].push(it);
                    laneIndex[idx] = l;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                lanes.push([it]);
                laneIndex[idx] = lanes.length - 1;
            }
        });
        const total = lanes.length || 1;
        const result = items.map((it, i) => ({
            fragment: it,
            lane: laneIndex[i] ?? 0,
            lanes: total,
        }));
        return result;
    };

    const findTask = (plan: Plan, id: string) => plan.tasks.find((t) => t.id === id);
    const priorityColor = (p?: string) =>
        p === "high" ? "bg-red-500" : p === "medium" ? "bg-amber-500" : p === "low" ? "bg-emerald-500" : "bg-slate-500";

    // 更新任务内容的回调函数
    const updateTaskInPlan = (day: Date, hour: number, content: string) => {
        if (!parsedPlan) return;

        const dayStart = new Date(day);
        dayStart.setHours(hour, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(hour + 1, 0, 0, 0);

        const toISO = (d: Date) => d.toISOString();
        const taskId = `task-${day.getTime()}-${hour}`;

        // 检查是否已存在该时间段的任务
        const existingScheduleIndex = parsedPlan.schedule.findIndex(s => {
            const sStart = new Date(s.startISO);
            const sEnd = new Date(s.endISO);
            return sStart.getTime() === dayStart.getTime() && sEnd.getTime() === dayEnd.getTime();
        });

        if (content.trim() === "") {
            // 删除任务
            if (existingScheduleIndex >= 0) {
                const updatedSchedule = parsedPlan.schedule.filter((_, i) => i !== existingScheduleIndex);
                const removedTaskId = parsedPlan.schedule[existingScheduleIndex].taskId;
                const updatedTasks = parsedPlan.tasks.filter(t => t.id !== removedTaskId);
                setParsedPlan({
                    ...parsedPlan,
                    tasks: updatedTasks,
                    schedule: updatedSchedule
                });
            }
        } else {
            // 添加或更新任务
            if (existingScheduleIndex >= 0) {
                // 更新现有任务
                const existingTaskId = parsedPlan.schedule[existingScheduleIndex].taskId;
                const updatedTasks = parsedPlan.tasks.map(t =>
                    t.id === existingTaskId ? {...t, title: content} : t
                );
                setParsedPlan({
                    ...parsedPlan,
                    tasks: updatedTasks
                });
            } else {
                // 添加新任务
                const newTask: Task = {
                    id: taskId,
                    title: content,
                    durationMin: 60,
                    priority: "medium" as Priority
                };
                const newSchedule = {
                    taskId,
                    startISO: toISO(dayStart),
                    endISO: toISO(dayEnd)
                };
                setParsedPlan({
                    ...parsedPlan,
                    tasks: [...parsedPlan.tasks, newTask],
                    schedule: [...parsedPlan.schedule, newSchedule]
                });
            }
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
            {/* 背景渐变效果 */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#1a1d29] dark:to-blue-950 opacity-50"/>

            {/* 动态背景光晕 */}
            <div
                className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"/>
            <div
                className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"
                style={{animationDelay: '1s'}}/>

            {/* 主内容 */}
            <div className="relative z-10 w-full max-w-5xl">
                {/* 标题区域 */}
                <div className="text-center mb-16 space-y-6">
                    <div className="inline-block">
                        <span
                            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] tracking-tight">
                            AI TODO for Me
                        </span>
                    </div>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
                        智能任务规划，让 AI 帮你高效管理时间
                    </p>
                </div>

                {/* ChatPanel 卡片 */}
                <div className="transform hover:scale-[1.01] transition-transform duration-300">
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
                        lastMessage={lastMessage}
                        diffMinutes={diffMinutes}
                        validation={validation}
                        canSend={canSend}
                        handleSend={handleSend}
                        onKeyDownTextArea={onKeyDownTextArea}
                    />
                </div>

                {/* 底部提示 */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        ✨ 输入你的任务需求，让 AI 为你智能规划
                    </p>
                </div>
            </div>
        </div>
    )
}
