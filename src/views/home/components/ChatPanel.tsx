import React from "react";

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
}

const ChatPanel: React.FC<ChatPanelProps> = ({
                                                 startISO, setStartISO,
                                                 endISO, setEndISO,
                                                 durationMin, setDurationMin,
                                                 chatInput, setChatInput,
                                                 loading, lastMessage,
                                                 diffMinutes, validation,
                                                 canSend, handleSend,
                                                 onKeyDownTextArea
                                             }) => {
    return (
        <div
            className="mx-auto my-4 p-6 bg-white border-2 rounded-lg shadow-lg w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <div className="w-full flex flex-col gap-3 pb-4">
                <div className="flex flex-row flex-wrap items-end gap-4">
                    <div className="flex items-center gap-2 basis-[280px] grow">
                        <span className="text-sm text-gray-600 whitespace-nowrap">开始时间</span>
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="datetime-local"
                                value={startISO}
                                onChange={(e) => setStartISO(e.target.value)}
                                placeholder="年/月/日 --:--"
                                aria-label="开始时间"
                                className="border rounded px-3 py-2 text-sm w-full pr-8"
                            />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 basis-[280px] grow">
                        <span className="text-sm text-gray-600 whitespace-nowrap">结束时间</span>
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="datetime-local"
                                value={endISO}
                                onChange={(e) => setEndISO(e.target.value)}
                                placeholder="年/月/日 --:--"
                                aria-label="结束时间"
                                className="border rounded px-3 py-2 text-sm w-full pr-8"
                            />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 basis-[240px] grow">
                        <span className="text-sm text-gray-600 whitespace-nowrap">目标总时长(分钟)</span>
                        <input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            className="border rounded px-3 py-2 text-sm w-full min-w-[160px]"
                            placeholder="可选"
                            value={durationMin}
                            onChange={(e) => setDurationMin(e.target.value)}
                            aria-label="目标总时长(分钟)"
                        />
                    </div>
                    {diffMinutes !== undefined && (
                        <div className="ml-auto text-sm text-gray-500">
                            时间窗：{diffMinutes} 分钟
                        </div>
                    )}
                </div>
                {validation.length > 0 && (
                    <div className="text-red-600 text-sm">
                        {validation.map((m: string, i: number) => (
                            <div key={i}>• {m}</div>
                        ))}
                    </div>
                )}
                <div className="mt-4 relative">
                    <textarea
                        className="flex-1 w-full border rounded px-3 py-2 text-sm min-h-[100px] pr-12"
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
                        className={`absolute right-3 bottom-3 w-8 h-8 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center ${canSend ? "" : "opacity-50"}`}
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
                    <pre className="bg-gray-50 border rounded p-3 text-xs overflow-auto whitespace-pre-wrap">
                        {lastMessage}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
