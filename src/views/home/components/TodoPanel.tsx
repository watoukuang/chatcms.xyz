import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Mform from '../../schedule/components/Mform';
import TCard from '../../schedule/components/TCard';
import moment from 'moment';
import storage from '@/src/shared/utils/storage';
import {Task} from '@/types/app/scrum';

// 改为全天 24 小时：00:00–23:00（每小时一个区间），不包含 24:00 以避免跨日解析问题
const fullDayHours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
const timeTableSlots = fullDayHours.map(start => {
    const end = moment(start, 'HH:mm').add(1, 'hour').format('HH:mm');
    return `${start}-${end}`;
});

const timeOptions = fullDayHours.map(time => ({label: time, value: time}));

// 本地缓存键
const STORAGE_KEY = 'scrum_tasks';

// 读取与写入本地任务列表
const loadAllTasks = (): Task[] => {
    const list = storage.get<Task[]>(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
};

const saveAllTasks = (list: Task[]) => {
    storage.set(STORAGE_KEY, list);
};

// 在本地缓存中按用户与日期范围查询
const getTasksLocal = (params: { startDate?: string; endDate?: string }): Task[] => {
    const {startDate, endDate} = params;
    const all = loadAllTasks();
    return all.filter((t) => {
        if (startDate && moment(t.taskTime, 'YYYY-MM-DD').isBefore(moment(startDate, 'YYYY-MM-DD'), 'day')) return false;
        if (endDate && moment(t.taskTime, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD'), 'day')) return false;
        return true;
    });
};

// 新增本地任务
const addTaskLocal = (partial: Partial<Task>): Task => {
    const all = loadAllTasks();
    const newTask: Task = {
        id: partial.id ?? Date.now(),
        taskTime: partial.taskTime ?? moment().format('YYYY-MM-DD'),
        startTime: partial.startTime ?? '00:00',
        endTime: partial.endTime ?? '01:00',
        task: partial.task ?? '',
        remark: partial.remark ?? '',
        state: partial.state ?? 'pending'
    } as Task;
    all.push(newTask);
    saveAllTasks(all);
    return newTask;
};

// 修改本地任务
const updateTaskLocal = (updated: Task): Task => {
    const all = loadAllTasks();
    const idx = all.findIndex((t) => t.id === updated.id);
    const item: Task = {
        ...all[idx],
        ...updated
    } as Task;
    if (idx >= 0) {
        all[idx] = item;
    } else {
        all.push(item);
    }
    saveAllTasks(all);
    return item;
};

const stateOptions = [
    {label: '待处理', value: 'pending', color: '#faad14'},
    {label: '进行中', value: 'in-progress', color: '#1677ff'},
    {label: '已完成', value: 'completed', color: '#52c41a'},
    {label: '已延期', value: 'delayed', color: '#f5222d'}
];

interface ScrumPageProps {
    plan?: any;
    hourStart?: number;
    hourEnd?: number;
    showLunchRow?: boolean;
    lunchStart?: number;
    useMockData?: boolean;
    useCurrentWeekHeader?: boolean;
    fullDay?: boolean;
    onUpdateTask?: (day: Date, hour: number, content: string) => void;
}

const TodoPanel: React.FC<ScrumPageProps> = (props) => {
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [currentDate, setCurrentDate] = useState(moment());
    const [loading, setLoading] = useState(false);
    // 受控表单状态
    const [formValues, setFormValues] = useState<{ [k: string]: any }>({});
    const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
    // 简易消息提示
    const [toast, setToast] = useState<string | null>(null);

    const isPastWeek = useMemo(() => currentDate.clone().endOf('isoWeek').isBefore(moment(), 'day'), [currentDate]);

    const weekDayHeaders = useMemo(() => {
        const startOfWeek = currentDate.clone().startOf('isoWeek');
        return Array.from({length: 7}, (_, i) => {
            const day = startOfWeek.clone().add(i, 'days');
            const dayName = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'][i];
            return {
                title: `${dayName} (${day.format('MM/DD')})`,
                date: day.format('YYYY-MM-DD')
            };
        });
    }, [currentDate]);

    

    const fetchTasksForCurrentWeek = useCallback(async () => {
        setLoading(true);
        const startDate = currentDate.clone().startOf('isoWeek').format('YYYY-MM-DD');
        const endDate = currentDate.clone().endOf('isoWeek').format('YYYY-MM-DD');
        try {
            const list = getTasksLocal({startDate, endDate});
            setTasks(list);
        } catch (error) {
            console.error('获取任务失败:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    

    // 监听 currentDate 变化时重新加载任务
    useEffect(() => {
        fetchTasksForCurrentWeek();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    useEffect(() => {
        if (isDrawerVisible) {
            const base = editingTask || {};
            setFormValues({
                taskTime: base.taskTime || weekDayHeaders[0]?.date,
                startTime: base.startTime || '',
                endTime: base.endTime || '',
                task: base.task || '',
                remark: base.remark || '',
                state: base.state || 'pending'
            });
            setFormErrors({});
        } else {
            setFormValues({});
            setFormErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDrawerVisible, editingTask, weekDayHeaders]);

    // 周切换
    const goToPreviousWeek = () => {
        setCurrentDate(currentDate.clone().subtract(1, 'week'));
    };
    const goToNextWeek = () => {
        setCurrentDate(currentDate.clone().add(1, 'week'));
    };
    const goToToday = () => {
        setCurrentDate(moment());
    };

    const handleAdd = () => {
        if (isPastWeek) return;
        setEditingTask({});
        setIsDrawerVisible(true);
    };

    const handleEdit = (task: Task) => {
        if (isPastWeek) return;
        setEditingTask(task);
        setIsDrawerVisible(true);
    };

    const handleOk = () => {
        const {taskTime, startTime, endTime, task, remark, state} = formValues;
        const errs: { [k: string]: string } = {};
        if (!task || String(task).trim() === '') errs.task = '请输入任务内容';
        if (!taskTime) errs.taskTime = '请选择日期';
        if (!startTime) errs.startTime = '请选择开始时间';
        if (!endTime) errs.endTime = '请选择结束时间';
        if (startTime && endTime && !(startTime < endTime)) errs.endTime = '结束时间必须晚于开始时间';
        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            return;
        }

        const taskData: Partial<Task> = {
            taskTime,
            startTime,
            endTime,
            task,
            remark,
            state
        };

        try {
            if (editingTask?.id) {
                const updatedItem = updateTaskLocal({
                    ...(taskData as Task),
                    id: editingTask.id as number,
                } as Task);
                setTasks((prev) => {
                    const idx = prev.findIndex((t) => t.id === updatedItem.id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = updatedItem;
                        return next;
                    }
                    return [...prev, updatedItem];
                });
                setToast('任务更新成功 (本地缓存)');
            } else {
                const createdItem = addTaskLocal(taskData);
                setTasks((prev) => [...prev, createdItem]);
                setToast('任务添加成功 (本地缓存)');
            }
            setIsDrawerVisible(false);
            setEditingTask(null);
        } catch (error) {
            setToast(editingTask?.id ? '更新失败' : '添加失败');
        }
    };

    const onFormChange = (field: string, value: any) => {
        setFormValues((prev) => ({...prev, [field]: value}));
        setFormErrors((prev) => ({...prev, [field]: ''}));
    };

    const getTaskForCell = (time: string, date: string) => {
        const cellStartTime = time.split('-')[0];
        const task = tasks.find(t =>
            t.taskTime === date &&
            t.startTime && t.startTime <= cellStartTime &&
            t.endTime && t.endTime > cellStartTime
        );

        if (task) {
            if (task.startTime === cellStartTime) {
                const stateOption = stateOptions.find(s => s.value === (task.state || 'pending')) || stateOptions[0];
                const stateInfo = {
                    color: stateOption.color,
                    text: stateOption.label
                };

                return (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                        <TCard
                            task={task}
                            stateInfo={stateInfo}
                            isPastWeek={isPastWeek}
                            handleEdit={handleEdit}
                        />
                    </div>
                );
            }
            return null;
        }

        return <div
            onClick={isPastWeek ? undefined : () => {
                setEditingTask({
                    taskTime: date,
                    startTime: cellStartTime,
                    endTime: moment(cellStartTime, 'HH:mm').add(1, 'hour').format('HH:mm'),
                    state: 'pending'
                });
                setIsDrawerVisible(true);
            }}
            style={{
                height: '60px',
                width: '100%',
                cursor: isPastWeek ? 'not-allowed' : 'pointer'
            }}>
            -
        </div>;
    };

    // 预计算跨行（rowSpan）映射：skipMap[date][rowIndex]=true 表示该单元格被上方 rowSpan 覆盖
    const skipMap: Record<string, Record<number, boolean>> = useMemo(() => {
        const map: Record<string, Record<number, boolean>> = {};
        weekDayHeaders.forEach(h => (map[h.date] = {}));
        tasks.forEach(t => {
            if (!t.taskTime || !t.startTime || !t.endTime) return;
            const date = t.taskTime;
            const startIdx = timeTableSlots.findIndex(s => s.startsWith(`${t.startTime}-`));
            const hours = moment(t.endTime, 'HH:mm').diff(moment(t.startTime, 'HH:mm'), 'hours');
            if (startIdx >= 0 && hours > 1) {
                for (let i = 1; i < hours; i++) {
                    map[date] && (map[date][startIdx + i] = true);
                }
            }
        });
        return map;
    }, [tasks, weekDayHeaders]);

    return (
        <div>
            {/* 顶部卡片区域 */}
            <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mb-6 transition-colors">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">📅 任务进程</div>
                    <div className="flex items-center gap-3">
                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                                onClick={goToPreviousWeek}>上一周
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300" 
                                onClick={goToNextWeek}>下一周
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300" 
                                onClick={goToToday}>回到今天
                        </button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
                        <button
                            className={`px-4 py-1.5 rounded-md text-white text-sm font-medium transition-all ${isPastWeek ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'}`}
                            onClick={handleAdd} 
                            disabled={isPastWeek}>+ 新增任务
                        </button>
                    </div>
                </div>

                {/* 加载遮罩 */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    )}

                    {/* 表格 */}
                    <div className="overflow-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-3 py-3 w-[150px] sticky left-0 bg-gray-50 z-10 font-semibold text-gray-700 text-sm">⏰ 时间</th>
                                {weekDayHeaders.map(h => (
                                    <th key={h.date} className="border border-gray-200 px-3 py-3 w-[180px] font-medium text-gray-700 text-sm">
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
                                        {weekDayHeaders.map((h) => {
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
                                                        <td key={`${h.date}-${slot}`} className="border border-gray-200 p-0 align-middle bg-white"
                                                            rowSpan={rowHours} style={{height: `${80 * rowHours}px`}}>
                                                            <div className="flex items-center justify-center h-full">
                                                                <TCard task={task}
                                                                       stateInfo={(stateOptions.find(s => s.value === (task.state || 'pending')) || stateOptions[0]) as any}
                                                                       isPastWeek={isPastWeek} handleEdit={handleEdit}/>
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                return null;
                                            }
                                            return (
                                                <td key={`${h.date}-${slot}`} className="border border-gray-200 px-2 py-2 align-middle bg-white">
                                                    <div
                                                        onClick={isPastWeek ? undefined : () => {
                                                            setEditingTask({
                                                                taskTime: h.date,
                                                                startTime: cellStartTime,
                                                                endTime: moment(cellStartTime, 'HH:mm').add(1, 'hour').format('HH:mm'),
                                                                state: 'pending'
                                                            });
                                                            setIsDrawerVisible(true);
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
            </div>

            {/* 弹窗 */}
            {isDrawerVisible && (
                <div className="fixed inset-0 z-50 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerVisible(false)}/>
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-[800px] rounded-lg shadow-2xl transform transition-all">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {editingTask?.id ? '✏️ 编辑任务' : '➕ 新增任务'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <Mform
                                    values={formValues}
                                    errors={formErrors}
                                    onChange={onFormChange as any}
                                    weekDayHeaders={weekDayHeaders}
                                    timeOptions={timeOptions}
                                    stateOptions={stateOptions}
                                />
                            </div>
                            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white transition-colors text-sm font-medium text-gray-700"
                                        onClick={() => setIsDrawerVisible(false)}>取消
                                </button>
                                <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow text-sm font-medium"
                                        onClick={handleOk}>✓ 提交
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 简易 Toast */}
            {toast && (
                <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn"
                     onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}>
                    <span className="text-green-400">✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default TodoPanel;