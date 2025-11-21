"use client";

import React from "react";
import { SimpleTask as UiTask } from "@/src/views/home/components/TaskFlow";
import AddIcon from "@/src/components/Icons/AddIcon";
import DelIcon from "@/src/components/Icons/DelIcon";

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
  onNewTodo: () => void;
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

export default function Sidebar({ histories, activeId, onSelect, onDelete, onNewTodo, onClearAll }: Props) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(
    () =>
      histories.filter((h) =>
        !search.trim()
          ? true
          : (h.title || "").toLowerCase().includes(search.trim().toLowerCase())
      ),
    [histories, search]
  );

  const grouped = groupByPeriod(filtered);

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
                  ? "border-lime-400 bg-lime-50 dark:bg-lime-900/20"
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
    <div className="h-full py-0 px-3 flex flex-col">
      {/* 固定头部：新对话 / 搜索 */}
      <div className="sticky top-0 z-10 -mx-3 px-3 pt-3 pb-3 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-sm">
        <div className="mb-2">
          <button
            type="button"
            onClick={onNewTodo}
            className="w-full px-3 py-2 text-sm rounded-lg bg-lime-600 text-white hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500/40 text-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="inline-flex items-center gap-2 justify-center w-full">
              <AddIcon />
              <span>新建TODO</span>
            </span>
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索会话/任务"
          className="w-full border border-gray-300 dark:border-gray-600 bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500"
        />
      </div>

      {/* 仅鼠标悬停时允许滚动的内容区 */}
      <div className="flex-1 overflow-y-hidden hover:overflow-y-auto overscroll-contain pt-3">
        <aside className="w-full">
          <Section label="今天" items={grouped["今天"] || []} />
          <Section label="昨天" items={grouped["昨天"] || []} />
          <Section label="7 天内" items={grouped["7 天内"] || []} />
          <Section label="30 天内" items={grouped["30 天内"] || []} />
        </aside>
      </div>

      {/* 左侧栏底部操作栏（始终置底，不随滚动） */}
      {onClearAll && (
        <div className="mt-auto -mx-3 px-3 pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClearAll}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <DelIcon />
            <span>清空所有会话</span>
          </button>
        </div>
      )}
    </div>
  );
}