import React from 'react';

export type SimpleTask = {
    id?: number;
    taskTime?: string; // YYYY-MM-DD
    startTime?: string; // HH:mm (可选，用于兼容历史数据)
    endTime?: string;   // HH:mm (可选，用于兼容历史数据)
    // 新字段：工时估算
    duration?: number; // 工时数值
    unit?: 'minute' | 'hour' | 'day'; // 工时单位
    estimateMinutes?: number; // 预估工时（分钟，兼容旧数据）
    task?: string;
    remark?: string;
    state?: 'pending' | 'in-progress' | 'completed' | 'delayed';
    // 新增：链式导航字段，指向相邻任务的 id（若存在）
    prev?: number;
    next?: number;
    // 父子关系字段
    parentId?: number; // 父任务 ID，如果是子任务
    children?: number[]; // 子任务 ID 列表
    level?: number; // 层级：0=主线，1=一级子任务，2=二级子任务
    collapsed?: boolean; // 是否折叠子任务
};

interface TaskFlowProps {
    task: SimpleTask;
    index: number;
    total: number;
    onTaskClick?: (t: SimpleTask, index: number) => void;
    onCardClick?: (t: SimpleTask, index: number) => void;
    showArrow?: boolean; // 默认展示箭头；多行布局时可关闭
}

const badgeColor = (state?: SimpleTask['state']) => {
    switch (state) {
        case 'completed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'in-progress':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        case 'delayed':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

const TaskCard: React.FC<{ 
    t: SimpleTask; 
    onClick?: () => void; 
    onSplit?: () => void;
    onToggleCollapse?: () => void;
}> = ({t, onClick, onSplit, onToggleCollapse}) => {
    // 优先使用 duration + unit，其次 estimateMinutes，最后兼容旧数据的 startTime/endTime
    const duration = t.duration && t.unit
        ? (() => {
            const unitText = t.unit === 'minute' ? '分钟' : t.unit === 'hour' ? '小时' : '天';
            return `${t.duration}${unitText}`;
        })()
        : (t.estimateMinutes
            ? (t.estimateMinutes >= 60
                ? `${Math.floor(t.estimateMinutes / 60)}小时${t.estimateMinutes % 60 > 0 ? (t.estimateMinutes % 60) + '分钟' : ''}`
                : `${t.estimateMinutes}分钟`)
            : (t.startTime && t.endTime
                ? (() => {
                    const [sh, sm] = t.startTime.split(':').map(Number);
                    const [eh, em] = t.endTime.split(':').map(Number);
                    const mins = (eh * 60 + em) - (sh * 60 + sm);
                    return mins > 0 ? `${mins}分钟` : '';
                })()
                : ''));

    return (
        <div
            className="group min-w-[280px] sm:min-w-[320px] md:min-w-[360px] max-w-[520px] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-colors duration-200 p-5 cursor-pointer relative"
            onClick={onClick}
        >
            {/* 标题栏（含操作按钮） */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {t.task || '未命名任务'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        {/* 如果有子任务，显示折叠/展开按钮 */}
                        {t.children && t.children.length > 0 && (
                            <button
                                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                                onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
                                aria-label={t.collapsed ? "展开子任务" : "折叠子任务"}
                                title={t.collapsed ? "展开子任务" : "折叠子任务"}
                            >
                                {t.collapsed ? '▶' : '▼'} {t.children.length}
                            </button>
                        )}
                        <button
                            className="px-3 py-1 text-xs bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-colors shadow-sm"
                            onClick={(e) => { e.stopPropagation(); onSplit?.(); }}
                            aria-label="AI拆分此任务"
                            title="AI拆分此任务"
                        >
                            🤖 AI拆分
                        </button>
                    </div>
                </div>
            </div>

            {/* 工时信息 */}
            {duration && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                    <span className="font-medium">预计工时：{duration}</span>
                </div>
            )}

            {/* 备注 */}
            {t.remark && (
                <div
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    💡 {t.remark}
                </div>
            )}

            {/* 底部装饰移除：避免悬停出现蓝色横线 */}
        </div>
    );
};

const Arrow: React.FC = () => (
    <div className="flex items-center justify-center mx-3 flex-shrink-0">
        {/* 桌面端：渐变箭头 */}
        <div className="hidden sm:flex items-center gap-1">
            <div className="w-12 h-0.5 bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 rounded-full"/>
            <svg className="w-4 h-4 text-lime-600 dark:text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"/>
            </svg>
        </div>
        {/* 移动端：Emoji箭头 */}
        <div className="sm:hidden text-2xl">
            ➡️
        </div>
    </div>
);

const TaskFlow: React.FC<TaskFlowProps> = ({task, index, total, onTaskClick, onCardClick, showArrow = true}) => {
    return (
        <>
            <TaskCard t={task} onClick={() => onCardClick?.(task, index)} onSplit={() => onTaskClick?.(task, index)} />
            {showArrow && index < total - 1 && <Arrow/>}
        </>
    );
};

export default TaskFlow;
