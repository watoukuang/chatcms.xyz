"use client";

import React from "react";
import moment from 'moment';
import {addTaskLocal, getTasksLocalAsync, updateTaskLocal} from '@/src/shared/cached';
import {useRouter} from 'next/router';
import {SimpleTask as UiTask, TaskCard} from "@/src/views/home/components/TaskFlow";
import Dialog from '@/src/components/ui/Dialog';
import {useToast} from '@/src/components/Toast';
import Mform from '@/src/views/schedule/components/Mform';
import {generateWeekHeaders} from '@/src/views/schedule/utils/timeUtils';
import {stateOptions, timeOptions} from '@/src/views/schedule/constants';
import storage from '@/src/shared/utils/storage';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
    MarkerType,
    Node,
    NodeTypes,
    Panel,
    Position,
    useEdgesState,
    useNodesState,
} from "reactflow";
import 'reactflow/dist/style.css';

// 内联 TaskFlowBoard 组件逻辑（基于 React Flow）
type FlowProps = {
    tasks: UiTask[];
    groupId?: string;
    height?: number;
    snap?: number;
    onCardClick?: (t: UiTask, index: number) => void; // AI 拆分
    onCardSelect?: (taskId: number | null) => void; // 选中卡片
    onToggleCollapse?: (taskId: number) => void;
    overlayTitle?: string;
    onAddToSchedule?: (task: UiTask) => void;
    onBatchAddToBacklog?: () => void; // 批量加入备选
    onEditTask?: (task: UiTask) => void; // 查看/编辑任务详情
    onDeleteTask?: (taskId: number) => void;
    // 当前聚焦的父任务 id，为 null 表示展示顶层任务
    focusTaskId?: number | null;
    // 当前选中的任务 id
    selectedTaskId?: number | null;
};

const storageKey = (groupId?: string) => `rf_task_positions_${groupId || "default"}`;

const TaskNode: React.FC<{ data: any }> = ({data}) => {
    const t: UiTask = data.task;

    return (
        <>
            {/* 左侧作为目标锚点，右侧作为源锚点，显式指定 id 供边引用；样式设为透明不影响视觉 */}
            <Handle id="in" type="target" position={Position.Left} style={{opacity: 0}}/>
            <Handle id="out" type="source" position={Position.Right} style={{opacity: 0}}/>

            <TaskCard
                t={t}
                onClick={() => data.onSelect?.(t.id ?? null)}
                onSplit={data.onSplit}
                onToggleCollapse={data.onToggleCollapse}
                onAddToSchedule={data.onAddToSchedule}
                onAddToBacklog={data.onAddToBacklog}
                onEdit={data.onEdit}
                onDelete={data.onDelete}
                isSelected={data.isSelected}
            />
        </>
    );
};

const nodeTypes: NodeTypes = {task: TaskNode};

const TaskFlowBoard: React.FC<FlowProps> = ({
                                                tasks,
                                                groupId,
                                                height = 0,
                                                snap = 24,
                                                onCardClick,
                                                onCardSelect,
                                                onToggleCollapse,
                                                overlayTitle,
                                                onAddToSchedule,
                                                onBatchAddToBacklog,
                                                onEditTask,
                                                onDeleteTask,
                                                focusTaskId,
                                                selectedTaskId,
                                            }: FlowProps) => {
    // 动态高度：根据任务数量做简单自适应（最小 360，最大 720）
    const boardHeight = React.useMemo(() => {
        const rows = Math.max(1, Math.ceil(tasks.length / 4));
        const base = 280 + rows * 180;
        const h = Math.max(360, Math.min(base, 720));
        return height && height > 0 ? height : h;
    }, [tasks.length, height]);

    const loadPositions = (): Record<string, { x: number; y: number }> => {
        try {
            const raw = localStorage.getItem(storageKey(groupId));
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    };
    const savePositions = (map: Record<string, { x: number; y: number }>) => {
        try {
            localStorage.setItem(storageKey(groupId), JSON.stringify(map));
        } catch {
        }
    };

    // 视口持久化（平移/缩放）
    const vpKey = (groupId?: string) => `rf_task_viewport_${groupId || "default"}`;
    const loadViewport = () => {
        try {
            const raw = localStorage.getItem(vpKey(groupId));
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };
    const saveViewport = (vp: any) => {
        try {
            localStorage.setItem(vpKey(groupId), JSON.stringify(vp));
        } catch {
        }
    };

    // 暗色模式检测（用于网格颜色自适应）
    const [isDark, setIsDark] = React.useState<boolean>(false);
    React.useEffect(() => {
        const check = () => {
            const byClass = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
            const byMedia = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(Boolean(byClass || byMedia));
        };
        check();
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => check();
            mq.addEventListener?.('change', handler);
            return () => mq.removeEventListener?.('change', handler);
        }
        return;
    }, []);

    // 多行网格布局：根据当前聚焦的父任务决定主任务集合
    const getLayoutedElements = React.useCallback((taskList: UiTask[], toggleCollapseFn?: (id: number) => void) => {
        const NODE_WIDTH = 340;
        const NODE_HEIGHT = 160;
        const COLS = 3; // 每行 3 列
        const H_SPACING = 80; // 横向间距
        const V_SPACING = 100; // 纵向间距
        const CHILD_INDENT = 60; // 子任务缩进
        const CHILD_V_OFFSET = 200; // 子任务纵向偏移

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const taskMap = new Map<number, UiTask>();
        taskList.forEach(t => taskMap.set(t.id!, t));

        // 根据 focusTaskId 分离主线任务：
        // - 未聚焦时：遍历 prev/next 链表来获取主线任务序列
        // - 聚焦某个父任务时：展示该父任务的直接子任务
        let mainTasks: UiTask[];

        if (focusTaskId == null) {
            // 找到主链的头节点：
            // 1. prev 为 undefined（没有前驱节点）
            // 2. visibleOnMainFlow 不为 false（允许在主链显示）
            // 3. 注意：不检查 parentId，因为子任务也可能在主链中
            const headCandidates = taskList.filter(t =>
                !t.prev &&
                t.visibleOnMainFlow !== false
            );

            console.log('🔍 找到的链表头节点：', headCandidates.map(h => ({
                id: h.id,
                task: h.task,
                parentId: h.parentId,
                prev: h.prev,
                next: h.next,
                visibleOnMainFlow: h.visibleOnMainFlow
            })));

            // 从头节点开始，沿着 next 指针遍历整条链
            mainTasks = [];
            const visited = new Set<number>();

            for (const head of headCandidates) {
                let current: UiTask | undefined = head;
                while (current && current.id != null && !visited.has(current.id)) {
                    visited.add(current.id);
                    mainTasks.push(current);

                    // 找到下一个节点
                    if (current.next != null) {
                        current = taskMap.get(current.next);
                    } else {
                        break;
                    }
                }
            }
        } else {
            // 聚焦模式：显示指定父任务的子任务
            mainTasks = taskList.filter(t => t.parentId === focusTaskId);
        }

        console.log('🔍 Layout Debug:', {
            focusTaskId,
            totalTasks: taskList.length,
            mainTasks: mainTasks.length,
            mainTaskIds: mainTasks.map(t => ({
                id: t.id,
                task: t.task,
                level: t.level,
                parentId: t.parentId,
                prev: t.prev,
                next: t.next,
                visibleOnMainFlow: t.visibleOnMainFlow
            })),
        });

        // 如果没有任务可显示，返回空布局（不返回 null，避免 React Flow 报错）
        if (mainTasks.length === 0) {
            console.warn('⚠️ 没有任务可显示');
            return {nodes: [], edges: []};
        }

        let nodeIndex = 0;
        mainTasks.forEach((mainTask, idx) => {
            const row = Math.floor(idx / COLS);
            const col = idx % COLS;
            const x = col * (NODE_WIDTH + H_SPACING);
            const y = row * (NODE_HEIGHT + V_SPACING);

            nodes.push({
                id: String(mainTask.id),
                type: 'task',
                position: {x, y},
                data: {
                    task: mainTask,
                    index: nodeIndex++,
                    onSelect: onCardSelect,
                    onSplit: onCardClick ? () => onCardClick(mainTask, idx) : undefined,
                    onToggleCollapse: () => toggleCollapseFn?.(mainTask.id!),
                    onAddToSchedule: onAddToSchedule ? () => onAddToSchedule(mainTask) : undefined,
                    onEdit: onEditTask ? () => onEditTask(mainTask) : undefined,
                    onDelete: onDeleteTask ? () => onDeleteTask(mainTask.id!) : undefined,
                    isSelected: selectedTaskId === mainTask.id,
                },
            });

            // 主线任务之间的箭头
            // 优先使用任务的 next 字段，其次按照数组顺序
            const nextTaskId = mainTask.next ?? (idx < mainTasks.length - 1 ? mainTasks[idx + 1].id : undefined);
            if (nextTaskId != null && taskMap.get(nextTaskId)) {
                const edge = {
                    id: `main-${mainTask.id}-${nextTaskId}`,
                    source: String(mainTask.id),
                    target: String(nextTaskId),
                    sourceHandle: 'out',
                    targetHandle: 'in',
                    type: 'smoothstep',
                    animated: false,
                    style: {stroke: '#10b981', strokeWidth: 2},
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#10b981',
                        width: 18,
                        height: 18,
                    },
                } as Edge;
                edges.push(edge);
                console.log('➡️ Creating edge:', edge);
            }

            // 处理子任务（仅在聚焦模式下展开子任务树）
            if (focusTaskId != null && mainTask.children && mainTask.children.length > 0 && !mainTask.collapsed) {
                const children = mainTask.children.map(cid => taskMap.get(cid)).filter(Boolean) as UiTask[];
                children.forEach((child, cidx) => {
                    const childX = x + CHILD_INDENT;
                    const childY = y + CHILD_V_OFFSET + cidx * (NODE_HEIGHT + 60);

                    nodes.push({
                        id: String(child.id),
                        type: 'task',
                        position: {x: childX, y: childY},
                        data: {
                            task: child,
                            index: nodeIndex++,
                            onDoubleClick: onCardClick,
                            onToggleCollapse: () => toggleCollapseFn?.(child.id!),
                        },
                    });

                    // 父到子的箭头（第一个子任务）
                    if (cidx === 0) {
                        const parentEdge: Edge = {
                            id: `parent-${mainTask.id}-child-${child.id}`,
                            source: String(mainTask.id),
                            target: String(child.id),
                            sourceHandle: 'out',
                            targetHandle: 'in',
                            type: 'smoothstep',
                            animated: false,
                            style: {stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5,5'},
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#94a3b8',
                                width: 14,
                                height: 14,
                            },
                        };
                        edges.push(parentEdge);
                    }

                    // 子任务之间的箭头
                    if (cidx < children.length - 1) {
                        const childEdge: Edge = {
                            id: `child-${child.id}-${children[cidx + 1].id}`,
                            source: String(child.id),
                            target: String(children[cidx + 1].id),
                            sourceHandle: 'out',
                            targetHandle: 'in',
                            type: 'smoothstep',
                            animated: false,
                            style: {stroke: '#94a3b8', strokeWidth: 1.5},
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#94a3b8',
                                width: 12,
                                height: 12,
                            },
                        };
                        edges.push(childEdge);
                    }
                });
            }
        });

        console.log('📊 Final Layout Result:', {
            nodesCount: nodes.length,
            edgesCount: edges.length,
            nodeIds: nodes.map(n => n.id),
            edges: edges.map(e => ({id: e.id, source: e.source, target: e.target})),
        });

        return {nodes, edges};
    }, [onCardClick, focusTaskId]);

    const {nodes: layoutedNodes, edges: layoutedEdges} = React.useMemo(() => {
        return getLayoutedElements(tasks, onToggleCollapse);
    }, [tasks, onToggleCollapse, getLayoutedElements]);

    // 使用空数组初始化，避免初始渲染时的竞态条件
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 当任务列表变化时同步更新节点和边
    React.useEffect(() => {
        console.log('🔄 Updating React Flow:', {
            nodesCount: layoutedNodes.length,
            edgesCount: layoutedEdges.length,
            nodeIds: layoutedNodes.map(n => n.id),
        });

        // 关键：先清空边，再设置新节点，最后设置新边
        // 这样可以避免边引用不存在的节点
        setEdges([]);
        setNodes(layoutedNodes);
        // 使用 requestAnimationFrame 确保节点已经渲染
        requestAnimationFrame(() => {
            setEdges(layoutedEdges);
        });
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    const onNodeDragStop = (_evt: any, node: Node) => {
        // 使用自动布局时，可以选择保存用户手动调整的位置
        const map = Object.fromEntries(nodes.map(n => [n.id, n.position]));
        map[node.id] = node.position;
        savePositions(map);
    };

    const defaultViewport = React.useMemo(() => {
        return loadViewport() || {x: 0, y: 0, zoom: 1}; // React Flow 会基于此初始化
    }, []);

    return (
        <div className="border rounded relative overflow-hidden bg-gray-50 dark:bg-gray-900 h-full w-full">
            {/* 空状态提示 */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center p-8 max-w-md">
                        <div className="text-6xl mb-4">📋</div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            暂无任务显示
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {focusTaskId != null
                                ? '该任务下没有子任务，请点击右侧树的"顶层视图"查看所有任务'
                                : '请先在左侧输入任务描述，生成 TODO 列表'
                            }
                        </div>
                    </div>
                </div>
            )}
            {/* React Flow 调试信息 */}
            {/*<div*/}
            {/*    className="absolute top-20 left-2 z-[100] bg-blue-100 dark:bg-blue-900/50 text-xs p-2 rounded border border-blue-300 dark:border-blue-700 shadow-lg">*/}
            {/*    <div className="font-bold mb-1">🎨 React Flow 状态</div>*/}
            {/*    <div>nodes.length: {nodes.length}</div>*/}
            {/*    <div>edges.length: {edges.length}</div>*/}
            {/*    <div>boardHeight: {boardHeight}px</div>*/}
            {/*    <div>layoutedNodes: {layoutedNodes.length}</div>*/}
            {/*    {nodes.slice(0, 2).map((n, i) => (*/}
            {/*        <div key={i} className="text-[10px] mt-1 border-t border-blue-300 pt-1">*/}
            {/*            node #{n.id} @ ({n.position.x.toFixed(0)}, {n.position.y.toFixed(0)})*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                snapToGrid
                snapGrid={[snap, snap]}
                defaultViewport={defaultViewport}
                minZoom={0.5}
                maxZoom={1.8}
                fitView
                fitViewOptions={{padding: 0.2}}
                onMoveEnd={(_evt: any, vp: any) => saveViewport(vp)}
            >
                <Background gap={snap} size={1} color={isDark ? "#4ade8022" : "#a3e63522"}/>
                <Controls/>
                {onBatchAddToBacklog && (
                    <Panel position="top-right">
                        <button
                            type="button"
                            onClick={onBatchAddToBacklog}
                            className="px-3 py-1.5 text-sm rounded-md border border-amber-300 dark:border-amber-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors shadow-sm"
                        >
                            ⭐ 加入备选
                        </button>
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
};

type Props = {
    // 一维任务数组：包含父任务与其后插入的子任务
    tasks: UiTask[];
    onTaskClick: (t: UiTask, index: number) => void; // AI 拆分
    onCardSelect?: (taskId: number | null) => void; // 选中卡片
    onToggleCollapse?: (taskId: number) => void;
    onReset?: () => void;
    groupTitle?: string;
    groupId?: string;
    focusTaskId?: number | null;
    selectedTaskId?: number | null;
    onDeleteTask?: (taskId: number) => void;
};

export default function TaskContext({
                                        tasks,
                                        onTaskClick,
                                        onCardSelect,
                                        onToggleCollapse,
                                        onReset,
                                        groupTitle,
                                        groupId,
                                        focusTaskId,
                                        selectedTaskId,
                                        onDeleteTask,
                                    }: Props): React.ReactElement {
    if (!tasks || tasks.length === 0) return <></>;
    const router = useRouter();
    const toast = useToast();

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [conflictOpen, setConflictOpen] = React.useState(false);
    const [conflictDetails, setConflictDetails] = React.useState<string[]>([]);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Partial<UiTask> | null>(null);
    const [formValues, setFormValues] = React.useState<{ [k: string]: any }>({});
    const [formErrors, setFormErrors] = React.useState<{ [k: string]: string }>({});
    const weekDayHeaders = React.useMemo(() => generateWeekHeaders(moment()), []);

    const timeToMinutes = (hhmm?: string): number => {
        const [h, m] = (hhmm || '00:00').split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };

    // 检查与现有固定日程是否冲突（同一天且时间段重叠）
    const hasConflicts = async (newTasks: UiTask[]): Promise<{ conflict: boolean; details: string[] }> => {
        const dates = newTasks
            .map(t => t.taskTime || moment().format('YYYY-MM-DD'))
            .filter(Boolean);
        const startDate = dates.length ? moment.min(dates.map(d => moment(d, 'YYYY-MM-DD'))).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        const endDate = dates.length ? moment.max(dates.map(d => moment(d, 'YYYY-MM-DD'))).format('YYYY-MM-DD') : startDate;

        const existing = await getTasksLocalAsync({startDate, endDate});
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

        return {conflict: details.length > 0, details};
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
        requiredChecks.forEach(([ok, key, msg]) => {
            if (!ok) errs[key] = msg;
        });
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
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            return;
        }
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
                ? updateTaskLocal({...(data as any), id: editingTask.id as number} as any)
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

    // 单个任务加入日程
    const handleAddToSchedule = async (task: UiTask) => {
        try {
            // 检测单个任务冲突
            const {conflict, details} = await hasConflicts([task]);
            if (conflict) {
                setConflictDetails(details);
                setConflictOpen(true);
                return;
            }

            // 直接添加
            addTaskLocal({
                taskTime: task.taskTime || moment().format('YYYY-MM-DD'),
                startTime: task.startTime || '00:00',
                endTime: task.endTime || '01:00',
                task: task.task || '',
                remark: task.remark || '',
                state: task.state || 'pending'
            });
            toast.success(`已添加「${task.task}」到固定日程`);
        } catch (e) {
            console.error('添加到固定日程失败：', e);
            toast.error('添加到固定日程失败，请稍后重试');
        }
    };

    const addAllToSchedule = async () => {
        try {
            // 先做冲突检测
            const {conflict, details} = await hasConflicts(tasks);
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
            void router.push('/schedule');
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
        <div className="w-full h-full flex-1 p-2.5 animate-fadeIn flex flex-col">
            <div className="flex-1 min-h-0">
                <TaskFlowBoard
                    tasks={tasks}
                    groupId={groupId}
                    onCardClick={onTaskClick}
                    onCardSelect={onCardSelect}
                    onToggleCollapse={onToggleCollapse}
                    overlayTitle={`AI 规划了 ${tasks.length} 个任务`}
                    onAddToSchedule={(task) => handleAddToSchedule(task)}
                    onBatchAddToBacklog={addAllToBacklog}
                    onEditTask={(task) => {
                        setEditingTask(task);
                        setFormValues({
                            taskTime: task.taskTime || moment().format('YYYY-MM-DD'),
                            startTime: task.startTime || '09:00',
                            endTime: task.endTime || '10:00',
                            task: task.task || '',
                            remark: task.remark || '',
                            state: task.state || 'pending',
                        });
                        setEditOpen(true);
                    }}
                    onDeleteTask={onDeleteTask}
                    focusTaskId={focusTaskId ?? null}
                    selectedTaskId={selectedTaskId ?? null}
                />
            </div>

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