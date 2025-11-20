import React, {useState, useEffect, useMemo} from 'react';
import {Task} from '@/types/app/scrum';
import storage from '@/src/shared/utils/storage';
import moment from 'moment';
import {useRouter} from 'next/router';
import Link from 'next/link';

interface BacklogTask extends Omit<Task, 'taskTime'> {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes?: number;
    tags?: string[];
    createdAt: string;
    scheduledDate?: string;
    groupId?: string;
    groupTitle?: string;
    origin?: 'prompt' | 'ai_split' | 'batch';
}

const priorityConfig = {
    urgent: {
        label: '紧急',
        color: 'from-red-500 to-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        icon: '🔥'
    },
    high: {
        label: '高',
        color: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        icon: '⚡'
    },
    medium: {
        label: '中',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        icon: '📌'
    },
    low: {
        label: '低',
        color: 'from-gray-500 to-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-600 dark:text-gray-400',
        icon: '📝'
    },
};

export default function BlocklogView(): React.ReactElement {
    const router = useRouter();
    const [tasks, setTasks] = useState<BacklogTask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<BacklogTask[]>([]);
    const [editingTask, setEditingTask] = useState<BacklogTask | null>(null);
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'priority' | 'created' | 'estimated'>('priority');
    const [groupFilter, setGroupFilter] = useState<string>('all');

    // 加载任务
    useEffect(() => {
        const saved = storage.get<BacklogTask[]>('backlog_tasks', []) || [];
        setTasks(saved);
    }, []);

    // 过滤和排序
    useEffect(() => {
        let filtered = [...tasks];

        // 优先级过滤
        if (filterPriority !== 'all') {
            filtered = filtered.filter(t => t.priority === filterPriority);
        }

        // 搜索过滤
        if (searchQuery) {
            filtered = filtered.filter(t =>
                (t.task || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.remark || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 排序
        filtered.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder: Record<string, number> = {urgent: 0, high: 1, medium: 2, low: 3};
                const ao = a.priority ? priorityOrder[a.priority] ?? 99 : 99;
                const bo = b.priority ? priorityOrder[b.priority] ?? 99 : 99;
                return ao - bo;
            } else if (sortBy === 'created') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
            }
        });

        setFilteredTasks(filtered);
    }, [tasks, filterPriority, searchQuery, sortBy]);

    // 可选分组列表（用于下拉筛选）
    const groupOptions = useMemo(() => {
        const map = new Map<string, string>();
        filteredTasks.forEach(t => {
            const id = t.groupId || '__ungrouped__';
            const title = t.groupTitle || '未分组';
            if (!map.has(id)) map.set(id, title);
        });
        return Array.from(map.entries());
    }, [filteredTasks]);

    // 保存任务
    const saveTasks = (newTasks: BacklogTask[]) => {
        setTasks(newTasks);
        storage.set('backlog_tasks', newTasks);
    };

    // 更新任务
    const handleUpdateTask = (taskData: Partial<BacklogTask>) => {
        if (!editingTask) return;
        const updated = tasks.map(t =>
            t.id === editingTask.id ? {...t, ...taskData} : t
        );
        saveTasks(updated);
        setEditingTask(null);
    };

    // 删除任务
    const handleDeleteTask = (id: number | undefined) => {
        if (!id) return;
        if (confirm('确定要删除这个任务吗？')) {
            saveTasks(tasks.filter(t => t.id !== id));
        }
    };

    // 移动到日程
    const handleMoveToSchedule = (task: BacklogTask, date: string) => {
        // 这里可以集成到 Schedule 页面
        alert(`任务将被移动到 ${date} 的日程中`);
        // TODO: 实现与 Schedule 的集成
    };

    return (
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                📋 灵活备选
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                备选任务仅来源于首页的“加入备选”操作
                            </p>
                        </div>
                    </div>

                    {/* 可收缩搜索栏 */}
                    <CollapsibleSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="搜索备选任务..."
                    />
                </div>

                {/* 任务列表 */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <p className="text-6xl mb-4">📭</p>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                                {searchQuery || filterPriority !== 'all' ? '没有找到匹配的任务' : '还没有备选任务，请前往首页点击“加入备选”'}
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all"
                            >
                                前往首页
                            </button>
                        </div>
                    ) : (
                        (() => {
                            const groups: Record<string, {title: string; items: BacklogTask[]}> = {};
                            filteredTasks.forEach((t) => {
                                const key = t.groupId || '__ungrouped__';
                                const title = t.groupTitle || '未分组';
                                if (!groups[key]) groups[key] = {title, items: []};
                                groups[key].items.push(t);
                            });

                            const entries = Object.entries(groups).filter(([gid]) => groupFilter === 'all' || gid === groupFilter);

                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {entries.map(([gid, group]) => {
                                        const totalMinutes = group.items.reduce((acc, it) => acc + (it.estimatedMinutes || 0), 0);
                                        return (
                                            <div key={gid} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{group.title || '未命名提示词'}</h2>
                                                        </div>
                                                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                            <div>🧩 任务数量：{group.items.length}</div>
                                                            <div className="mt-1">⏱️ 总时长：{totalMinutes > 0 ? `${totalMinutes} 分钟` : '暂无估时'}</div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/?historyId=${encodeURIComponent(gid)}`}
                                                        className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        去首页查看
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>

            {/* 添加/编辑任务模态框 */}
            {editingTask && (
                <TaskModal
                    task={editingTask}
                    onClose={() => {
                        setEditingTask(null);
                    }}
                    onSave={handleUpdateTask}
                />
            )}
        </div>
    );
}

// 可收缩搜索输入组件
function CollapsibleSearch({
                              value,
                              onChange,
                              placeholder
                          }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (value && !open) setOpen(true);
    }, [value, open]);

    return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
            <div className="w-full max-w-md">
                {!open ? (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        aria-label="打开搜索"
                    >
                        <span className="text-base">🔍</span>
                        <span>搜索</span>
                    </button>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={() => { if (!value) setOpen(false); }}
                        placeholder={`🔍 ${placeholder || '搜索...'}`}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                )}
            </div>
        </div>
    );
}

// 任务编辑模态框组件
function TaskModal({
                       task,
                       onClose,
                       onSave
                   }: {
    task: BacklogTask | null;
    onClose: () => void;
    onSave: (data: Partial<BacklogTask>) => void;
}) {
    const [formData, setFormData] = useState({
        task: task?.task || '',
        remark: task?.remark || '',
        priority: task?.priority || undefined as BacklogTask['priority'],
        estimatedMinutes: task?.estimatedMinutes || 0,
        tags: task?.tags?.join(', ') || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div
                    className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
                    <h2 className="text-xl font-bold">{task ? '✏️ 编辑任务' : '➕ 添加任务'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            任务名称 *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.task}
                            onChange={(e) => setFormData({...formData, task: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="输入任务名称..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            优先级（可选）
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                            {Object.entries(priorityConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({...formData, priority: key as any})}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        formData.priority === key
                                            ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                                            : `${config.bg} ${config.text} hover:scale-105`
                                    }`}
                                >
                                    {config.icon} {config.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, priority: undefined})}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${formData.priority ? '' : 'opacity-100'}`}
                                title="清除优先级"
                            >
                                清除优先级
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            备注
                        </label>
                        <textarea
                            value={formData.remark}
                            onChange={(e) => setFormData({...formData, remark: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="添加备注..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            预估时长（分钟）
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.estimatedMinutes || 0}
                            onChange={(e) => setFormData({
                                ...formData,
                                estimatedMinutes: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            标签（用逗号分隔）
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="工作, 学习, 个人..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
