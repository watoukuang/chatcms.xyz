import React, {useEffect, useMemo, useState} from 'react';
import {useConsoleHeaderTitle} from '@/layout/console/Header';

type JobMeta = { id: string; title: string; updatedAt: number };

export default function Image(): React.ReactElement {
  const [jobs, setJobs] = useState<JobMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeJob = useMemo(() => jobs.find(j => j.id === activeId) || null, [jobs, activeId]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('图片生成');
  const {setConfig} = useConsoleHeaderTitle();

  useEffect(() => {
    setConfig({ title, onChangeTitle: setTitle });
    return () => setConfig(null);
  }, [title, setConfig]);

  useEffect(() => {
    // 初始化一个示例任务
    const id = `img-${Date.now()}`;
    const meta: JobMeta = {id, title: '未命名图片任务', updatedAt: Date.now()};
    setJobs([meta]);
    setActiveId(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(j => j.title.toLowerCase().includes(q));
  }, [jobs, query]);

  const handleCreate = () => {
    const id = `img-${Date.now()}`;
    const meta: JobMeta = {id, title: '未命名图片任务', updatedAt: Date.now()};
    setJobs(prev => [meta, ...prev]);
    setActiveId(id);
  };

  const handleDelete = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (activeId === id) {
      const next = jobs.filter(j => j.id !== id)[0]?.id ?? null;
      setActiveId(next);
    }
  };

  return (
    <div className="flex min-h-[80vh]">
      {/* 左侧任务列表，样式对齐 writer/Menu */}
      <aside className="w-[260px] shrink-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212]">
        <div className="p-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索任务"
            className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20"
          />
          <button
            onClick={handleCreate}
            className="px-2 py-1.5 text-sm rounded border bg-white border-gray-200 hover:bg-gray-50 dark:bg-black/20 dark:border-white/15 dark:text-gray-200"
          >新建</button>
        </div>

        <ul className="p-2 space-y-1">
          {filtered.length === 0 && (
            <li className="px-2 py-3 text-xs text-gray-500">没有匹配的任务</li>
          )}
          {filtered.map(j => (
            <li key={j.id} className="group">
              <button
                onClick={() => setActiveId(j.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeId === j.id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]'}`}
              >
                <div className="text-sm font-medium truncate">{j.title || '未命名图片任务'}</div>
                <div className="text-xs mt-0.5 text-gray-500">{new Date(j.updatedAt).toLocaleString()}</div>
              </button>
              <div className="flex justify-end px-3 -mt-2 mb-2">
                <button
                  onClick={() => handleDelete(j.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600"
                >删除</button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* 右侧主内容区域，结构对齐 writer */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏（简版） */}
        <div className="border-b border-gray-200 dark:border-white/10">
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2">
            <button className="px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]" onClick={handleCreate}>新建任务</button>
            <div className="w-px h-5 bg-gray-200 dark:bg-[#2a2c31] mx-1"/>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { /* 生成占位 */ }}>生成图片</button>
            <button className="px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]" onClick={() => { /* 清空占位 */ }}>清空</button>
          </div>
        </div>

        {/* 内容卡片 */}
        <div className="flex-1 px-6 py-5">
          <div className="max-w-[860px] mx-auto">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#121212]">
              <div className="px-6 py-5 space-y-4">
                <input
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20"
                  placeholder="输入图片生成提示词（Prompt）"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20">
                    <option>正方形 1:1</option>
                    <option>横版 16:9</option>
                    <option>竖版 9:16</option>
                  </select>
                  <select className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20">
                    <option>风格：写实</option>
                    <option>风格：动漫</option>
                    <option>风格：油画</option>
                  </select>
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-6 text-center text-sm text-gray-500">
                  生成结果区域（占位）
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}