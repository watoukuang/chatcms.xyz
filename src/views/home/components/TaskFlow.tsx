import React from 'react';

export type SimpleTask = {
    id?: number;
    taskTime?: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string;   // HH:mm
    task?: string;
    remark?: string;
    state?: 'pending' | 'in-progress' | 'completed' | 'delayed';
    // 新增：链式导航字段，指向相邻任务的 id（若存在）
    prev?: number;
    next?: number;
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

const TaskCard: React.FC<{ t: SimpleTask; onClick?: () => void; onSplit?: () => void }> = ({t, onClick, onSplit}) => {
    const duration = t.startTime && t.endTime ?
        (() => {
            const [sh, sm] = t.startTime.split(':').map(Number);
            const [eh, em] = t.endTime.split(':').map(Number);
            const mins = (eh * 60 + em) - (sh * 60 + sm);
            return mins > 0 ? `${mins}分钟` : '';
        })() : '';

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
                    <button
                        type="button"
                        className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onSplit?.(); }}
                        aria-label="AI拆分此任务"
                        title="AI拆分此任务"
                    >
                        🤖 AI拆分
                    </button>
                </div>
            </div>

            {/* 时间信息 */}
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span className="text-blue-600 dark:text-blue-400">⏰</span>
                <span className="font-medium">{t.startTime || '--:--'}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{t.endTime || '--:--'}</span>
                {duration && (
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            ({duration})
          </span>
                )}
            </div>

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
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"/>
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
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
