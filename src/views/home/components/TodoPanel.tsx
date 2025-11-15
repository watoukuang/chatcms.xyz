import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Card, Drawer, Form, message, Space, Spin, Table} from 'antd';
import HForm from './HForm';
import TCard from './TCard';
import moment from 'moment';
import {addTaskAPI, getTasksAPI, updateTaskAPI} from '@/api/gcode/scrum';
import storage from '@/src/shared/utils/storage';
import {Task, User} from '@/types/app/scrum';
import {listEmployeesAPI} from "@/api/sytem/user";

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
const getTasksLocal = (params: { userId?: number; startDate?: string; endDate?: string }): Task[] => {
    const {userId, startDate, endDate} = params;
    const all = loadAllTasks();
    return all.filter((t) => {
        if (userId !== undefined && t.userId !== userId) return false;
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
        userId: partial.userId ?? 0,
        taskTime: partial.taskTime ?? moment().format('YYYY-MM-DD'),
        startTime: partial.startTime ?? '00:00',
        endTime: partial.endTime ?? '01:00',
        task: partial.task ?? '',
        remark: partial.remark ?? '',
        state: partial.state ?? 'pending',
        yn: partial.yn ?? 1,
        createdAt: partial.createdAt ?? moment().toISOString(),
        updatedAt: moment().toISOString(),
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
        ...updated,
        updatedAt: moment().toISOString(),
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
    const [currentUser, setCurrentUser] = useState<number | undefined>(undefined);
    const [userOptions, setUserOptions] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [currentDate, setCurrentDate] = useState(moment());
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

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

    const fetchUsers = useCallback(async () => {
        const res = await listEmployeesAPI();
        const users = res.data || [];
        setUserOptions(users);
    }, []);

    const fetchTasksForCurrentUser = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        const startDate = currentDate.clone().startOf('isoWeek').format('YYYY-MM-DD');
        const endDate = currentDate.clone().endOf('isoWeek').format('YYYY-MM-DD');
        try {
            const list = getTasksLocal({userId: currentUser, startDate, endDate});
            setTasks(list);
        } catch (error) {
            message.error('获取任务失败');
        } finally {
            setLoading(false);
        }
    }, [currentUser, currentDate]);

    useEffect(() => {
        fetchUsers().then(error => console.error(error));
    }, [fetchUsers]);

    useEffect(() => {
        fetchTasksForCurrentUser().then(error => console.error(error));
    }, [fetchTasksForCurrentUser]);

    useEffect(() => {
        if (isDrawerVisible && editingTask) {
            form.setFieldsValue({
                ...editingTask,
                userId: editingTask.userId || currentUser,
                taskTime: editingTask.taskTime || weekDayHeaders[0].date,
                startTime: editingTask.startTime,
                endTime: editingTask.endTime,
                task: editingTask.task,
                remark: editingTask.remark || '',
                state: editingTask.state || 'pending'
            });
        } else {
            form.resetFields();
        }
    }, [isDrawerVisible, editingTask, form, weekDayHeaders, currentUser]);

    const goToPreviousWeek = () => setCurrentDate(currentDate.clone().subtract(1, 'week'));
    const goToNextWeek = () => setCurrentDate(currentDate.clone().add(1, 'week'));
    const goToToday = () => setCurrentDate(moment());

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
        form.validateFields().then(async (values) => {
            const {userId, taskTime, startTime, endTime, task, remark, state, yn} = values;

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
                    message.success('任务更新成功 (本地缓存)');
                } else {
                    const createdItem = addTaskLocal(taskData);
                    setTasks((prev) => [...prev, createdItem]);
                    message.success('任务添加成功 (本地缓存)');
                }
                setIsDrawerVisible(false);
                setEditingTask(null);
                form.resetFields();
            } catch (error) {
                message.error(editingTask?.id ? '更新失败' : '添加失败');
            }
        });
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

    const columns = [
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 150,
            fixed: true,
            render: (time: string) => time
        },
        ...weekDayHeaders.map(weekDay => ({
            title: weekDay.title,
            dataIndex: weekDay.date,
            key: weekDay.date,
            width: 180,
            onCell: (record: any) => {
                const time = record.time;
                const date = weekDay.date;
                const cellStartTime = time.split('-')[0];
                const task = tasks.find(t =>
                    t.taskTime === date &&
                    t.startTime && t.startTime <= cellStartTime &&
                    t.endTime && t.endTime > cellStartTime
                );
                if (task) {
                    if (task.startTime === cellStartTime) {
                        const rowHours = moment(task.endTime, 'HH:mm').diff(moment(task.startTime, 'HH:mm'), 'hours');
                        if (rowHours > 0) {
                            return {
                                rowSpan: rowHours,
                                style: {
                                    padding: 0,
                                    position: 'relative' as const,
                                    height: `${80 * rowHours}px`,
                                    overflow: 'visible'
                                }
                            };
                        }
                    } else {
                        return {rowSpan: 0};
                    }
                }
                return {};
            },
            render: (_: any, record: any) => {
                return getTaskForCell(record.time, weekDay.date);
            }
        }))
    ];

    const data = timeTableSlots.map((time, index) => ({
        key: index,
        time: time
    }));

    return (
        <div>
            <Card
                title="任务进程"
                extra={
                    <Space>
                        <Button onClick={goToPreviousWeek}>上一周</Button>
                        <Button onClick={goToNextWeek}>下一周</Button>
                        <Button onClick={goToToday}>回到今天</Button>
                        <Button type="primary" onClick={handleAdd} disabled={isPastWeek}>新增</Button>
                    </Space>
                }
            >
                <Spin spinning={loading}>
                    <Table columns={columns} dataSource={data} pagination={false} bordered/>
                </Spin>
            </Card>
            <Drawer
                title={editingTask?.id ? '编辑任务' : '新增任务'}
                width={800}
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                footer={
                    <div style={{textAlign: 'right'}}>
                        <Button onClick={() => setIsDrawerVisible(false)} style={{marginRight: 8}}>
                            取消
                        </Button>
                        <Button onClick={handleOk} type="primary">
                            提交
                        </Button>
                    </div>
                }
            >
                <HForm
                    form={form}
                    weekDayHeaders={weekDayHeaders}
                    timeOptions={timeOptions}
                    stateOptions={stateOptions}
                    users={userOptions}
                />
            </Drawer>
        </div>
    );
};

export default TodoPanel;