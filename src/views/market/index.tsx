import React, { useState } from 'react';
import moment from 'moment';

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

export default function MarketplaceView(): React.ReactElement {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

    const filteredTemplates = templateData.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleUseTemplate = (template: TaskTemplate) => {
        // 这里可以集成到其他页面
        alert(`模板 "${template.title}" 已添加到任务池`);
        // TODO: 实现与 Blocklog 或 Schedule 的集成
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-[#1a1d29] dark:to-purple-950 p-6">
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

                {/* 搜索栏 */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="🔍 搜索任务模板..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
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
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                            {template.usageCount.toLocaleString()} 次使用
                                        </span>
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

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUseTemplate(template);
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
                                    >
                                        ➕ 使用模板
                                    </button>
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

                            <button
                                onClick={() => {
                                    handleUseTemplate(selectedTemplate);
                                    setSelectedTemplate(null);
                                }}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium text-lg shadow-lg"
                            >
                                ➕ 使用此模板
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
