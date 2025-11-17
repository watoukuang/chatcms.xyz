import React from "react";
import PromptTemplates from './PromptTemplates';

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
        <circle cx="12" cy="12" r="9" strokeWidth="2"/>
        <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

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
                                                 durationMin, setDurationMin,
                                                 chatInput, setChatInput,
                                                 loading, lastMessage,
                                                 diffMinutes, validation,
                                                 canSend, handleSend,
                                                 onKeyDownTextArea,
                                                 showTemplates = true
                                             }) => {
    return (
        <div className="mx-auto mb-6 p-8 bg-white/80 dark:bg-[#1f2937]/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 w-full transition-all duration-300 max-w-3xl hover:shadow-3xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20">
            <div className="w-full flex flex-col gap-4">
                {/* 智能提示词模板 */}
                {showTemplates && (
                    <PromptTemplates onSelectTemplate={(template) => setChatInput(template)} />
                )}
                <div className="flex flex-row flex-wrap items-end gap-4 pb-6 border-b border-gray-200/70 dark:border-gray-700/70">
                    <div className="flex items-center gap-2 basis-[280px] grow">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">开始时间</span>
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="datetime-local"
                                value={startISO}
                                onChange={(e) => setStartISO(e.target.value)}
                                placeholder="年/月/日 --:--"
                                aria-label="开始时间"
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-lg px-4 py-2.5 text-sm w-full pr-8 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                            />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 basis-[280px] grow">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">结束时间</span>
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="datetime-local"
                                value={endISO}
                                onChange={(e) => setEndISO(e.target.value)}
                                placeholder="年/月/日 --:--"
                                aria-label="结束时间"
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-lg px-4 py-2.5 text-sm w-full pr-8 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                            />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 basis-[240px] grow">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">目标总时长(分钟)</span>
                        <input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm w-full min-w-[160px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="可选"
                            value={durationMin}
                            onChange={(e) => setDurationMin(e.target.value)}
                            aria-label="目标总时长(分钟)"
                        />
                    </div>
                    {diffMinutes !== undefined && (
                        <div className="ml-auto text-sm font-medium text-blue-600 dark:text-blue-400">
                            时间窗：{diffMinutes} 分钟
                        </div>
                    )}
                </div>
                {validation.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
                <div className="relative">
                    <textarea
                        className="flex-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm min-h-[80px] pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md resize-none"
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
                        className={`absolute right-3 bottom-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${canSend ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                        onClick={handleSend}
                        disabled={!canSend}
                    >
                        {loading ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 animate-spin">
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
                {lastMessage && (
                    <pre className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-4 text-sm overflow-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200 shadow-inner">
                        {lastMessage}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
