import React, {useMemo} from "react";
import moment from "moment/moment";
import TCard from "@/src/views/schedule/components/TCard";
import {Task} from "@/types/app/scrum";
import {generateWeekHeaders, generateTimeTableSlots, calculateSkipMap} from '../utils/timeUtils';
import {stateOptions} from '../constants';

interface CalendarProps {
    tasks?: Task[];
    currentDate?: moment.Moment;
    isPastWeek?: boolean;
    onEditTask?: (task: Task) => void;
    onAddTask?: (taskTime: string, startTime: string, endTime: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
                                               tasks = [],
                                               currentDate = moment(),
                                               isPastWeek = false,
                                               onEditTask,
                                               onAddTask
                                           }) => {
    const tableHeaders = useMemo(() => generateWeekHeaders(currentDate), [currentDate]);
    const timeTableSlots = useMemo(() => generateTimeTableSlots(), []);
    const skipMap = useMemo(() => calculateSkipMap(tasks, tableHeaders, timeTableSlots), [tasks, tableHeaders, timeTableSlots]);

    return (
        <div>
            <div className="overflow-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-3 py-3 w-[150px] sticky left-0 bg-gray-50 z-10 font-semibold text-gray-700 text-sm">⏰
                            时间
                        </th>
                        {tableHeaders.map(h => (
                            <th key={h.date}
                                className="border border-gray-200 px-3 py-3 w-[180px] font-medium text-gray-700 text-sm">
                                <div className="flex items-center justify-center gap-1">
                                    {h.title}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {timeTableSlots.map((slot, rowIdx) => {
                        const cellStartTime = slot.split('-')[0];
                        return (
                            <tr key={slot} className="hover:bg-blue-50/30 transition-colors">
                                <td className="border border-gray-200 px-3 py-2 align-middle sticky left-0 bg-white z-10 text-sm text-gray-600 font-medium text-center">{slot}</td>
                                {tableHeaders.map((h) => {
                                    // 被 rowSpan 覆盖则不渲染单元格
                                    if (skipMap[h.date]?.[rowIdx]) return null;
                                    const task = tasks.find(t =>
                                        t.taskTime === h.date &&
                                        t.startTime && t.startTime <= cellStartTime &&
                                        t.endTime && t.endTime > cellStartTime
                                    );
                                    if (task) {
                                        if (task.startTime === cellStartTime) {
                                            const rowHours = moment(task.endTime, 'HH:mm').diff(moment(task.startTime, 'HH:mm'), 'hours');
                                            return (
                                                <td key={`${h.date}-${slot}`}
                                                    className="border border-gray-200 p-0 align-middle bg-white"
                                                    rowSpan={rowHours} style={{height: `${80 * rowHours}px`}}>
                                                    <div className="flex items-center justify-center h-full">
                                                        <TCard
                                                            task={task}
                                                            stateInfo={(stateOptions.find(s => s.value === (task.state || 'pending')) || stateOptions[0]) as any}
                                                            isPastWeek={isPastWeek}
                                                            handleEdit={onEditTask || (() => {
                                                            })}
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        }
                                        return null;
                                    }
                                    return (
                                        <td key={`${h.date}-${slot}`}
                                            className="border border-gray-200 px-2 py-2 align-middle bg-white">
                                            <div
                                                onClick={isPastWeek ? undefined : () => {
                                                    const endTime = moment(cellStartTime, 'HH:mm').add(1, 'hour').format('HH:mm');
                                                    onAddTask?.(h.date, cellStartTime, endTime);
                                                }}
                                                className={`h-[60px] w-full flex items-center justify-center text-gray-300 hover:bg-blue-50 hover:text-blue-400 transition-all rounded ${isPastWeek ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                title={isPastWeek ? '历史周不可编辑' : '点击添加任务'}
                                                aria-label="该日暂无任务，显示为短横线"
                                            >
                                                -
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Calendar;