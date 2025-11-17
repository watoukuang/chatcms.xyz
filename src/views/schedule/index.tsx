import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Mform from './components/Mform';
import moment from 'moment';
import {Task, User} from '@/types/app/scrum';
import {listEmployeesAPI} from "@/api/sytem/user";
import Modal from './components/Modal';
import Header from './components/Header';
import WorkHoursConfig from './components/WorkHoursConfig';
import {calculateSkipMap, generateTimeTableSlots, generateWeekHeaders} from './utils/timeUtils';
import {addTaskLocal, getTasksLocal, updateTaskLocal} from './services/taskService';
import {stateOptions, timeOptions} from './constants';
import Calendar from "./components/Calendar";

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
    const [currentUser, setCurrentUser] = useState<number | undefined>(undefined);
    const [userOptions, setUserOptions] = useState<User[]>([]);
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

    const weekDayHeaders = useMemo(() => generateWeekHeaders(currentDate), [currentDate]);
    const timeTableSlots = useMemo(() => generateTimeTableSlots(), []);
    const skipMap = useMemo(() => calculateSkipMap(tasks, weekDayHeaders, timeTableSlots), [tasks, weekDayHeaders, timeTableSlots]);

    const fetchUsers = useCallback(async () => {
        const res = await listEmployeesAPI();
        const users = res.data || [];
        setUserOptions(users);
    }, []);

    const fetchTasksForCurrentUser = useCallback(async () => {
        setLoading(true);
        const startDate = currentDate.clone().startOf('isoWeek').format('YYYY-MM-DD');
        const endDate = currentDate.clone().endOf('isoWeek').format('YYYY-MM-DD');
        try {
            // 即使没有选择用户，也加载所有任务
            const list = getTasksLocal({userId: currentUser, startDate, endDate});
            setTasks(list);
        } catch (error) {
            console.error('获取任务失败:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, currentDate]);

    useEffect(() => {
        fetchUsers().then(error => console.error(error));
    }, [fetchUsers]);

    // 监听 currentDate 和 currentUser 变化时重新加载任务
    useEffect(() => {
        fetchTasksForCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, currentUser]);

    useEffect(() => {
        if (isDrawerVisible) {
            const base = editingTask || {};
            setFormValues({
                userId: base.userId || currentUser,
                taskTime: base.taskTime || weekDayHeaders[0]?.date,
                startTime: base.startTime || '',
                endTime: base.endTime || '',
                task: base.task || '',
                remark: base.remark || '',
                state: base.state || 'pending',
                yn: base.yn ?? 1,
            });
            setFormErrors({});
        } else {
            setFormValues({});
            setFormErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDrawerVisible, editingTask, weekDayHeaders, currentUser]);

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

    const handleUserChange = (value: number) => setCurrentUser(value);

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
        const {userId, taskTime, startTime, endTime, task, remark, state, yn} = formValues;
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
            userId,
            taskTime,
            startTime,
            endTime,
            task,
            remark,
            state,
            yn
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

    return (
        <div>
            {/* 顶部卡片区域 */}
            <div
                className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg mb-6 transition-colors">
                <Header
                    title="📅 固定任务看板"
                    isPastWeek={isPastWeek}
                    onPrevWeek={goToPreviousWeek}
                    onNextWeek={goToNextWeek}
                    onToday={goToToday}
                    onAdd={handleAdd}
                />
                <Calendar
                    tasks={tasks}
                    currentDate={currentDate}
                    isPastWeek={isPastWeek}
                    onEditTask={handleEdit}
                    onAddTask={(taskTime, startTime, endTime) => {
                        setEditingTask({
                            taskTime,
                            startTime,
                            endTime,
                            state: 'pending'
                        });
                        setIsDrawerVisible(true);
                    }}
                />
            </div>

            {/* 弹窗 */}
            <Modal
                open={isDrawerVisible}
                title={editingTask?.id ? '✏️ 编辑任务' : '➕ 新增任务'}
                onClose={() => setIsDrawerVisible(false)}
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
                    users={userOptions}
                />
            </Modal>

            {/* 简易 Toast */}
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