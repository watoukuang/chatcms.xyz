import React, { useMemo } from 'react';
import { Task } from '@/types/app/scrum';
import moment from 'moment';

interface TaskStatisticsProps {
    tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
    const stats = useMemo(() => {
        const today = moment().format('YYYY-MM-DD');
        const thisWeekStart = moment().startOf('isoWeek').format('YYYY-MM-DD');
        const thisWeekEnd = moment().endOf('isoWeek').format('YYYY-MM-DD');

        const todayTasks = tasks.filter(t => t.taskTime && t.taskTime === today);
        const weekTasks = tasks.filter(t => 
            t.taskTime && t.taskTime >= thisWeekStart && t.taskTime <= thisWeekEnd
        );

        const completedToday = todayTasks.filter(t => t.state === 'completed').length;
        const completedWeek = weekTasks.filter(t => t.state === 'completed').length;
        const pendingToday = todayTasks.filter(t => t.state === 'pending').length;
        const inProgressToday = todayTasks.filter(t => t.state === 'in-progress').length;

        // 计算今日完成率
        const todayCompletionRate = todayTasks.length > 0 
            ? Math.round((completedToday / todayTasks.length) * 100) 
            : 0;

        // 计算本周完成率
        const weekCompletionRate = weekTasks.length > 0
            ? Math.round((completedWeek / weekTasks.length) * 100)
            : 0;

        // 计算今日工作时长
        const todayMinutes = todayTasks.reduce((sum, task) => {
            if (task.startTime && task.endTime) {
                const start = moment(task.startTime, 'HH:mm');
                const end = moment(task.endTime, 'HH:mm');
                return sum + end.diff(start, 'minutes');
            }
            return sum;
        }, 0);

        // 按状态分组
        const byState = {
            pending: tasks.filter(t => t.state === 'pending').length,
            'in-progress': tasks.filter(t => t.state === 'in-progress').length,
            completed: tasks.filter(t => t.state === 'completed').length,
            cancelled: tasks.filter(t => t.state === 'delayed').length, // 使用delayed代替cancelled
        };

        return {
            todayTasks: todayTasks.length,
            weekTasks: weekTasks.length,
            completedToday,
            completedWeek,
            pendingToday,
            inProgressToday,
            todayCompletionRate,
            weekCompletionRate,
            todayMinutes,
            todayHours: Math.floor(todayMinutes / 60),
            byState,
        };
    }, [tasks]);

    return (
        <div className="space-y-6">
            {/* 今日概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon="📊"
                    title="今日任务"
                    value={stats.todayTasks}
                    subtitle={`完成 ${stats.completedToday} 个`}
                    color="blue"
                />
                <StatCard
                    icon="✅"
                    title="完成率"
                    value={`${stats.todayCompletionRate}%`}
                    subtitle="今日进度"
                    color="green"
                    progress={stats.todayCompletionRate}
                />
                <StatCard
                    icon="⏱️"
                    title="工作时长"
                    value={`${stats.todayHours}h`}
                    subtitle={`${stats.todayMinutes % 60}分钟`}
                    color="purple"
                />
                <StatCard
                    icon="📅"
                    title="本周任务"
                    value={stats.weekTasks}
                    subtitle={`完成 ${stats.completedWeek} 个`}
                    color="orange"
                />
            </div>

            {/* 任务状态分布 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📈</span>
                    任务状态分布
                </h3>
                <div className="space-y-3">
                    <StatusBar
                        label="待处理"
                        count={stats.byState.pending}
                        total={tasks.length}
                        color="bg-yellow-500"
                    />
                    <StatusBar
                        label="进行中"
                        count={stats.byState['in-progress']}
                        total={tasks.length}
                        color="bg-blue-500"
                    />
                    <StatusBar
                        label="已完成"
                        count={stats.byState.completed}
                        total={tasks.length}
                        color="bg-green-500"
                    />
                    {stats.byState.cancelled > 0 && (
                        <StatusBar
                            label="已取消"
                            count={stats.byState.cancelled}
                            total={tasks.length}
                            color="bg-gray-500"
                        />
                    )}
                </div>
            </div>

            {/* 本周完成趋势 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📊</span>
                    本周完成趋势
                </h3>
                <WeeklyChart tasks={tasks} />
            </div>
        </div>
    );
};

// 统计卡片组件
const StatCard: React.FC<{
    icon: string;
    title: string;
    value: string | number;
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    progress?: number;
}> = ({ icon, title, value, subtitle, color, progress }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20',
        green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20',
        purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20',
        orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20',
    };

    return (
        <div className={`${colorClasses[color].split(' ').slice(2).join(' ')} border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all hover:scale-105`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
                {subtitle}
            </div>
            {progress !== undefined && (
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

// 状态进度条组件
const StatusBar: React.FC<{
    label: string;
    count: number;
    total: number;
    color: string;
}> = ({ label, count, total, color }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} ({percentage}%)
                </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// 本周图表组件
const WeeklyChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const weekData = useMemo(() => {
        const days = [];
        const startOfWeek = moment().startOf('isoWeek');
        
        for (let i = 0; i < 7; i++) {
            const date = startOfWeek.clone().add(i, 'days');
            const dateStr = date.format('YYYY-MM-DD');
            const dayTasks = tasks.filter(t => t.taskTime && t.taskTime === dateStr);
            const completed = dayTasks.filter(t => t.state === 'completed').length;
            
            days.push({
                date: dateStr,
                label: date.format('ddd'),
                total: dayTasks.length,
                completed,
            });
        }
        
        return days;
    }, [tasks]);

    const maxCount = Math.max(...weekData.map(d => d.total), 1);

    return (
        <div className="flex items-end justify-between gap-2 h-48">
            {weekData.map((day, idx) => {
                const height = (day.total / maxCount) * 100;
                const completedHeight = day.total > 0 ? (day.completed / day.total) * height : 0;
                const isToday = day.date === moment().format('YYYY-MM-DD');

                return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full h-full flex flex-col justify-end">
                            <div
                                className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg transition-all duration-500 relative"
                                style={{ height: `${height}%` }}
                            >
                                <div
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                                    style={{ height: `${(completedHeight / height) * 100}%` }}
                                />
                            </div>
                            {day.total > 0 && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {day.completed}/{day.total}
                                </div>
                            )}
                        </div>
                        <div className={`text-xs font-medium ${
                            isToday 
                                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                                : 'text-gray-600 dark:text-gray-400'
                        }`}>
                            {day.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskStatistics;
