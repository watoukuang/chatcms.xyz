import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Mform from './components/Mform';
import moment from 'moment';
import {Task} from '@/types/app/scrum';
import Modal from './components/Modal';
import Header from './components/Header';
import {generateWeekHeaders} from './utils/timeUtils';
import {addTaskLocal, getTasksLocalAsync, initMigration, loadAllTasksSync, updateTaskLocal} from '@/src/shared/cached';
import {stateOptions, timeOptions} from './constants';
import Calendar from "./components/Calendar";
import {useAppSettings} from '@/src/provider/AppSettingsProvider';
import TaskStatistics from '@/src/components/TaskStatistics';
import '@/src/shared/utils/debugStorage'; // 加载调试工具

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

export default function ScheduleView(props?: ScrumPageProps): React.ReactElement {
    const {workHoursSettings} = useAppSettings();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [visible, setVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [currentDate, setCurrentDate] = useState(moment());
    const [loading, setLoading] = useState(false);
    // 受控表单状态
    const [formValues, setFormValues] = useState<{ [k: string]: any }>({});
    const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
    // 简易消息提示
    const [toast, setToast] = useState<string | null>(null);

    // 初始化 IndexedDB 迁移
    useEffect(() => {
        initMigration().catch(console.error);
    }, []);

    const isPastWeek = useMemo(() => currentDate.clone().endOf('isoWeek').isBefore(moment(), 'day'), [currentDate]);

    const weekDayHeaders = useMemo(() => generateWeekHeaders(currentDate), [currentDate]);

    const fetchTasksForCurrentWeek = useCallback(async () => {
        setLoading(true);
        const startDate = currentDate.clone().startOf('isoWeek').format('YYYY-MM-DD');
        const endDate = currentDate.clone().endOf('isoWeek').format('YYYY-MM-DD');
        console.log('加载任务数据（按周范围）:', {startDate, endDate});
        try {
            // 优先从 IndexedDB 查询，自动降级到 localStorage
            const list = await getTasksLocalAsync({startDate, endDate});
            console.log('加载到的任务数量:', list.length, list);
            setTasks(list);
        } catch (error) {
            console.error('❌ 获取任务失败:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    // 加载任务数据
    useEffect(() => {
        fetchTasksForCurrentWeek();
    }, [fetchTasksForCurrentWeek]);

    useEffect(() => {
        if (visible) {
            const base = editingTask || {};
            setFormValues({
                taskTime: base.taskTime || weekDayHeaders[0]?.date,
                startTime: base.startTime || '',
                endTime: base.endTime || '',
                task: base.task || '',
                remark: base.remark || '',
                state: base.state || 'pending',
            });
            setFormErrors({});
        } else {
            setFormValues({});
            setFormErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, editingTask, weekDayHeaders]);

    // 周切换
    const goToPreviousWeek = () => setCurrentDate(currentDate.clone().subtract(1, 'week'));
    const goToNextWeek = () => setCurrentDate(currentDate.clone().add(1, 'week'));
    const goToToday = () => setCurrentDate(moment());


    const handleAdd = () => {
        setEditingTask({});
        setVisible(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setVisible(true);
    };

    const validate = (values: any): Record<string, string> => {
        const {taskTime, startTime, endTime, task} = values || {};
        const errs: Record<string, string> = {};
        const requiredChecks: Array<[boolean, string, string]> = [
            [!!task && String(task).trim() !== '', 'task', '请输入任务内容'],
            [!!taskTime, 'taskTime', '请选择日期'],
            [!!startTime, 'startTime', '请选择开始时间'],
            [!!endTime, 'endTime', '请选择结束时间'],
        ];
        requiredChecks.forEach(([ok, key, msg]) => {
            if (!ok) errs[key] = msg;
        });
        if (values?.startTime && values?.endTime && !(values.startTime < values.endTime)) {
            errs.endTime = '结束时间必须晚于开始时间';
        }
        return errs;
    };

    // 构造任务数据
    const buildTaskData = (values: any): Partial<Task> => {
        const {taskTime, startTime, endTime, task, remark, state} = values || {};
        return {taskTime, startTime, endTime, task, remark, state};
    };

    // 本地持久化（新增/更新）并返回保存结果
    const persistTaskLocal = (data: Partial<Task>, current: Partial<Task> | null): {
        saved: Task;
        updated: boolean
    } => {
        if (current?.id) {
            const saved = updateTaskLocal({...(data as Task), id: current.id as number} as Task);
            return {saved, updated: true};
        }
        const saved = addTaskLocal(data);
        return {saved, updated: false};
    };

    // 合并到任务列表（存在则替换，不存在则追加）
    const mergeTaskList = (list: Task[], saved: Task): Task[] => {
        return list.some(t => t.id === saved.id)
            ? list.map(t => (t.id === saved.id ? saved : t))
            : [...list, saved];
    };

    // 关闭弹窗并清理编辑状态
    const closeEditor = () => {
        setVisible(false);
        setEditingTask(null);
    };

    const handleOk = () => {
        const errs = validate(formValues);
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            return;
        }
        const taskData = buildTaskData(formValues);
        console.log('保存任务:', taskData);
        try {
            const {saved, updated} = persistTaskLocal(taskData, editingTask);
            console.log('任务已保存:', saved);
            setTasks(prev => {
                const newList = mergeTaskList(prev, saved);
                console.log('更新后的任务列表:', newList);
                return newList;
            });
            setToast(updated ? '任务更新成功 (本地缓存)' : '任务添加成功 (本地缓存)');
            closeEditor();
        } catch (error) {
            console.error('保存失败:', error);
            setToast(editingTask?.id ? '更新失败' : '添加失败');
        }
    };

    const onFormChange = (field: string, value: any) => {
        setFormValues((prev) => ({...prev, [field]: value}));
        setFormErrors((prev) => ({...prev, [field]: ''}));
    };

    const [showStats, setShowStats] = useState(false);
    const allTasks = useMemo(() => loadAllTasksSync(), [tasks]);

    return (
        <div>
            {showStats && (
                <div className="mb-6">
                    <TaskStatistics tasks={allTasks}/>
                </div>
            )}

            {/* 顶部卡片区域 */}
            <div
                className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mb-6 transition-colors">
                <Header
                    title="📅 固定任务"
                    isPastWeek={isPastWeek}
                    onPrevWeek={goToPreviousWeek}
                    onNextWeek={goToNextWeek}
                    onToday={goToToday}
                    onAdd={handleAdd}
                    showStats={showStats}
                    onToggleStats={() => setShowStats(!showStats)}
                />
                <Calendar
                    tasks={tasks}
                    currentDate={currentDate}
                    isPastWeek={isPastWeek}
                    onEditTask={handleEdit}
                    workHoursSettings={workHoursSettings}
                    onAddTask={(taskTime, startTime, endTime) => {
                        setEditingTask({
                            taskTime,
                            startTime,
                            endTime,
                            state: 'pending'
                        });
                        setVisible(true);
                    }}
                />
            </div>

            {/* 弹窗 */}
            <Modal
                open={visible}
                title={editingTask?.id ? '✏️ 编辑任务' : '➕ 新增任务'}
                onClose={() => setVisible(false)}
                onOk={handleOk}
                okText="✓ 提交"
                cancelText="取消"
                maxWidth={800}
            >
                <Mform
                    values={formValues}
                    errors={formErrors}
                    onChange={onFormChange as any}
                    weekDayHeaders={weekDayHeaders}
                    timeOptions={timeOptions}
                    stateOptions={stateOptions}
                />
            </Modal>

            {toast && (
                <div
                    className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn"
                    onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}>
                    <span className="text-green-400">✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
}