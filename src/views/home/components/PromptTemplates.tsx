import React, {useState} from 'react';

export interface PromptTemplate {
    id: string;
    title: string;
    icon: string;
    description: string;
    template: string;
    category: 'task' | 'schedule' | 'flexible';
}

export const promptTemplates: PromptTemplate[] = [
    {
        id: 'quick_task',
        title: '快速拆解任务',
        icon: '⚡',
        category: 'task',
        description: '将目标拆解为可执行的小任务',
        template: `请帮我拆解以下任务：
目标：[在这里输入你的目标]
时间窗口：[开始时间] ~ [结束时间]
截止时间：[如有截止时间]
约束条件：[设备/地点/协作要求/无]

请输出：
1. 任务分解列表（含预计时长、优先级）
2. 时间安排表
3. 风险与缓冲建议
4. JSON格式数据`
    },
    {
        id: 'pomodoro',
        title: '番茄工作法',
        icon: '🍅',
        category: 'task',
        description: '按番茄时钟节奏规划任务',
        template: `请按番茄工作法（50分钟专注 + 10分钟休息）帮我规划：
目标：[输入目标]
可用时间：[开始] ~ [结束]
偏好：每个番茄专注50分钟，休息10分钟

请给出：
- 番茄时段分配
- 每个番茄的具体任务
- 休息时段建议
- JSON格式输出`
    },
    {
        id: 'weekly_plan',
        title: '周计划制定',
        icon: '📅',
        category: 'task',
        description: '制定本周工作计划',
        template: `请帮我制定本周工作计划：
本周重点目标：[列出2-3个重点目标]
工作日：周一至周五
每日工作时间：09:00-18:00（午休12:00-13:00）
已有固定安排：[如有列出]

请输出：
- 每日任务分配
- 优先级排序
- 时间分配建议
- JSON格式数据`
    },
    {
        id: 'meeting_prep',
        title: '会议准备',
        icon: '💼',
        category: 'task',
        description: '准备会议材料和PPT',
        template: `请帮我准备会议相关任务：
会议主题：[会议主题]
会议时间：[会议时间]
准备时间：[可用时间]
需要准备：[PPT/报告/数据/其他]

请拆解为：
- 资料收集任务
- 文档撰写任务
- PPT制作任务
- 预演练习时间
- JSON格式输出`
    },
    {
        id: 'learning_plan',
        title: '学习计划',
        icon: '📚',
        category: 'task',
        description: '制定学习进度安排',
        template: `请帮我制定学习计划：
学习目标：[要学习的内容]
可用时间：[每天/每周可用时间]
截止日期：[如有]
当前水平：[零基础/有基础/进阶]

请规划：
- 学习路径和阶段
- 每日学习任务
- 练习和复习安排
- 检验标准
- JSON格式数据`
    },
    {
        id: 'work_hours',
        title: '工作时段配置',
        icon: '⏰',
        category: 'schedule',
        description: '设置每日工作时间',
        template: `请帮我配置工作时段：
工作日：[周一~周五/自定义]
每日总工时：[8小时/自定义]
开始时间：[09:00/自定义]
午休时间：[12:00-13:00/无]
不可用时段：[如有列出]

请输出：
- 每日工作时段清单
- 专注/会议/沟通时段分配建议
- JSON格式固定任务数据`
    },
    {
        id: 'recurring_task',
        title: '重复任务设置',
        icon: '🔄',
        category: 'schedule',
        description: '添加每日/每周重复任务',
        template: `请帮我设置重复任务：
任务名称：[如：晨会]
重复频率：[每天/每周x/工作日]
时间：[09:30-10:00]
优先级：[高/中/低]
备注：[可选]

请：
- 检查与现有任务冲突
- 给出调整建议
- 输出JSON格式数据`
    },
    {
        id: 'insert_tasks',
        title: '智能插入任务',
        icon: '🎯',
        category: 'flexible',
        description: '将备选任务插入空闲时段',
        template: `我有一批备选任务，请帮我找到合适的时间插入：
评估时段：[日期范围]
插入策略：[尽快插入/仅空闲>=X分钟/优先高优先级]

候选任务：
1. 标题：[任务1]，时长：[X分钟]，截止：[日期/无]，优先级：[高/中/低]
2. 标题：[任务2]，时长：[X分钟]，截止：[日期/无]，优先级：[高/中/低]

请输出：
- 可插入建议（时间、理由）
- 冲突说明与替代方案
- JSON格式数据`
    },
    {
        id: 'time_block',
        title: '时间块规划',
        icon: '📦',
        category: 'flexible',
        description: '按主题分配时间块',
        template: `请帮我按时间块规划任务：
日期：[具体日期]
可用时间：[开始] ~ [结束]
时间块主题：
- 深度工作：[X小时]
- 会议沟通：[X小时]
- 学习提升：[X小时]
- 其他：[X小时]

请分配：
- 每个时间块的具体时段
- 适合的任务类型
- 休息时间安排
- JSON格式输出`
    }
];

interface PromptTemplatesProps {
    onSelectTemplate: (template: string) => void;
}

const PromptTemplates: React.FC<PromptTemplatesProps> = ({onSelectTemplate}) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'task' | 'schedule' | 'flexible'>('all');
    const [isExpanded, setIsExpanded] = useState(false);

    const categories = [
        {id: 'all', label: '全部', icon: '📋'},
        {id: 'task', label: '任务拆解', icon: '⚡'},
        {id: 'schedule', label: '固定任务', icon: '📅'},
        {id: 'flexible', label: '备选任务', icon: '🎯'}
    ];

    const filteredTemplates = selectedCategory === 'all'
        ? promptTemplates
        : promptTemplates.filter(t => t.category === selectedCategory);

    return (
        <div className="mb-6">
            {/* 折叠按钮 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 group"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">智能提示词模板</span>
                    <span
                        className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">{filteredTemplates.length}</span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {/* 展开内容 */}
            {isExpanded && (
                <div className="mt-4 space-y-4 animate-slideDown">
                    {/* 分类筛选 */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    selectedCategory === cat.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="mr-1">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* 模板列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => onSelectTemplate(template.template)}
                                className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 text-left"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                        {template.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {template.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 使用提示 */}
                    <div
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>使用提示：</strong>点击模板后，会自动填充到输入框，你只需要替换 [方括号] 中的内容即可
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptTemplates;
