"use client";

import React, {useMemo, useState} from "react";
import moment from "moment";
import TCard from "@/src/views/schedule/components/TCard";
import {Task} from "@/types/app/scrum";
import {generateWeekHeaders} from '../utils/timeUtils';
import {
    getAdaptiveTimeScale,
    generateAdaptiveTimeRanges,
    suggestAlignedTime,
    calculateTaskPosition,
    getSubGridPositions
} from '../utils/adaptiveTimeScale';
import {stateOptions} from '../constants';
import {WorkHoursSettings} from '@/src/provider/AppSettingsProvider';

interface AdaptiveCalendarProps {
    tasks?: Task[];
    currentDate?: moment.Moment;
    isPastWeek?: boolean;
    onEditTask?: (task: Task) => void;
    onAddTask?: (taskTime: string, startTime: string, endTime: string) => void;
    workHoursSettings?: WorkHoursSettings;
}

const AdaptiveCalendar: React.FC<AdaptiveCalendarProps> = ({
    tasks = [],
    currentDate = moment(),
    isPastWeek = false,
    onEditTask,
    onAddTask,
    workHoursSettings
}) => {
    const [dragHint, setDragHint] = useState<{ date: string; time: string } | null>(null);

    const tableHeaders = useMemo(() => generateWeekHeaders(currentDate), [currentDate]);

    // 自适应计算时间刻度
    const timeScale = useMemo(() => getAdaptiveTimeScale(tasks), [tasks]);

    // 生成时间槽
    const startHour = workHoursSettings?.startTime ? parseInt(workHoursSettings.startTime.split(':')[0]) : 0;
    const endHour = workHoursSettings?.endTime ? parseInt(workHoursSettings.endTime.split(':')[0]) : 24;

    const timeSlots = useMemo(
        () => generateAdaptiveTimeRanges(startHour, endHour, timeScale.interval),
        [startHour, endHour, timeScale.interval]
    );

    // 辅助刻度线位置
    const subGridPositions = useMemo(() => getSubGridPositions(timeScale.interval), [timeScale.interval]);

    // 检查某个时间段是否在休息时间内
    const isBreakTime = (slotStart: string): boolean => {
        if (!workHoursSettings?.breaks) return false;
        const slotTime = moment(slotStart, 'HH:mm');
        return workHoursSettings.breaks.some(breakPeriod => {
            const breakStart = moment(breakPeriod.start, 'HH:mm');
            const breakEnd = moment(breakPeriod.end, 'HH:mm');
            return slotTime.isSameOrAfter(breakStart) && slotTime.isBefore(breakEnd);
        });
    };

    // 检查某一天是否为工作日
    const isWorkDay = (date: string): boolean => {
        if (!workHoursSettings?.workDays) return true;
        const dayOfWeek = moment(date).day();
        return workHoursSettings.workDays.includes(dayOfWeek);
    };

    // 处理单元格点击（添加任务）
    const handleCellClick = (date: string, slotStart: string) => {
        if (isPastWeek || isBreakTime(slotStart) || !isWorkDay(date)) return;

        const endTime = moment(slotStart, 'HH:mm').add(timeScale.interval, 'minutes').format('HH:mm');
        onAddTask?.(date, slotStart, endTime);
    };

    // 处理鼠标悬停（显示建议对齐线）
    const handleCellHover = (date: string, slotStart: string) => {
        if (isPastWeek || isBreakTime(slotStart) || !isWorkDay(date)) {
            setDragHint(null);
            return;
        }
        setDragHint({ date, time: slotStart });
    };

    // 渲染任务卡片（支持分钟级精确定位）
    const renderTaskCard = (task: Task, date: string) => {
        if (task.taskTime !== date || !task.startTime || !task.endTime) return null;

        const stateOption = stateOptions.find(s => s.value === (task.state || 'pending')) || stateOptions[0];
        const stateInfo = {
            color: stateOption.color,
            text: stateOption.label
        };

        // 计算任务的精确位置
        const baseTime = timeSlots[0]?.split('-')[0] || '00:00';
        const position = calculateTaskPosition(
            task.startTime,
            task.endTime,
            60, // 单个槽高度
            timeScale.interval,
            baseTime
        );

        return (
            <div
                key={task.id}
                className="absolute left-0 right-0 px-2 z-10"
                style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`,
                }}
            >
                <div className="h-full flex items-center justify-center">
                    <TCard
                        task={task}
                        stateInfo={stateInfo as any}
                        isPastWeek={isPastWeek}
                        handleEdit={onEditTask || (() => {})}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            {/* 刻度信息提示 */}
            <div className="mb-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">当前时间刻度：</span> {timeScale.label}
                <span className="ml-4 text-gray-600 dark:text-gray-400">
                    （根据任务时间自动调整）
                </span>
            </div>

            <div className="overflow-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="border border-gray-200 dark:border-gray-700 px-3 py-3 w-[150px] sticky left-0 bg-gray-50 dark:bg-gray-800 z-20 font-semibold text-gray-700 dark:text-gray-200 text-sm">
                                ⏰ 时间
                            </th>
                            {tableHeaders.map(h => (
                                <th
                                    key={h.date}
                                    className="border border-gray-200 dark:border-gray-700 px-3 py-3 w-[180px] font-medium text-gray-700 dark:text-gray-200 text-sm"
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        {h.title}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, rowIdx) => {
                            const cellStartTime = slot.split('-')[0];
                            return (
                                <tr key={slot} className="hover:bg-lime-50/30 dark:hover:bg-lime-900/10 transition-colors">
                                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 align-middle sticky left-0 bg-white dark:bg-gray-900 z-10 text-sm text-gray-600 dark:text-gray-300 font-medium text-center">
                                        {slot}
                                    </td>
                                    {tableHeaders.map((h) => {
                                        const isBreak = isBreakTime(cellStartTime);
                                        const isNonWorkDay = !isWorkDay(h.date);
                                        const cellBgClass = isBreak
                                            ? 'bg-amber-50 dark:bg-amber-900/10'
                                            : isNonWorkDay
                                            ? 'bg-gray-100 dark:bg-gray-800/50'
                                            : 'bg-white dark:bg-gray-900';
                                        const cellTitle = isBreak
                                            ? '休息时间'
                                            : isNonWorkDay
                                            ? '非工作日'
                                            : isPastWeek
                                            ? '历史周不可编辑'
                                            : '点击添加任务';

                                        // 检查是否有建议对齐提示
                                        const showHint = dragHint?.date === h.date && dragHint?.time === cellStartTime;

                                        return (
                                            <td
                                                key={`${h.date}-${slot}`}
                                                className={`border border-gray-200 dark:border-gray-700 px-2 py-2 align-middle relative ${cellBgClass}`}
                                                onMouseEnter={() => handleCellHover(h.date, cellStartTime)}
                                                onMouseLeave={() => setDragHint(null)}
                                            >
                                                {/* 辅助刻度线 */}
                                                {subGridPositions.map((pos, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="absolute left-0 right-0 border-t border-dashed border-gray-200 dark:border-gray-700 opacity-30"
                                                        style={{ top: `${pos * 100}%` }}
                                                    />
                                                ))}

                                                <div
                                                    onClick={() => handleCellClick(h.date, cellStartTime)}
                                                    className={`h-[60px] w-full flex items-center justify-center text-gray-300 dark:text-gray-600 transition-all rounded ${
                                                        isPastWeek || isBreak || isNonWorkDay
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : 'cursor-pointer hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:text-lime-600 dark:hover:text-lime-400'
                                                    } ${showHint ? 'ring-2 ring-lime-400 dark:ring-lime-600' : ''}`}
                                                    title={cellTitle}
                                                >
                                                    {isBreak ? '☕' : isNonWorkDay ? '🏖️' : '-'}
                                                </div>

                                                {/* 建议对齐提示 */}
                                                {showHint && !isBreak && !isNonWorkDay && (
                                                    <div className="absolute top-1 right-1 text-[10px] bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 px-1 rounded">
                                                        建议
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* 任务层（绝对定位，覆盖在表格上方） */}
                <div className="relative">
                    {tableHeaders.map((h, colIdx) => {
                        const dayTasks = tasks.filter(t => t.taskTime === h.date);
                        return (
                            <div
                                key={h.date}
                                className="absolute top-0"
                                style={{
                                    left: `${150 + colIdx * 180}px`, // 时间列宽度 + 列索引 * 列宽
                                    width: '180px',
                                    height: `${timeSlots.length * 60}px`,
                                }}
                            >
                                {dayTasks.map(task => renderTaskCard(task, h.date))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdaptiveCalendar;
