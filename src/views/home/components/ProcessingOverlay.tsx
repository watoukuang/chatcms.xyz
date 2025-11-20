"use client";

import React from "react";

type Props = {
  onCancel: () => void;
  onRetry?: () => void;
  onImprovePrompt?: () => void;
  message?: string;
};

export default function ProcessingOverlay({ onCancel, onRetry, onImprovePrompt, message }: Props): React.ReactElement {
  return (
    <div className="fixed left-0 right-0 top-[60px] bottom-0 z-30 pointer-events-auto">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"/>
      {/* 居中卡片 */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#1f2937]/95">
          <div className="p-5">
            {/* 标题与状态动画 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"/>
              <div className="text-base font-semibold text-gray-900 dark:text-white">AI 正在拆分 TODO…</div>
            </div>
            {message && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{message}</div>
            )}

            {/* 进度步骤 */}
            <div className="grid grid-cols-1 gap-2 mb-4">
              {[
                '分析意图与约束',
                '生成候选步骤',
                '校验时间窗与顺序',
                '格式化为 JSON 列表'
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {i + 1}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">{s}</span>
                  <span className="ml-auto w-20 h-1 rounded bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse"/>
                </div>
              ))}
            </div>

            {/* 操作区 */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">提示：可取消或优化提示词以加速生成</div>
              <div className="flex items-center gap-2">
                {onImprovePrompt && (
                  <button type="button" onClick={onImprovePrompt}
                          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    优化提示词
                  </button>
                )}
                {onRetry && (
                  <button type="button" onClick={onRetry}
                          className="px-3 py-1.5 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
                    重试
                  </button>
                )}
                <button type="button" onClick={onCancel}
                        className="px-3 py-1.5 text-xs rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}