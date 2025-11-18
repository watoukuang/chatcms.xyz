"use client";

import React, {useEffect, useMemo, useState} from "react";
import AddTodo from "@/src/views/home/components/AddTodo";
import TodoPanel from "@/src/views/home/components/TodoPanel";
import ChatPanel from "@/src/views/home/components/ChatPanel";
import TaskFlow, {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
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
    // 聊天消息流（仅用于 Task[] 卡片对话展示）
    const [messages, setMessages] = useState<Array<{
        id: string;
        role: 'user' | 'assistant';
        text?: string;
        tasks?: UiTask[];
    }>>([]);
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

    // ---------- 新增：将自然语言请求转化为 Task[] 的请求与解析 ----------
    const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const toHM = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const buildTasksPrompt = (content: string) => {
        return `你是专业的时间规划助手。请根据用户的任务描述和时间窗，将任务拆解为可执行的步骤。

## 输出格式要求
严格输出JSON数组，每个元素包含以下字段：
{
  "id": 数字类型（使用时间戳或递增ID），
  "taskTime": "YYYY-MM-DD" 格式的日期字符串，
  "startTime": "HH:mm" 格式的开始时间，
  "endTime": "HH:mm" 格式的结束时间，
  "task": 任务标题（简洁明确），
  "remark": 任务详细说明或注意事项（可选），
  "state": "pending"（固定值）
}

## 规划原则
1. 时间安排：所有任务的startTime和endTime必须在用户指定的时间窗内
2. 时间连续：任务之间可以连续或留有合理间隔（如休息时间）
3. 时间合理：每个任务时长要符合实际需求（15分钟到2小时为宜）
4. 任务拆解：将大任务拆解为3-5个可执行的小步骤
5. 优先级：重要且紧急的任务安排在精力充沛的时段

## 输出要求
- 只输出JSON数组，不要任何解释文字
- 不要使用markdown代码块标记
- 确保JSON格式完全正确，可被直接解析

示例输出：
[{"id":1,"taskTime":"2024-11-18","startTime":"09:00","endTime":"10:00","task":"需求分析","remark":"整理项目需求文档","state":"pending"}]`;
    };

    const buildSplitPrompt = (task: UiTask, window: { startISO: string; endISO: string }) => {
        const taskDuration = task.startTime && task.endTime ?
            `${task.startTime}-${task.endTime}` : '未指定';
        return `你是专业的任务拆解助手。请将以下任务细化为更小的可执行步骤。

## 待拆解任务
- 任务名称：${task.task ?? '未命名任务'}
- 计划日期：${task.taskTime ?? '未指定'}
- 时间段：${taskDuration}
- 任务说明：${task.remark || '无'}

## 拆解要求
1. 将任务拆解为3-6个具体的执行步骤
2. 每个步骤都要有明确的开始和结束时间
3. 步骤之间可以连续或留有5-10分钟间隔
4. 所有步骤的时间必须在原任务时间段内：${taskDuration}
5. 每个步骤要具体可执行，避免模糊描述

## 输出格式
严格输出JSON数组，格式与之前相同：
[{"id":数字,"taskTime":"YYYY-MM-DD","startTime":"HH:mm","endTime":"HH:mm","task":"步骤标题","remark":"详细说明","state":"pending"}]

只输出JSON数组，不要任何解释文字或markdown标记。`;
    };

    const parseTasksJson = (text: string): UiTask[] => {
        // 尝试直接解析为数组
        try {
            const obj = JSON.parse(text);
            if (Array.isArray(obj)) return obj as UiTask[];
        } catch {
        }
        // 简单从文本中提取第一个 [...]
        const m = text.match(/\[([\s\S]*?)\]/);
        if (m) {
            try {
                const arr = JSON.parse(m[0]);
                if (Array.isArray(arr)) return arr as UiTask[];
            } catch {
            }
        }
        return [];
    };

    const requestTasks = async (userText: string, windowISO: {
        startISO: string;
        endISO: string
    }): Promise<UiTask[]> => {
        // 构建用户消息为 user 与 system prompt
        const prompt = `${buildTasksPrompt(userText)}\n用户内容：${userText}\n起止时间窗(ISO)：${windowISO.startISO} ~ ${windowISO.endISO}`;
        if (!API_URL) {
            // mock：返回 3 段平均切分
            const s = new Date(windowISO.startISO);
            const e = new Date(windowISO.endISO);
            const total = Math.max(1, Math.floor((e.getTime() - s.getTime()) / 60000));
            const per = Math.max(15, Math.floor(total / 3));
            const tasks: UiTask[] = [];
            let cur = new Date(s);
            for (let i = 0; i < 3; i++) {
                const st = new Date(cur);
                const en = new Date(st.getTime() + per * 60000);
                tasks.push({
                    id: Date.now() + i,
                    taskTime: toYMD(st),
                    startTime: toHM(st),
                    endTime: toHM(en),
                    task: i === 0 ? `分析并准备：${userText}` : i === 1 ? `执行：${userText}` : `复盘与记录：${userText}`,
                    remark: '',
                    state: 'pending'
                });
                cur = en;
            }
            return tasks;
        }
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt})
        });
        const text = await resp.text();
        return parseTasksJson(text);
    };

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        setJsonErrors([]);
        const userText = chatInput.trim();
        try {
            // 记录用户消息
            setMessages((prev) => [...prev, {id: String(Date.now()), role: 'user', text: userText}]);
            const tasks = await requestTasks(userText, {startISO, endISO});
            // 记录助手任务卡片消息
            setMessages((prev) => [...prev, {id: String(Date.now() + 1), role: 'assistant', tasks}]);
            setChatInput("");
        } catch (err: any) {
            setJsonErrors([err?.message || '请求失败']);
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

    // 点击卡片触发“二次拆解”
    const handleSplitTask = async (t: UiTask) => {
        if (!startISO || !endISO) return;
        setLoading(true);
        try {
            const splitPrompt = buildSplitPrompt(t, {startISO, endISO});
            setMessages((prev) => [...prev, {id: String(Date.now()), role: 'user', text: `拆分任务：${t.task}`}]);
            const tasks = await requestTasks(splitPrompt, {startISO, endISO});
            setMessages((prev) => [...prev, {id: String(Date.now() + 1), role: 'assistant', tasks}]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center px-4 pb-36 overflow-hidden">
            {/* 背景（极简） */}
            <div
                className="absolute inset-0 bg-white dark:bg-[#0b0f19]"/>

            {/* 主内容 */}
            <div className="relative z-10 w-full max-w-5xl mx-auto">
                {messages.length === 0 && !loading && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 text-gray-900 dark:text-white">
                                    <span className="text-2xl">🚀</span>
                                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">AI TODO for Me</h2>
                                </div>
                                <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    选择时间窗口，描述你的任务，AI 将帮你拆解为可执行步骤
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">⏰</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">设置时间</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">选择开始和结束时间</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">✍️</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">描述任务</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">输入你要完成的事情</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🎯</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">AI 规划</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">获得详细执行步骤</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 错误提示 */}
                {jsonErrors.length > 0 && (
                    <div className="max-w-3xl mx-auto mb-6">
                        <div
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-red-800 dark:text-red-300 mb-2">
                                        处理出错
                                    </div>
                                    {jsonErrors.map((err, i) => (
                                        <div key={i} className="text-sm text-red-600 dark:text-red-400">
                                            • {err}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setJsonErrors([])}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 对话内容（任务卡片流） */}
                <div className="space-y-6">
                    {messages.map((m) => (
                        <div key={m.id} className="w-full animate-fadeIn">
                            {m.role === 'user' ? (
                                <div className="max-w-3xl mx-auto">
                                    <div
                                        className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-2xl p-5 shadow-md">
                                        <div
                                            className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            你
                                        </div>
                                        <div className="flex-1 text-sm text-gray-800 dark:text-gray-200 pt-1">
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <TaskFlow tasks={m.tasks || []} onTaskClick={handleSplitTask}/>
                            )}
                        </div>
                    ))}

                    {/* 加载状态 */}
                    {loading && (
                        <div className="w-full animate-fadeIn">
                            <div className="max-w-3xl mx-auto">
                                <div
                                    className="flex items-start gap-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-5 shadow-md">
                                    <div
                                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white animate-spin" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            AI 正在思考中...
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                                 style={{animationDelay: '0ms'}}/>
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                                 style={{animationDelay: '150ms'}}/>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                                                 style={{animationDelay: '300ms'}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部占位，避免内容被输入框遮挡 */}
                {messages.length > 0 && <div className="h-32"/>}
            </div>

            {/* 底部输入栏（固定） */}
            <div
                className="fixed left-0 right-0 bottom-0 z-20 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pt-4 pb-4">
                <div className="max-w-5xl mx-auto px-4">
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
        </div>
    )
}
