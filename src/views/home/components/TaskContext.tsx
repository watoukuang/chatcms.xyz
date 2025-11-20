"use client";

import React from "react";
import moment from 'moment';
import {addTaskLocal, getTasksLocalAsync, updateTaskLocal} from '@/src/shared/cached';
import { useRouter } from 'next/router';
import TaskFlow, {SimpleTask as UiTask} from "@/src/views/home/components/TaskFlow";
import Dialog from '@/src/components/ui/Dialog';
import {useToast} from '@/src/components/Toast';
import Mform from '@/src/views/schedule/components/Mform';
import {generateWeekHeaders} from '@/src/views/schedule/utils/timeUtils';
import {stateOptions, timeOptions} from '@/src/views/schedule/constants';
import storage from '@/src/shared/utils/storage';

type Props = {
    // 一维任务数组：包含父任务与其后插入的子任务
    tasks: UiTask[];
    onTaskClick: (t: UiTask, index: number) => void;
    onReset?: () => void;
    groupTitle?: string;
    groupId?: string;
};

export default function TaskContext({tasks, onTaskClick, onReset, groupTitle, groupId}: Props): React.ReactElement {
    if (!tasks || tasks.length === 0) return <></>;
    const router = useRouter();
    const toast = useToast();

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [conflictOpen, setConflictOpen] = React.useState(false);
    const [conflictDetails, setConflictDetails] = React.useState<string[]>([]);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Partial<UiTask> | null>(null);
    const [formValues, setFormValues] = React.useState<{[k: string]: any}>({});
    const [formErrors, setFormErrors] = React.useState<{[k: string]: string}>({});
    const weekDayHeaders = React.useMemo(() => generateWeekHeaders(moment()), []);

    const timeToMinutes = (hhmm?: string): number => {
        const [h, m] = (hhmm || '00:00').split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };

    // 检查与现有固定日程是否冲突（同一天且时间段重叠）
    const hasConflicts = async (newTasks: UiTask[]): Promise<{conflict: boolean; details: string[]}> => {
        const dates = newTasks
            .map(t => t.taskTime || moment().format('YYYY-MM-DD'))
            .filter(Boolean);
        const startDate = dates.length ? moment.min(dates.map(d => moment(d, 'YYYY-MM-DD'))).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        const endDate = dates.length ? moment.max(dates.map(d => moment(d, 'YYYY-MM-DD'))).format('YYYY-MM-DD') : startDate;

        const existing = await getTasksLocalAsync({ startDate, endDate });
        const details: string[] = [];

        for (const nt of newTasks) {
            const date = nt.taskTime || moment().format('YYYY-MM-DD');
            const ns = timeToMinutes(nt.startTime || '00:00');
            const ne = timeToMinutes(nt.endTime || '01:00');
            const sameDay = existing.filter(et => et.taskTime === date);
            for (const et of sameDay) {
                const es = timeToMinutes(et.startTime ?? '00:00');
                const ee = timeToMinutes(et.endTime ?? '01:00');
                const overlap = ns < ee && ne > es;
                if (overlap) {
                    details.push(`${date} ${nt.startTime || '00:00'}-${nt.endTime || '01:00'} 与已排 ${et.startTime ?? '00:00'}-${et.endTime ?? '01:00'} 冲突`);
                    break; // 一个任务有冲突即可标记
                }
            }
        }

        return { conflict: details.length > 0, details };
    };

    // 点击卡片：打开编辑弹窗
    const handleTaskClick = (task: UiTask, index: number) => {
        setEditingTask(task);
        setFormValues({
            taskTime: task.taskTime || weekDayHeaders[0]?.date,
            startTime: task.startTime || '',
            endTime: task.endTime || '',
            task: task.task || '',
            remark: task.remark || '',
            state: task.state || 'pending',
        });
        setFormErrors({});
        setEditOpen(true);
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
        requiredChecks.forEach(([ok, key, msg]) => { if (!ok) errs[key] = msg; });
        if (values?.startTime && values?.endTime && !(values.startTime < values.endTime)) {
            errs.endTime = '结束时间必须晚于开始时间';
        }
        return errs;
    };

    const onFormChange = (field: string, value: any) => {
        setFormValues(prev => ({...prev, [field]: value}));
        setFormErrors(prev => ({...prev, [field]: ''}));
    };

    const handleEditOk = () => {
        const errs = validate(formValues);
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        const data = {
            taskTime: formValues.taskTime,
            startTime: formValues.startTime,
            endTime: formValues.endTime,
            task: formValues.task,
            remark: formValues.remark,
            state: formValues.state,
        };
        try {
            const saved = editingTask?.id
                ? updateTaskLocal({ ...(data as any), id: editingTask.id as number } as any)
                : addTaskLocal(data as any);
            toast.success(editingTask?.id ? '任务更新成功' : '任务添加成功');
            setEditOpen(false);
            setEditingTask(null);
            router.push('/schedule');
        } catch (error) {
            console.error('保存失败:', error);
            toast.error(editingTask?.id ? '更新失败' : '添加失败');
        }
    };

    const addAllToSchedule = async () => {
        try {
            // 先做冲突检测
            const { conflict, details } = await hasConflicts(tasks);
            if (conflict) {
                setConflictDetails(details);
                setConflictOpen(true);
                return;
            }

            // 打开确认弹窗
            setConfirmOpen(true);
        } catch (e) {
            console.error('添加到固定日程失败：', e);
            toast.error('添加到固定日程失败，请稍后重试');
        }
    };

    const confirmAdd = () => {
        try {
            tasks.forEach(t => {
                addTaskLocal({
                    taskTime: t.taskTime || moment().format('YYYY-MM-DD'),
                    startTime: t.startTime || '00:00',
                    endTime: t.endTime || '01:00',
                    task: t.task || '',
                    remark: t.remark || '',
                    state: t.state || 'pending'
                });
            });
            setConfirmOpen(false);
            toast.success(`已添加 ${tasks.length} 条到固定日程`);
            router.push('/schedule');
        } catch (e) {
            console.error('确认添加失败：', e);
            toast.error('确认添加失败，请稍后重试');
        }
    };

    // 批量加入“灵活备选”（backlog）
    const addAllToBacklog = () => {
        try {
            const existing = storage.get<any[]>('backlog_tasks', []) || [];
            const nowISO = new Date().toISOString();
            const batchId = groupId || `grp_${Date.now()}`;
            const batchTitle = groupTitle || `AI规划批次 ${moment().format('YYYY-MM-DD HH:mm')}`;
            const toMinutes = (s?: string) => {
                if (!s || !/^\d{2}:\d{2}$/.test(s)) return undefined;
                const [h, m] = s.split(':').map(Number);
                return h * 60 + m;
            };
            const newBacklogs = tasks.map((t, i) => {
                const startM = toMinutes(t.startTime);
                const endM = toMinutes(t.endTime);
                const est = startM != null && endM != null && endM > startM ? (endM - startM) : undefined;
                return {
                    id: Date.now() + i,
                    task: t.task || '',
                    remark: t.remark || '',
                    estimatedMinutes: est,
                    tags: [],
                    state: 'pending',
                    startTime: '',
                    endTime: '',
                    createdAt: nowISO,
                    groupId: batchId,
                    groupTitle: batchTitle,
                    origin: 'batch',
                } as any;
            });
            storage.set('backlog_tasks', [...existing, ...newBacklogs]);
            toast.success(`已加入备选 ${newBacklogs.length} 条`);
            router.push('/planner');
        } catch (e) {
            console.error('加入备选失败：', e);
            toast.error('加入备选失败，请稍后重试');
        }
    };
    return (
        <div
            className="w-full flex-1 p-2.5 animate-fadeIn flex flex-col rounded border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 shadow-xl mt-3">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {`AI 规划了 ${tasks.length} 个任务`}
                                </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={addAllToSchedule}
                        className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        添加进日程
                    </button>
                    <button
                        type="button"
                        onClick={addAllToBacklog}
                        className="px-2 py-1 text-xs rounded-md border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                        加入备选
                    </button>
                </div>
            </div>

            {/* 任务流：≤3 单行展示带箭头；>3 自动换行且隐藏箭头避免错位 */}
            <div className="w-full pb-4">
                {tasks.length <= 3 ? (
                    <div className="flex items-stretch gap-5 py-2">
                        {tasks.map((t, i) => (
                            <TaskFlow
                                key={(t.id ?? i).toString() + '-' + (t.task || '')}
                                task={t}
                                index={i}
                                total={tasks.length}
                                onCardClick={(task: UiTask) => handleTaskClick(task, i)}
                                onTaskClick={(task: UiTask) => onTaskClick(task, i)}
                                showArrow={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-stretch gap-5 py-2">
                        {tasks.map((t, i) => (
                            <div
                                key={(t.id ?? i).toString() + '-' + (t.task || '')}
                                className="basis-full sm:basis-1/2 md:basis-1/3 flex"
                            >
                                <TaskFlow
                                    task={t}
                                    index={i}
                                    total={tasks.length}
                                    onCardClick={(task: UiTask) => handleTaskClick(task, i)}
                                    onTaskClick={(task: UiTask) => onTaskClick(task, i)}
                                    showArrow={false}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div
                className="mt-auto pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💡 提示：任务会按时间顺序执行</span>
                <span>总计 {tasks.length} 个步骤</span>
            </div>

        {/* 冲突弹窗 */}
        <Dialog
            open={conflictOpen}
            title={'日程冲突'}
            description={'以下时间段与已有日程重叠，无法加入'}
            icon={<span className="text-red-500">⚠️</span>}
            accent={'red'}
            onClose={() => setConflictOpen(false)}
            cancelText={'关闭'}
          >
            <ul className="list-disc pl-5 space-y-1">
              {conflictDetails.slice(0, 8).map((d, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-200">{d}</li>
              ))}
            </ul>
            {conflictDetails.length > 8 && (
              <p className="mt-2 text-xs text-gray-500">… 共 {conflictDetails.length} 条冲突</p>
            )}
        </Dialog>

        {/* 确认弹窗 */}
        <Dialog
            open={confirmOpen}
            title={'添加到固定日程'}
            description={`确定将这 ${tasks.length} 条任务添加到固定日程吗？`}
            icon={<span className="text-blue-600">🗓️</span>}
            accent={'blue'}
            onClose={() => setConfirmOpen(false)}
            onOk={confirmAdd}
            okText={'✓ 确认添加'}
            cancelText={'取消'}
            maxWidth={560}
        />

        {/* 编辑弹窗 */}
        <Dialog
            open={editOpen}
            title={editingTask?.id ? '✏️ 编辑任务' : '➕ 新增任务'}
            description={'调整任务内容并保存到固定日程'}
            icon={<span className="text-blue-600">📝</span>}
            accent={'blue'}
            onClose={() => setEditOpen(false)}
            onOk={handleEditOk}
            okText={'✓ 保存到固定日程'}
            cancelText={'取消'}
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
        </Dialog>
        </div>
    );
}