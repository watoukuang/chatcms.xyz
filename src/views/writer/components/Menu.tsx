import React, {useMemo, useRef, useState, useEffect} from 'react';
import FolderIcon from "@/components/Icons/FolderIcon";
import DocIcon from "@/components/Icons/DocIcon";
import AddIcon from "@/components/Icons/AddIcon";
import DelIcon from "@/components/Icons/DelIcon";

export type DocMeta = {
    id: string;
    title: string;
    updatedAt: number;
    type?: 'note' | 'folder';
    parentId?: string | null
};

interface MenuProps {
    docs: DocMeta[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onCreateFolder: () => void;
    onCreateNote: () => void;
    onCreateUnderFolder?: (parentId: string, kind: 'folder' | 'note') => void;
    onDelete: (id: string) => void;
}

export default function Menu({
                                 docs,
                                 activeId,
                                 onSelect,
                                 onCreateFolder,
                                 onCreateNote,
                                 onCreateUnderFolder,
                                 onDelete
                             }: MenuProps): React.ReactElement {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return docs;
        return docs.filter(d => d.title.toLowerCase().includes(q));
    }, [docs, query]);

    // 顶部“新建”SVG按钮的悬停提示状态（新增文件夹 / 新增文案）
    const [newPopoverOpen, setNewPopoverOpen] = useState(false);
    const openTimerRef = useRef<number | null>(null);
    const closeTimerRef = useRef<number | null>(null);
    const clearTimers = () => {
        if (openTimerRef.current) {
            window.clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };
    useEffect(() => () => clearTimers(), []);
    const delayedOpen = (delay = 100) => {
        if (newPopoverOpen) return;
        clearTimers();
        openTimerRef.current = window.setTimeout(() => setNewPopoverOpen(true), delay) as unknown as number;
    };
    const delayedClose = (delay = 140) => {
        clearTimers();
        closeTimerRef.current = window.setTimeout(() => setNewPopoverOpen(false), delay) as unknown as number;
    };

    // 展开/收起状态：记录已展开的文件夹 id
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <aside className="w-[260px] shrink-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212]">
            <div className="p-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="搜索笔记"
                    className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20"
                />
                {/* 新建：替换为 SVG 图标，悬停展示提示菜单 */}
                <div className="relative" onMouseEnter={() => delayedOpen(100)} onMouseLeave={() => delayedClose(120)}>
                    <button
                        title="新建"
                        className="w-9 h-9 grid place-items-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]"
                        onClick={() => setNewPopoverOpen(v => !v)}
                    >
                        {/* 笔记/文件通用新增图标：加号方框 */}
                        <AddIcon/>
                    </button>
                    {newPopoverOpen && (
                        <div
                            className="absolute right-0 top-10 z-50 w-40 rounded-xl border bg-white/95 backdrop-blur shadow-lg ring-1 ring-black/5 p-1 border-gray-200 dark:bg-[#1e1e1e]/95 dark:border-[#2d2d30] dark:ring-white/5"
                            onMouseEnter={() => delayedOpen(0)} onMouseLeave={() => delayedClose(120)}>
                            <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-[#2a2c31]"
                                onClick={() => {
                                    onCreateFolder();
                                    setNewPopoverOpen(false);
                                }}
                            >
                                <FolderIcon/>
                                <span className="text-sm">新增文件夹</span>
                            </button>
                            <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-[#2a2c31]"
                                onClick={() => {
                                    onCreateNote();
                                    setNewPopoverOpen(false);
                                }}
                            >
                                <DocIcon/>
                                <span className="text-sm">新增文档</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 层级渲染：按 parentId 分组，点击文件夹展开/收起，最多 5 级 */}
            <ul className="p-2 space-y-1">
                {filtered.length === 0 && (
                    <li className="px-2 py-3 text-xs text-gray-500">没有匹配的文档</li>
                )}
                {(() => {
                    const childrenOf = (pid: string) => filtered.filter(x => x.parentId === pid);
                    const renderItem = (d: DocMeta, depth: number) => {
                        const isFolder = d.type === 'folder';
                        const isExpanded = isFolder && expanded.has(d.id);
                        return (
                            <li key={`${d.id}-${depth}`} className="group relative"
                                style={{paddingLeft: depth > 0 ? depth * 12 : 0}}>
                                <button
                                    onClick={() => isFolder ? toggleExpand(d.id) : onSelect(d.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeId === d.id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isFolder ? (<FolderIcon/>) : (<DocIcon/>)}
                                        {/* 展开/收起指示箭头 */}
                                        {isFolder && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                                 className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : ''}`}>
                                                {isExpanded ? (
                                                    <path d="M6 9l6 6 6-6"/>
                                                ) : (
                                                    <path d="M9 6l6 6-6 6"/>
                                                )}
                                            </svg>
                                        )}
                                        <div
                                            className="text-sm font-medium truncate">{d.title || (isFolder ? '未命名文件夹' : '未命名文档')}</div>
                                    </div>
                                    <div
                                        className="text-xs mt-0.5 text-gray-500">{new Date(d.updatedAt).toLocaleString()}</div>
                                </button>

                                {/* 文件夹悬停：显示可持续新增的提示（文件夹/笔记） */}
                                {isFolder && (
                                    <div
                                        className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="relative">
                                            <button
                                                title="在此文件夹新增"
                                                className="w-7 h-7 grid place-items-center rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24]"
                                            >
                                                <AddIcon/>
                                            </button>
                                            <div
                                                className="absolute right-0 top-7 z-40 w-40 rounded-xl border bg-white/95 backdrop-blur shadow-lg ring-1 ring-black/5 p-1 border-gray-200 dark:bg-[#1e1e1e]/95 dark:border-[#2d2d30] dark:ring-white/5 hidden group-hover:block">
                                                <button
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-[#2a2c31]"
                                                    onClick={() => onCreateUnderFolder?.(d.id, 'folder')}
                                                >
                                                    <FolderIcon/>
                                                    <span className="text-sm">新增文件夹</span>
                                                </button>
                                                <button
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-[#2a2c31]"
                                                    onClick={() => onCreateUnderFolder?.(d.id, 'note')}
                                                >
                                                    <DocIcon/>
                                                    <span className="text-sm">新增笔记</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 删除按钮：SVG 图标，垂直居中，悬停可见 */}
                                <button
                                    title="删除"
                                    onClick={() => onDelete(d.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-7 h-7 grid place-items-center rounded-md text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <DelIcon/>
                                </button>
                            </li>
                        );
                    };
                    const roots = filtered.filter(x => !x.parentId);
                    const nodes: React.ReactNode[] = [];
                    const walk = (node: DocMeta, depth: number) => {
                        nodes.push(renderItem(node, depth));
                        if (node.type === 'folder' && expanded.has(node.id) && depth < 5) {
                            childrenOf(node.id).forEach(child => walk(child, depth + 1));
                        }
                    };
                    roots.forEach(r => walk(r, 0));
                    return nodes;
                })()}
            </ul>
        </aside>
    );
}