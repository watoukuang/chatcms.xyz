import React from 'react';

export type SimpleTask = {
  id?: number;
  taskTime?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  task?: string;
  remark?: string;
  state?: 'pending' | 'in-progress' | 'completed' | 'delayed';
};

interface TaskFlowProps {
  tasks: SimpleTask[];
  title?: string;
  onTaskClick?: (t: SimpleTask, index: number) => void;
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

const TaskCard: React.FC<{ t: SimpleTask; onClick?: () => void }> = ({ t, onClick }) => {
  const duration = t.startTime && t.endTime ? 
    (() => {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm);
      return mins > 0 ? `${mins}分钟` : '';
    })() : '';

  return (
    <div
      className="group min-w-[240px] max-w-[300px] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-5 cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* 悬停提示 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-blue-600 dark:text-blue-400">点击拆解 →</span>
      </div>
      
      {/* 状态和日期 */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-3 py-1 text-xs font-medium rounded-full ${badgeColor(t.state)}`}>
          {t.state === 'pending' ? '待开始' : 
           t.state === 'in-progress' ? '进行中' : 
           t.state === 'completed' ? '已完成' : '延期'}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          📅 {t.taskTime || '--'}
        </div>
      </div>
      
      {/* 任务标题 */}
      <div className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[48px]">
        {t.task || '未命名任务'}
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
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          💡 {t.remark}
        </div>
      )}
      
      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const Arrow: React.FC = () => (
  <div className="flex items-center justify-center mx-3 flex-shrink-0">
    {/* 桌面端：渐变箭头 */}
    <div className="hidden sm:flex items-center gap-1">
      <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full" />
      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
    {/* 移动端：Emoji箭头 */}
    <div className="sm:hidden text-2xl">
      ➡️
    </div>
  </div>
);

const TaskFlow: React.FC<TaskFlowProps> = ({ tasks, title, onTaskClick }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title || `AI 规划了 ${tasks.length} 个任务`}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          点击任意卡片可进一步拆解
        </div>
      </div>
      
      {/* 任务卡片流 */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex items-stretch gap-2 py-2 min-w-max">
          {tasks.map((t, i) => (
            <React.Fragment key={(t.id ?? i).toString() + '-' + (t.task || '')}>
              <TaskCard t={t} onClick={() => onTaskClick?.(t, i)} />
              {i < tasks.length - 1 && <Arrow />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* 底部提示 */}
      <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>💡 提示：任务会按时间顺序执行</span>
        <span>总计 {tasks.length} 个步骤</span>
      </div>
    </div>
  );
};

export default TaskFlow;
