import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { loadAllTasks, loadAllTasksSync } from '@/src/shared/cached';
import { Task } from '@/types/app/scrum';
import storage from '@/src/shared/utils/storage';

interface TaskTemplate {
    id: number;
    title: string;
    description: string;
    category: string;
    estimatedMinutes: number;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    icon: string;
    usageCount: number;
    price?: number;
    contact?: string;
    source?: 'schedule' | 'custom' | 'builtin';
}

const categories = [
    { id: 'all', name: '全部', icon: '📚' },
    { id: 'work', name: '工作', icon: '💼' },
    { id: 'study', name: '学习', icon: '📖' },
    { id: 'health', name: '健康', icon: '💪' },
    { id: 'personal', name: '个人', icon: '🎯' },
    { id: 'social', name: '社交', icon: '👥' },
];

const templateData: TaskTemplate[] = [
    {
        id: 1,
        title: '每日站会',
        description: '团队每日同步会议，分享进度和问题',
        category: 'work',
        estimatedMinutes: 15,
        priority: 'high',
        tags: ['会议', '团队', '每日'],
        icon: '👥',
        usageCount: 1250,
    },
    {
        id: 2,
        title: '代码审查',
        description: '审查团队成员提交的代码',
        category: 'work',
        estimatedMinutes: 30,
        priority: 'medium',
        tags: ['开发', '代码', '审查'],
        icon: '🔍',
        usageCount: 890,
    },
    {
        id: 3,
        title: '晨间锻炼',
        description: '早晨30分钟运动，保持身体健康',
        category: 'health',
        estimatedMinutes: 30,
        priority: 'high',
        tags: ['运动', '健康', '早晨'],
        icon: '🏃',
        usageCount: 2100,
    },
    {
        id: 4,
        title: '英语学习',
        description: '每天学习英语单词和语法',
        category: 'study',
        estimatedMinutes: 45,
        priority: 'medium',
        tags: ['学习', '英语', '自我提升'],
        icon: '📚',
        usageCount: 1560,
    },
    {
        id: 5,
        title: '阅读时间',
        description: '阅读书籍或文章，拓展知识面',
        category: 'personal',
        estimatedMinutes: 60,
        priority: 'low',
        tags: ['阅读', '学习', '放松'],
        icon: '📖',
        usageCount: 1780,
    },
    {
        id: 6,
        title: '项目规划',
        description: '制定项目计划和里程碑',
        category: 'work',
        estimatedMinutes: 90,
        priority: 'high',
        tags: ['规划', '项目', '管理'],
        icon: '📋',
        usageCount: 670,
    },
    {
        id: 7,
        title: '冥想放松',
        description: '冥想练习，缓解压力',
        category: 'health',
        estimatedMinutes: 20,
        priority: 'medium',
        tags: ['冥想', '放松', '健康'],
        icon: '🧘',
        usageCount: 980,
    },
    {
        id: 8,
        title: '家人通话',
        description: '与家人视频通话，保持联系',
        category: 'social',
        estimatedMinutes: 30,
        priority: 'medium',
        tags: ['家人', '社交', '通话'],
        icon: '📞',
        usageCount: 1420,
    },
];

// 简单的类别和图标映射基于关键字
const keywordCategoryMap: { keyword: RegExp; category: string; icon: string }[] = [
    { keyword: /会议|站会|同步|讨论/i, category: 'work', icon: '👥' },
    { keyword: /代码|开发|审查|review|PR/i, category: 'work', icon: '🔍' },
    { keyword: /锻炼|运动|健身|跑步|瑜伽/i, category: 'health', icon: '🏃' },
    { keyword: /英语|学习|课堂|复习|作业|考试/i, category: 'study', icon: '📚' },
    { keyword: /阅读|读书|文章|书籍/i, category: 'personal', icon: '📖' },
    { keyword: /项目|规划|里程碑|计划/i, category: 'work', icon: '📋' },
    { keyword: /冥想|放松|正念/i, category: 'health', icon: '🧘' },
    { keyword: /家人|朋友|通话|社交|聚会/i, category: 'social', icon: '📞' },
];

const minutesBetween = (start: string, end: string): number => {
    const startMoment = moment(start, 'HH:mm');
    const endMoment = moment(end, 'HH:mm');
    const diff = endMoment.diff(startMoment, 'minutes');
    return Number.isFinite(diff) && diff > 0 ? diff : 30; // 默认 30 分钟
};

const deriveCategoryAndIcon = (text: string, remark?: string): { category: string; icon: string } => {
    const source = `${text} ${remark || ''}`;
    for (const r of keywordCategoryMap) {
        if (r.keyword.test(source)) return { category: r.category, icon: r.icon };
    }
    return { category: 'personal', icon: '🎯' };
};

const priorityFromState = (state?: string): 'low' | 'medium' | 'high' => {
    switch (state) {
        case 'in-progress':
        case 'delayed':
            return 'high';
        case 'completed':
            return 'low';
        default:
            return 'medium';
    }
};

const buildTemplatesFromTasks = (tasks: Task[]): TaskTemplate[] => {
    // 统计相同标题的出现次数作为 usageCount
    const titleCounts: Record<string, number> = {};
    tasks.forEach(t => {
        const title = t.task || '未命名任务';
        titleCounts[title] = (titleCounts[title] || 0) + 1;
    });

    return tasks.map((t, idx) => {
        const title = t.task || '未命名任务';
        const { category, icon } = deriveCategoryAndIcon(title, t.remark);
        const estimatedMinutes = minutesBetween(t.startTime || '00:00', t.endTime || '00:30');
        return {
            id: Number(t.id ?? idx),
            title,
            description: t.remark || `${moment(t.taskTime, 'YYYY-MM-DD').format('M月D日')} 任务`,
            category,
            estimatedMinutes,
            priority: priorityFromState(t.state),
            tags: [],
            icon,
            usageCount: titleCounts[title] || 1,
            source: 'schedule',
        } as TaskTemplate;
    });
};

export default function MarketplaceView(): React.ReactElement {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
    const [templatesFromTasks, setTemplatesFromTasks] = useState<TaskTemplate[]>([]);
    const [customTemplates, setCustomTemplates] = useState<TaskTemplate[]>([]);
    const [toast, setToast] = useState<string>('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const tasks = await loadAllTasks();
                if (mounted) setTemplatesFromTasks(buildTemplatesFromTasks(tasks));
            } catch (err) {
                const tasks = loadAllTasksSync();
                if (mounted) setTemplatesFromTasks(buildTemplatesFromTasks(tasks));
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        // 读取自定义模板
        const BACKUP_KEY = 'market_custom_templates';
        const list = storage.get<any[]>(BACKUP_KEY, []) || [];
        // 轻量防御转换
        const mapped: TaskTemplate[] = list.map((t, idx) => ({
            id: Number(t.id ?? idx),
            title: String(t.title || '未命名模板'),
            description: String(t.description || ''),
            category: String(t.category || 'personal'),
            estimatedMinutes: Number(t.estimatedMinutes || 30),
            priority: (t.priority === 'high' || t.priority === 'medium' || t.priority === 'low') ? t.priority : 'medium',
            tags: Array.isArray(t.tags) ? t.tags : [],
            icon: String(t.icon || '🎯'),
            usageCount: Number(t.usageCount || 1),
            price: typeof t.price === 'number' ? t.price : (t.price ? Number(t.price) : undefined),
            contact: t.contact ? String(t.contact) : undefined,
            source: 'custom'
        }));
        setCustomTemplates(mapped);
    }, []);

    const sourceTemplates = useMemo(() => {
        const base = templatesFromTasks.length > 0 ? templatesFromTasks : templateData;
        return [...customTemplates, ...base];
    }, [templatesFromTasks, customTemplates]);

    const filteredTemplates = sourceTemplates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || template.title.toLowerCase().includes(q) ||
            template.description.toLowerCase().includes(q) ||
            template.tags.some(tag => tag.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
    });

    const handleUseTemplate = (template: TaskTemplate) => {
        // 添加到备选任务池（Blocklog）
        const BACKLOG_KEY = 'backlog_tasks';
        const existing = storage.get<any[]>(BACKLOG_KEY, []) || [];
        existing.push({
            id: Date.now(),
            task: template.title,
            remark: template.description,
            priority: template.priority,
            estimatedMinutes: template.estimatedMinutes,
            tags: template.tags || [],
            createdAt: moment().toISOString(),
        });
        storage.set(BACKLOG_KEY, existing);
        setToast(`模板 "${template.title}" 已添加到备选任务池`);
        setTimeout(() => setToast(''), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                        🏪 任务市场
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        发现并使用热门任务模板，快速开始你的计划
                    </p>
                </div>

                {toast && (
                    <div className="mb-4">
                        <div className="inline-block px-3 py-2 text-sm rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            {toast}
                        </div>
                    </div>
                )}

                {/* 搜索栏 */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="🔍 搜索任务模板..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-xl px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow"
                    />
                </div>

                {/* 分类标签 */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md'
                            }`}
                        >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* 模板网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-6xl mb-4">🔍</p>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                没有找到匹配的模板
                            </p>
                        </div>
                    ) : (
                        filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl">{template.icon}</div>
                                        <div className="flex items-center gap-2">
                                            {typeof template.price !== 'undefined' && (
                                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                                                    ¥ {Number(template.price).toFixed(2)}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                                {template.usageCount.toLocaleString()} 次使用
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {template.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                        {template.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <span>⏱️ {template.estimatedMinutes} 分钟</span>
                                        <span className={`px-2 py-1 rounded ${
                                            template.priority === 'high'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                : template.priority === 'medium'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {template.priority === 'high' ? '高' : template.priority === 'medium' ? '中' : '低'}
                                        </span>
                                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            来源：{template.source === 'custom' ? '用户发布' : template.source === 'schedule' ? '固定日程' : '内置'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {template.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* 已移除接任务按钮，点击卡片直接查看详情 */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 模板详情模态框 */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedTemplate.icon}</span>
                                    <h2 className="text-2xl font-bold">{selectedTemplate.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    📝 描述
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedTemplate.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">预估时长</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedTemplate.estimatedMinutes} 分钟
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">使用次数</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedTemplate.usageCount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {(typeof selectedTemplate.price !== 'undefined' || selectedTemplate.contact) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {typeof selectedTemplate.price !== 'undefined' && (
                                        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">价格</p>
                                            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">¥ {Number(selectedTemplate.price).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {selectedTemplate.contact && (
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">联系方式</p>
                                            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200 break-words">{selectedTemplate.contact}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    🏷️ 标签
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTemplate.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 已移除接任务按钮，详情仅用于信息展示 */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
