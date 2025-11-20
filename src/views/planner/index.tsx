import React, {useState, useEffect} from 'react';
import {Task} from '@/types/app/scrum';
import storage from '@/src/shared/utils/storage';
import moment from 'moment';

interface BacklogTask extends Omit<Task, 'taskTime'> {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes?: number;
    tags?: string[];
    createdAt: string;
    scheduledDate?: string;
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
    const [tasks, setTasks] = useState<BacklogTask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<BacklogTask[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<BacklogTask | null>(null);
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'priority' | 'created' | 'estimated'>('priority');

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
                const priorityOrder = {urgent: 0, high: 1, medium: 2, low: 3};
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortBy === 'created') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
            }
        });

        setFilteredTasks(filtered);
    }, [tasks, filterPriority, searchQuery, sortBy]);

    // 保存任务
    const saveTasks = (newTasks: BacklogTask[]) => {
        setTasks(newTasks);
        storage.set('backlog_tasks', newTasks);
    };

    // 添加任务
    const handleAddTask = (taskData: Partial<BacklogTask>) => {
        const newTask: BacklogTask = {
            id: Date.now(),
            task: taskData.task || '',
            remark: taskData.remark || '',
            priority: taskData.priority || 'medium',
            estimatedMinutes: taskData.estimatedMinutes,
            tags: taskData.tags || [],
            state: 'pending',
            startTime: '',
            endTime: '',
            createdAt: new Date().toISOString(),
        };
        saveTasks([...tasks, newTask]);
        setIsAddModalOpen(false);
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
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-[#1a1d29] dark:to-blue-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                📋 灵活备选
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                管理你的任务池，随时安排到日程中
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            <span className="text-xl">+</span>
                            <span>添加任务</span>
                        </button>
                    </div>

                    {/* 统计卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(priorityConfig).map(([key, config]) => {
                            const count = tasks.filter(t => t.priority === key).length;
                            return (
                                <div
                                    key={key}
                                    className={`${config.bg} border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:scale-105`}
                                    onClick={() => setFilterPriority(filterPriority === key ? 'all' : key)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {config.icon} {config.label}优先级
                                            </p>
                                            <p className={`text-2xl font-bold ${config.text} mt-1`}>
                                                {count}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 过滤和搜索栏 */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <input
                            type="text"
                            placeholder="🔍 搜索任务..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="priority">按优先级排序</option>
                            <option value="created">按创建时间排序</option>
                            <option value="estimated">按预估时长排序</option>
                        </select>
                    </div>
                </div>

                {/* 任务列表 */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <p className="text-6xl mb-4">📭</p>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                {searchQuery || filterPriority !== 'all' ? '没有找到匹配的任务' : '还没有任务，点击上方按钮添加'}
                            </p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const config = priorityConfig[task.priority];
                            return (
                                <div
                                    key={task.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4"
                                    style={{borderLeftColor: `var(--${task.priority}-color, #3b82f6)`}}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{config.icon}</span>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {task.task}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            {task.remark && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-3 ml-11">
                                                    {task.remark}
                                                </p>
                                            )}
                                            <div
                                                className="flex items-center gap-4 ml-11 text-sm text-gray-500 dark:text-gray-400">
                                                {task.estimatedMinutes && (
                                                    <span>⏱️ 预计 {task.estimatedMinutes} 分钟</span>
                                                )}
                                                <span>📅 创建于 {moment(task.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                                            </div>
                                            {task.tags && task.tags.length > 0 && (
                                                <div className="flex gap-2 mt-3 ml-11">
                                                    {task.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingTask(task)}
                                                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                ✏️ 编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                🗑️ 删除
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const date = prompt('请输入要安排的日期 (YYYY-MM-DD):', moment().format('YYYY-MM-DD'));
                                                    if (date) handleMoveToSchedule(task, date);
                                                }}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                                            >
                                                📅 安排
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 添加/编辑任务模态框 */}
            {(isAddModalOpen || editingTask) && (
                <TaskModal
                    task={editingTask}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={editingTask ? handleUpdateTask : handleAddTask}
                />
            )}
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
        priority: task?.priority || 'medium' as BacklogTask['priority'],
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
                            优先级
                        </label>
                        <div className="grid grid-cols-4 gap-2">
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
