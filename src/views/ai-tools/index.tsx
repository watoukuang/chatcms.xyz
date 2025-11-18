import React, {useState} from 'react';

interface AITool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    status: 'available' | 'coming-soon';
}

const aiTools: AITool[] = [
    {
        id: 'task-breakdown',
        name: '任务拆解助手',
        description: 'AI帮你将大任务拆解成可执行的小步骤',
        icon: '🎯',
        category: 'planning',
        status: 'available',
    },
    {
        id: 'time-optimizer',
        name: '时间优化器',
        description: '基于你的工作习惯智能安排任务时间',
        icon: '⚡',
        category: 'optimization',
        status: 'available',
    },
    {
        id: 'priority-advisor',
        name: '优先级顾问',
        description: 'AI分析任务重要性和紧急程度',
        icon: '🎓',
        category: 'analysis',
        status: 'available',
    },
    {
        id: 'focus-timer',
        name: '专注计时器',
        description: '番茄钟工作法，提高专注力',
        icon: '🍅',
        category: 'productivity',
        status: 'available',
    },
    {
        id: 'habit-tracker',
        name: '习惯追踪',
        description: '追踪和培养良好习惯',
        icon: '📈',
        category: 'habits',
        status: 'coming-soon',
    },
    {
        id: 'goal-planner',
        name: '目标规划',
        description: 'SMART目标设定和追踪',
        icon: '🎯',
        category: 'planning',
        status: 'coming-soon',
    },
];

export default function AIToolsView(): React.ReactElement {
    const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
    const [taskInput, setTaskInput] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessTask = async (tool: AITool) => {
        if (!taskInput.trim()) {
            alert('请输入任务内容');
            return;
        }

        setIsProcessing(true);
        setAiResult(null);

        // 模拟AI处理
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 根据不同工具生成不同的结果
        let result = '';
        switch (tool.id) {
            case 'task-breakdown':
                result = `📋 任务拆解结果：\n\n1. 分析需求和目标\n2. 制定详细计划\n3. 准备所需资源\n4. 执行第一步\n5. 检查进度并调整\n6. 完成并总结`;
                break;
            case 'time-optimizer':
                result = `⚡ 时间优化建议：\n\n建议在上午 9:00-11:00 执行此任务\n预计需要 2 小时\n建议分成 4 个番茄钟\n最佳工作环境：安静、专注`;
                break;
            case 'priority-advisor':
                result = `🎓 优先级分析：\n\n重要性：★★★★☆ (4/5)\n紧急程度：★★★☆☆ (3/5)\n建议优先级：高\n建议在今天或明天完成`;
                break;
            case 'focus-timer':
                result = `🍅 专注计时建议：\n\n建议使用 25 分钟工作 + 5 分钟休息\n今日已完成：0 个番茄钟\n目标：8 个番茄钟\n开始时间：现在`;
                break;
            default:
                result = '此功能即将推出，敬请期待！';
        }

        setAiResult(result);
        setIsProcessing(false);
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#1a1d29] dark:to-indigo-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                        🤖 智能应用
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        AI驱动的生产力工具，让任务管理更智能
                    </p>
                </div>

                {/* 工具网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {aiTools.map(tool => (
                        <div
                            key={tool.id}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 ${
                                tool.status === 'available' ? 'cursor-pointer hover:scale-105' : 'opacity-60'
                            }`}
                            onClick={() => tool.status === 'available' && setSelectedTool(tool)}
                        >
                            <div className="text-5xl mb-4">{tool.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {tool.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                {tool.description}
                            </p>
                            {tool.status === 'coming-soon' && (
                                <span
                                    className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                    即将推出
                                </span>
                            )}
                            {tool.status === 'available' && (
                                <button
                                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium">
                                    开始使用
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* 功能亮点 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        ✨ 功能亮点
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="text-3xl">🧠</div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    智能分析
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    AI分析你的任务模式，提供个性化建议
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-3xl">⚡</div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    自动优化
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    自动优化任务安排，提高工作效率
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-3xl">📊</div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    数据洞察
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    可视化展示你的工作数据和趋势
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-3xl">🎯</div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    目标追踪
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    追踪目标进度，保持动力和专注
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI工具使用模态框 */}
            {selectedTool && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTool(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedTool.icon}</span>
                                    <h2 className="text-2xl font-bold">{selectedTool.name}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTool(null)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedTool.description}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    输入任务内容
                                </label>
                                <textarea
                                    value={taskInput}
                                    onChange={(e) => setTaskInput(e.target.value)}
                                    rows={4}
                                    placeholder="例如：完成项目报告..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                onClick={() => handleProcessTask(selectedTool)}
                                disabled={isProcessing}
                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⚙️</span>
                                        AI 处理中...
                                    </span>
                                ) : (
                                    `🤖 开始分析`
                                )}
                            </button>

                            {aiResult && (
                                <div
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span>🎯</span>
                                        AI 分析结果
                                    </h3>
                                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                                        {aiResult}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
