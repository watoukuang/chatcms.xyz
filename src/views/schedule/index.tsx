import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Mform from './components/Mform';
import moment from 'moment';
import {Task} from '@/types/app/scrum';
import Modal from './components/Modal';
import Header from './components/Header';
import {generateWeekHeaders} from './utils/timeUtils';
import {addTaskLocal, getTasksLocalAsync, initMigration, loadAllTasksSync, updateTaskLocal} from '@/src/shared/cached';
import storage from '@/src/shared/utils/storage';
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
    // 任务弹窗锁定与上架相关状态（统一在一个弹窗内）
    const [locked, setLocked] = useState<boolean>(true);
    const [publishEnabled, setPublishEnabled] = useState<boolean>(false);
    const [marketValues, setMarketValues] = useState<{ [k: string]: any }>({});
    const [marketErrors, setMarketErrors] = useState<{ [k: string]: string }>({});

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
        setLocked(false); // 新增任务默认可编辑
        setPublishEnabled(false);
        setMarketValues({});
        setMarketErrors({});
        setVisible(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setLocked(true); // 默认查看模式
        setPublishEnabled(false); // 默认不上架
        // 初始化上架字段（可在解锁后编辑）
        setMarketValues({
            title: task.task || '未命名任务',
            description: task.remark || `${moment(task.taskTime, 'YYYY-MM-DD').format('M月D日')} 任务`,
            price: '',
            contact: '',
            category: 'personal',
            tags: '',
            estimatedMinutes: minutesBetween(task.startTime || '00:00', task.endTime || '00:30'),
            priority: (task.state === 'completed' ? 'low' : task.state === 'pending' ? 'medium' : 'high'),
        });
        setMarketErrors({});
        setVisible(true);
    };

    // 计算时长（分钟）
    const minutesBetween = (start: string, end: string): number => {
        const s = moment(start || '00:00', 'HH:mm');
        const e = moment(end || '00:30', 'HH:mm');
        const diff = e.diff(s, 'minutes');
        return Number.isFinite(diff) && diff > 0 ? diff : 30;
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
            // 若开启上架则保存到市场模板
            try {
                publishIfEnabled();
                setToast(updated
                    ? (publishEnabled ? '任务更新成功，且已上架到市场' : '任务更新成功 (本地缓存)')
                    : (publishEnabled ? '任务添加成功，且已上架到市场' : '任务添加成功 (本地缓存)'));
            } catch (e) {
                console.warn('上架失败:', e);
                setToast(updated ? '任务更新成功，但上架信息未通过校验' : '任务添加成功，但上架信息未通过校验');
                return; // 保持弹窗不关闭，用户可修复上架信息
            }
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

    const onMarketFormChange = (field: string, value: any) => {
        setMarketValues((prev) => ({...prev, [field]: value}));
        setMarketErrors((prev) => ({...prev, [field]: ''}));
    };

    const [showStats, setShowStats] = useState(false);
    const allTasks = useMemo(() => loadAllTasksSync(), [tasks]);


    // 校验并保存上架信息
    const validateMarket = (values: any): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!values?.title || String(values.title).trim() === '') errs.title = '请输入标题';
        if (values?.price && Number(values.price) < 0) errs.price = '价格不能为负数';
        if (values?.contact && String(values.contact).trim().length < 3) errs.contact = '联系方式过短';
        return errs;
    };

    // 提交任务时，若开启上架则一起校验并保存到市场模板
    const publishIfEnabled = () => {
        if (!publishEnabled) return;
        const errs = validateMarket(marketValues);
        if (Object.keys(errs).length) {
            setMarketErrors(errs);
            throw new Error('上架信息校验失败');
        }
        const BACKUP_KEY = 'market_custom_templates';
        const list = storage.get<any[]>(BACKUP_KEY, []) || [];
        const item = {
            id: Date.now(),
            title: marketValues.title,
            description: marketValues.description || '',
            category: marketValues.category || 'personal',
            estimatedMinutes: Number(marketValues.estimatedMinutes || 30),
            priority: marketValues.priority || 'medium',
            tags: String(marketValues.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
            icon: '🎯',
            usageCount: 1,
            price: marketValues.price ? Number(marketValues.price) : undefined,
            contact: marketValues.contact ? String(marketValues.contact).trim() : undefined,
        };
        storage.set(BACKUP_KEY, [...list, item]);
    };


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

            {/* 弹窗：查看/编辑 + 上架信息 */}
            <Modal
                open={visible}
                title={locked ? '🔒 查看任务' : (editingTask?.id ? '✏️ 编辑任务' : '➕ 新增任务')}
                onClose={() => setVisible(false)}
                onOk={locked ? undefined : handleOk}
                okText="✓ 提交"
                cancelText="取消"
                maxWidth={800}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">{locked ? '当前为只读模式，点击解锁进行编辑' : '已解锁，可编辑任务与上架信息'}</div>
                    <button
                        className={`px-3 py-1.5 rounded-md text-sm ${locked ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
                        onClick={() => setLocked(!locked)}
                    >
                        {locked ? '🔓 解锁编辑' : '🔒 锁定查看'}
                    </button>
                </div>
                <Mform
                    values={formValues}
                    errors={formErrors}
                    onChange={onFormChange as any}
                    weekDayHeaders={weekDayHeaders}
                    timeOptions={timeOptions}
                    stateOptions={stateOptions}
                    disabled={locked}
                />
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={publishEnabled}
                            onChange={(e) => setPublishEnabled(e.target.checked)}
                            disabled={locked}
                            id="publish-toggle"
                        />
                        <label htmlFor="publish-toggle" className="text-sm text-gray-800">上架任务</label>
                        <span className="text-xs text-gray-500">默认不上架；开启后需填写上架信息</span>
                    </div>
                    {publishEnabled && (
                        <div className={`${locked ? 'opacity-60 pointer-events-none' : ''} space-y-4 border rounded-md p-4 bg-gray-50`}>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">标题</label>
                                <input
                                    value={marketValues.title || ''}
                                    onChange={(e) => onMarketFormChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                />
                                {marketErrors.title && (<p className="text-red-500 text-xs mt-1">{marketErrors.title}</p>)}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">描述</label>
                                <textarea
                                    value={marketValues.description || ''}
                                    onChange={(e) => onMarketFormChange('description', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">价格（可选）</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={marketValues.price || ''}
                                        onChange={(e) => onMarketFormChange('price', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                        placeholder="例如 9.9"
                                    />
                                    {marketErrors.price && (<p className="text-red-500 text-xs mt-1">{marketErrors.price}</p>)}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">联系方式（可选）</label>
                                    <input
                                        value={marketValues.contact || ''}
                                        onChange={(e) => onMarketFormChange('contact', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                        placeholder="微信/邮箱/手机号"
                                    />
                                    {marketErrors.contact && (<p className="text-red-500 text-xs mt-1">{marketErrors.contact}</p>)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">分类</label>
                                    <select
                                        value={marketValues.category || 'personal'}
                                        onChange={(e) => onMarketFormChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                    >
                                        <option value="work">工作</option>
                                        <option value="study">学习</option>
                                        <option value="health">健康</option>
                                        <option value="social">社交</option>
                                        <option value="personal">个人</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">标签（逗号分隔）</label>
                                    <input
                                        value={marketValues.tags || ''}
                                        onChange={(e) => onMarketFormChange('tags', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                        placeholder="如：英语,晨练"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">预估时长（分钟）</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={marketValues.estimatedMinutes || 30}
                                        onChange={(e) => onMarketFormChange('estimatedMinutes', Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">优先级</label>
                                    <select
                                        value={marketValues.priority || 'medium'}
                                        onChange={(e) => onMarketFormChange('priority', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900"
                                    >
                                        <option value="high">高</option>
                                        <option value="medium">中</option>
                                        <option value="low">低</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/*（已移除）独立上架弹窗，改为统一在任务弹窗中配置*/}

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