import React, {useEffect, useState} from 'react';

interface ChatBot {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji 或图标文本
    category: string; // 如 chat、writing、code 等
    status: 'available' | 'coming-soon';
    url?: string; // 外链地址
    source?: 'built-in' | 'custom';
}

const builtInBots: ChatBot[] = [
    {
        id: 'chat-qa',
        name: '对话问答',
        description: '通用聊天与问答机器人',
        icon: '💬',
        category: 'chat',
        status: 'available',
        url: 'https://aitodo.me',
        source: 'built-in',
    },
    {
        id: 'writer',
        name: 'AI写作助手',
        description: '草拟文章、总结与润色',
        icon: '📝',
        category: 'writing',
        status: 'available',
        url: 'https://aitodo.me',
        source: 'built-in',
    },
    {
        id: 'translator',
        name: '翻译机器人',
        description: '多语言互译与术语保留',
        icon: '🌐',
        category: 'chat',
        status: 'available',
        url: 'https://aitodo.me',
        source: 'built-in',
    },
    {
        id: 'code-helper',
        name: '代码助理',
        description: '代码解释、重构与调试建议',
        icon: '👨‍💻',
        category: 'code',
        status: 'coming-soon',
        source: 'built-in',
    },
];

export default function RobotNavView(): React.ReactElement {
    const [selectedBot, setSelectedBot] = useState<ChatBot | null>(null);
    const [customBots, setCustomBots] = useState<ChatBot[]>([]);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [newBotName, setNewBotName] = useState('');
    const [newBotDesc, setNewBotDesc] = useState('');
    const [newBotUrl, setNewBotUrl] = useState('');
    const [newBotIcon, setNewBotIcon] = useState('🤖');
    const [newBotCategory, setNewBotCategory] = useState('chat');
    const [activeTab, setActiveTab] = useState<string>('all');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('robot_custom_bots');
            if (raw) {
                const parsed: ChatBot[] = JSON.parse(raw);
                setCustomBots(parsed.filter(Boolean));
            }
        } catch (e) {
            // ignore parse error
        }
    }, []);

    const bots: ChatBot[] = [...builtInBots, ...customBots];

    // 分类标签与分组
    const categoryLabels: Record<string, string> = {
        chat: '聊天对话',
        writing: '写作创作',
        code: '开发编码',
        other: '其他',
    };
    const orderedCategories = ['chat', 'writing', 'code', 'other'];
    const grouped: Record<string, ChatBot[]> = bots.reduce((acc, bot) => {
        const key = orderedCategories.includes(bot.category) ? bot.category : 'other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(bot);
        return acc;
    }, {} as Record<string, ChatBot[]>);

    const handleSubmitBot = () => {
        const name = newBotName.trim();
        const url = newBotUrl.trim();
        if (!name || !url) {
            alert('请填写名称和链接');
            return;
        }
        const bot: ChatBot = {
            id: `custom-${Date.now()}`,
            name,
            description: newBotDesc.trim() || '用户提交的机器人',
            icon: newBotIcon || '🤖',
            category: newBotCategory || 'chat',
            status: 'available',
            url,
            source: 'custom',
        };
        const next = [...customBots, bot];
        setCustomBots(next);
        try {
            localStorage.setItem('robot_custom_bots', JSON.stringify(next));
        } catch (e) {
            // ignore
        }
        setIsSubmitOpen(false);
        setNewBotName('');
        setNewBotDesc('');
        setNewBotUrl('');
        setNewBotIcon('🤖');
        setNewBotCategory('chat');
        alert('提交成功，已收录到导航');
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#1a1d29] dark:to-indigo-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                                🤖 机器人导航
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                展示聊天相关机器人，快捷导航；也欢迎提交你的机器人
                            </p>
                        </div>
                        <button
                            onClick={() => setIsSubmitOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium"
                        >
                            提交你的机器人
                        </button>
                    </div>
                </div>

                {/* 标签筛选：包含“全部”与各分类 */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', ...orderedCategories.filter(k => grouped[k]?.length)].map(k => (
                        <button
                            key={k}
                            onClick={() => setActiveTab(k)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                activeTab === k
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                            }`}
                        >
                            {k === 'all' ? '全部' : categoryLabels[k]}
                        </button>
                    ))}
                </div>

                {/* 根据标签渲染单一网格；“全部”不分组 */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {(activeTab === 'all' ? bots : (grouped[activeTab] || [])).map(bot => (
                        <div
                            key={bot.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all p-3 ${
                                bot.status === 'available' ? 'cursor-pointer' : 'opacity-60'
                            }`}
                            onClick={() => bot.status === 'available' && setSelectedBot(bot)}
                        >
                            <div className="text-2xl mb-2">{bot.icon}</div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {bot.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-[11px] mb-2 line-clamp-2">
                                {bot.description}
                            </p>
                            <div className="flex items-center gap-2">
                                {bot.status === 'coming-soon' && (
                                    <span className="inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-[10px]">
                                        即将推出
                                    </span>
                                )}
                                {bot.source && (
                                    <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px]">
                                        来源：{bot.source === 'custom' ? '用户' : '内置'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 机器人详情模态框 */}
            {selectedBot && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedBot(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedBot.icon}</span>
                                    <h2 className="text-2xl font-bold">{selectedBot.name}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedBot(null)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedBot.description}
                                </p>
                                {selectedBot.url && (
                                    <button
                                        onClick={() => window.open(selectedBot.url!, '_blank')}
                                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-lg shadow-lg"
                                    >
                                        打开链接
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 提交机器人模态框 */}
            {isSubmitOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setIsSubmitOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">提交你的机器人</h2>
                                <button
                                    onClick={() => setIsSubmitOpen(false)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名称</label>
                                <input
                                    value={newBotName}
                                    onChange={(e) => setNewBotName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="例如：AI 写作助手"
                                />
                            </div>
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">简介</label>
                                <textarea
                                    value={newBotDesc}
                                    onChange={(e) => setNewBotDesc(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="用途与特点（可选）"
                                />
                            </div>
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">链接</label>
                                <input
                                    value={newBotUrl}
                                    onChange={(e) => setNewBotUrl(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图标</label>
                                    <input
                                        value={newBotIcon}
                                        onChange={(e) => setNewBotIcon(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="例如：🤖"
                                    />
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
                                    <select
                                        value={newBotCategory}
                                        onChange={(e) => setNewBotCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="chat">chat</option>
                                        <option value="writing">writing</option>
                                        <option value="code">code</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmitBot}
                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-lg shadow-lg"
                            >
                                提交
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
