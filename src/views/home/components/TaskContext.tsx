"use client";

import React from "react";
import TaskFlow, {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";

type Message = {
    id: string;
    role: 'user' | 'assistant';
    text?: string;
    tasks?: UiTask[];
};

type Props = {
    messages: Message[];
    loading: boolean;
    onTaskClick: (t: UiTask, ctx: { messageId: string; taskIndex: number }) => void;
};

export default function TaskContext({messages, loading, onTaskClick}: Props): React.ReactElement {
    return (
        <div className="mt-20 space-y-6">
            {messages.map((m) => (
                <div key={m.id} className="w-full animate-fadeIn">
                    <div className="max-w-3xl mx-auto">
                        <TaskFlow
                            tasks={m.tasks || []}
                            onTaskClick={(t, i) => onTaskClick(t, {messageId: m.id, taskIndex: i})}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}