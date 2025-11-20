import React from "react";

interface ChatPanelProps {
    startISO: string;
    setStartISO: (val: string) => void;
    endISO: string;
    setEndISO: (val: string) => void;
    durationMin: string;
    setDurationMin: (val: string) => void;
    chatInput: string;
    setChatInput: (val: string) => void;
    loading: boolean;
    lastMessage: string;
    diffMinutes?: number;
    validation: string[];
    canSend: boolean;
    handleSend: () => void;
    onKeyDownTextArea: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    showTemplates?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
                                                 startISO, setStartISO,
                                                 endISO, setEndISO,
                                                 durationMin,
                                                 setDurationMin,
                                                 chatInput, setChatInput,
                                                 loading, lastMessage,
                                                 diffMinutes, validation,
                                                 canSend, handleSend,
                                                 onKeyDownTextArea,
                                                 showTemplates = true
                                              }) => {
    // 辅助：格式化为 datetime-local 可接受的本地字符串（到分钟）
    const formatLocalInputValue = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    // 手动输入：规范化常见格式为本地 ISO 分钟（YYYY-MM-DDTHH:mm）
    const normalizeISOInput = (raw: string): string => {
        const s = raw.trim();
        if (!s) return "";
        const re = /^([0-9]{4})[-\/.]([0-9]{1,2})[-\/.]([0-9]{1,2})[ T]?([0-9]{1,2}):([0-9]{1,2})$/;
        const m = s.match(re);
        if (!m) return "";
        const [_, yyyy, mm, dd, hh, mi] = m;
        const M = Number(mm), D = Number(dd), H = Number(hh), Min = Number(mi);
        if (M < 1 || M > 12 || D < 1 || D > 31 || H < 0 || H > 23 || Min < 0 || Min > 59) return "";
        const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi), 0, 0);
        const aligned = Math.round(dt.getMinutes() / 5) * 5;
        if (aligned === 60) {
            dt.setHours(dt.getHours() + 1, 0, 0, 0);
        } else {
            dt.setMinutes(aligned, 0, 0);
        }
        return formatLocalInputValue(dt);
    };

    const preferISO = (s?: string) => {
        if (!s) return s;
        const n = normalizeISOInput(s);
        return n || s;
    };

    const parseInputDate = (val?: string) => (val ? new Date(val) : new Date());
    const endOfDay = (d: Date) => {
        const x = new Date(d);
        x.setHours(23, 59, 0, 0);
        return x;
    };

    const minuteStep = 5; // 时间调整：以 5 分钟为步进
    const adjustMinutes = (baseISO: string | undefined, deltaMin: number) => {
        const base = parseInputDate(preferISO(baseISO));
        const target = new Date(base.getTime() + deltaMin * 60000);
        target.setSeconds(0, 0);
        // 对分钟进行步进对齐
        const m = target.getMinutes();
        const aligned = Math.round(m / minuteStep) * minuteStep;
        if (aligned === 60) {
            target.setHours(target.getHours() + 1, 0, 0, 0);
        } else {
            target.setMinutes(aligned, 0, 0);
        }
        return formatLocalInputValue(target);
    };

    const handleKeyAdjust = (
        e: React.KeyboardEvent<HTMLInputElement>,
        currentISO: string | undefined,
        setter: (v: string) => void
    ) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setter(adjustMinutes(currentISO, minuteStep));
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setter(adjustMinutes(currentISO, -minuteStep));
        }
    };

    const clearStart = () => setStartISO("");
    const clearEnd = () => setEndISO("");
    const setStartToday = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setStartISO(formatLocalInputValue(now));
    };
    const setEndNow = () => {
        const now = new Date();
        const aligned = Math.round(now.getMinutes() / 5) * 5;
        if (aligned === 60) {
            now.setHours(now.getHours() + 1, 0, 0, 0);
        } else {
            now.setMinutes(aligned, 0, 0);
        }
        setEndISO(formatLocalInputValue(now));
    };

    const setStartNow = () => {
        const now = new Date();
        const aligned = Math.round(now.getMinutes() / 5) * 5;
        if (aligned === 60) {
            now.setHours(now.getHours() + 1, 0, 0, 0);
        } else {
            now.setMinutes(aligned, 0, 0);
        }
        setStartISO(formatLocalInputValue(now));
    };
    const setEndPlus = (mins: number) => {
        const base = parseInputDate(startISO);
        const target = new Date(base.getTime() + mins * 60000);
        const aligned = Math.round(target.getMinutes() / 5) * 5;
        if (aligned === 60) {
            target.setHours(target.getHours() + 1, 0, 0, 0);
        } else {
            target.setMinutes(aligned, 0, 0);
        }
        setEndISO(formatLocalInputValue(target));
    };
    const setEndToday = () => {
        const base = parseInputDate(startISO);
        setEndISO(formatLocalInputValue(endOfDay(base)));
    };

    // 默认值：组件加载时，如果为空则设置为今天、分钟对齐到0或5
    React.useEffect(() => {
        const ensureFiveAligned = (d: Date) => {
            const aligned = Math.round(d.getMinutes() / 5) * 5;
            if (aligned === 60) {
                d.setHours(d.getHours() + 1, 0, 0, 0);
            } else {
                d.setMinutes(aligned, 0, 0);
            }
            return d;
        };

        if (!startISO) {
            const now = ensureFiveAligned(new Date());
            setStartISO(formatLocalInputValue(now));
        }
        if (!endISO) {
            const base = startISO ? parseInputDate(preferISO(startISO)) : new Date();
            const plus = new Date(base.getTime() + 30 * 60000);
            const alignedPlus = ensureFiveAligned(plus);
            setEndISO(formatLocalInputValue(alignedPlus));
        }
    }, [startISO, endISO]);
    

    return (
        <div
            className="mx-auto p-6 bg-white/95 dark:bg-[#1f2937]/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-2xl w-full transition-all duration-300">
            <div className="w-full flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/70">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">开始时间</label>
                        <input
                            type="text"
                            value={startISO}
                            onChange={(e) => setStartISO(e.target.value)}
                            aria-label="开始时间"
                            placeholder="YYYY-MM-DD HH:mm"
                            title="使用上下方向键以5分钟为单位调整"
                            onBlur={(e) => {
                                const n = normalizeISOInput(e.target.value);
                                if (n) setStartISO(n);
                            }}
                            onKeyDown={(e) => handleKeyAdjust(e, startISO, setStartISO)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all"
                        />
                        <div className="flex flex-wrap gap-2 mt-1">
                            <button type="button" onClick={setStartNow}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">现在开始</button>
                            <button type="button" onClick={setStartToday}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">今天</button>
                            <button type="button" onClick={clearStart}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">清除</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">结束时间</label>
                        <input
                            type="text"
                            value={endISO}
                            onChange={(e) => setEndISO(e.target.value)}
                            aria-label="结束时间"
                            placeholder="YYYY-MM-DD HH:mm"
                            title="使用上下方向键以5分钟为单位调整"
                            onBlur={(e) => {
                                const n = normalizeISOInput(e.target.value);
                                if (n) setEndISO(n);
                            }}
                            onKeyDown={(e) => handleKeyAdjust(e, endISO, setEndISO)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all"
                        />
                        <div className="flex flex-wrap gap-2 mt-1">
                            <button type="button" onClick={() => setEndPlus(30)}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">+30分钟</button>
                            <button type="button" onClick={() => setEndPlus(60)}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">+1小时</button>
                            <button type="button" onClick={() => setEndPlus(120)}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">+2小时</button>
                            <button type="button" onClick={setEndToday}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">今天结束</button>
                            <button type="button" onClick={setEndNow}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">现在</button>
                            <button type="button" onClick={clearEnd}
                                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition">清除</button>
                        </div>
                    </div>
                </div>
                {startISO && endISO && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {(() => {
                            const s = new Date(startISO).getTime();
                            const e = new Date(endISO).getTime();
                            const diffMs = Math.max(0, e - s);
                            const totalMin = Math.round(diffMs / 60000);
                            const h = Math.floor(totalMin / 60);
                            const m = totalMin % 60;
                            return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">时长：{h}小时{m}分钟</span>;
                        })()}
                    </div>
                )}
                {/* 手动输入模式，无弹层 */}
                {validation.length > 0 && (
                    <div
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-red-600 dark:text-red-400 text-sm space-y-1">
                            {validation.map((m: string, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-red-500">⚠️</span>
                                    <span>{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex items-end">
                    <div className="relative flex-1">
                        <textarea
                            className="flex-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-xl px-4 py-3 pr-12 text-sm min-h-[80px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all shadow-sm hover:shadow-md resize-none"
                            placeholder="描述你的任务与偏好，Enter 发送，Cmd/Ctrl+Enter 或 Shift+Enter 换行"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={onKeyDownTextArea}
                            aria-label="任务描述"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            aria-label="发送"
                            className={`absolute right-3 bottom-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${canSend ? "bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] hover:from-lime-600 hover:to-lime-700 shadow-lg hover:scale-105" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                            onClick={handleSend}
                            disabled={!canSend}
                        >
                            {loading ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     className="w-4 h-4 animate-spin">
                                    <path
                                        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                                    <path d="M5 12h12M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                {lastMessage && (
                    <pre
                        className="bg-gradient-to-br from-lime-100/20 to-lime-300/10 dark:from-gray-800/50 dark:to-lime-900/20 border border-lime-400/30 dark:border-lime-700/30 rounded-xl p-4 text-sm overflow-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200 shadow-inner">
                        {lastMessage}
                    </pre>
                )}
            </div>
        </div>
    );
}

export default ChatPanel;
