import React from "react";

interface ChatPanelProps {
    value: string;
    setValue: (val: string) => void;
    loading: boolean;
    onSubmit: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
                                                 value,
                                                 setValue,
                                                 loading,
                                                 onSubmit
                                             }) => {
    const canSend = !loading && value.trim().length > 0;

    return (
        <div
            className="mx-auto p-6 bg-white/95 dark:bg-[#1f2937]/95 backdrop-blur-xl border border-lime-500/30 dark:border-lime-700/40 rounded-2xl shadow-2xl w-full transition-all duration-300">
            <div className="w-full flex flex-col gap-4">
                {/* 任务描述输入区 */}
                <div className="flex items-end">
                    <div className="relative flex-1">
                        <textarea
                            className="flex-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 rounded-xl px-4 py-3 pr-12 text-sm min-h-[120px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all shadow-sm hover:shadow-md resize-none"
                            placeholder="现在你想做什么？例如：今晚把个人网站做出一个能看的版本&#10;&#10;AI 会帮你拆分成可执行的步骤，并估算每一步的工时。&#10;&#10;Enter 发送，Shift+Enter 换行"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                                    e.preventDefault();
                                    if (canSend) {
                                        onSubmit();
                                    }
                                }
                            }}
                            aria-label="任务描述"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            aria-label="发送"
                            className={`absolute right-3 bottom-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${canSend ? "bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] hover:from-lime-600 hover:to-lime-700 shadow-lg hover:scale-105 ring-1 ring-lime-500/40" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                            onClick={onSubmit}
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     className={`w-4 h-4 ${canSend ? 'text-lime-50 dark:text-lime-200' : ''}`}>
                                    <path d="M5 12h12M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPanel;
