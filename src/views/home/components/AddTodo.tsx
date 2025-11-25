import React from "react";

interface AddTodoProps {
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

const AddTodo: React.FC<AddTodoProps> = ({
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
        <div className="w-full flex flex-col gap-3 border-b border-gray-200 pb-4">
            <div className="flex flex-row items-end gap-4">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300">开始时间</label>
                    <input
                        type="datetime-local"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        value={startISO}
                        onChange={(e) => setStartISO(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300">结束时间</label>
                    <input
                        type="datetime-local"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        value={endISO}
                        onChange={(e) => setEndISO(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300">目标总时长(分钟)</label>
                    <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="可选"
                        value={durationMin}
                        onChange={(e) => setDurationMin(e.target.value)}
                    />
                </div>
                <div className="ml-auto text-sm text-gray-500">
                    {diffMinutes !== undefined ? `时间窗：${diffMinutes} 分钟` : ""}
                </div>
            </div>
            {validation.length > 0 && (
                <div className="text-red-600 text-sm">
                    {validation.map((m, i) => (
                        <div key={i}>• {m}</div>
                    ))}
                </div>
            )}
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                    <textarea
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="描述你的任务与偏好，Enter 发送，Cmd/Ctrl+Enter 或 Shift+Enter 换行"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={onKeyDownTextArea}
                        disabled={loading}
                    />
                    <button
                        className={`h-9 px-4 rounded text-white text-sm ${canSend ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-400"}`}
                        onClick={handleSend}
                        disabled={!canSend}
                    >
                        {loading ? "发送中..." : "发送"}
                    </button>
                </div>
                {lastMessage && (
                    <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {lastMessage}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default AddTodo;
