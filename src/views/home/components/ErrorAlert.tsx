"use client";

import React from "react";

type Props = {
    errors: string[];
    onDismiss: () => void;
};

export default function ErrorAlert({errors, onDismiss}: Props): React.ReactElement | null {
    if (!errors || errors.length === 0) return null;
    return (
        <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                        <div className="font-semibold text-red-800 dark:text-red-300 mb-2">处理出错</div>
                        {errors.map((err, i) => (
                            <div key={i} className="text-sm text-red-600 dark:text-red-400">• {err}</div>
                        ))}
                    </div>
                    <button onClick={onDismiss} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">✕</button>
                </div>
            </div>
        </div>
    );
}