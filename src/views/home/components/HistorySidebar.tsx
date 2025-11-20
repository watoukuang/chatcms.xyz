"use client";

import React from "react";
import { SimpleTask as UiTask } from "@/src/views/home/components/TaskFlow";

export type TaskHistory = {
  id: string;
  title: string;
  createdAt: string; // ISO string
  startISO?: string;
  endISO?: string;
  tasks: UiTask[];
};

type Props = {
  histories: TaskHistory[];
  activeId?: string | null;
  onSelect: (h: TaskHistory) => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
};

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const groupByPeriod = (items: TaskHistory[]) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  const buckets: Record<string, TaskHistory[]> = {
    今天: [],
    昨天: [],
    "7 天内": [],
    "30 天内": [],
  };

  for (const h of items) {
    const t = new Date(h.createdAt);
    if (t >= startOfToday) buckets["今天"].push(h);
    else if (t >= startOfYesterday && t < startOfToday) buckets["昨天"].push(h);
    else if (t >= sevenDaysAgo) buckets["7 天内"].push(h);
    else if (t >= thirtyDaysAgo) buckets["30 天内"].push(h);
    else {
      // Older than 30 days, append to 30 days bucket for simplicity
      buckets["30 天内"].push(h);
    }
  }
  return buckets;
};

export default function HistorySidebar({ histories, activeId, onSelect, onDelete, onClearAll }: Props) {
  const grouped = groupByPeriod(histories);

  const Section = ({ label, items }: { label: string; items: TaskHistory[] }) => (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{label}</div>
      <div className="flex flex-col gap-1">
        {items.length === 0 ? (
          <div className="text-xs text-gray-400">暂无内容</div>
        ) : (
          items.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelect(h)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/70 ${
                h.id === activeId
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-gray-800 dark:text-gray-200">{h.title || "未命名"}</span>
                <span className="ml-2 text-[11px] text-gray-500 dark:text-gray-400">{formatDateLabel(h.createdAt)}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{h.tasks.length} 个步骤</div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">历史记录</div>
        <div className="flex items-center gap-2">
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              清空
            </button>
          )}
        </div>
      </div>
      <Section label="今天" items={grouped["今天"] || []} />
      <Section label="昨天" items={grouped["昨天"] || []} />
      <Section label="7 天内" items={grouped["7 天内"] || []} />
      <Section label="30 天内" items={grouped["30 天内"] || []} />
    </aside>
  );
}