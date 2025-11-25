/**
 * 任务链工具函数
 */

import {TaskNode, TaskChain, TaskTreeNode, TaskRelation} from '../types/task';

/**
 * 生成唯一ID
 */
export function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成任务链ID
 */
export function generateChainId(): string {
    return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建新任务节点
 */
export function createTaskNode(
    title: string,
    options?: Partial<TaskNode>
): TaskNode {
    const now = new Date().toISOString();
    return {
        id: generateTaskId(),
        title,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        level: 0,
        childIds: [],
        ...options,
    };
}

/**
 * 将任务添加为子任务
 */
export function addSubtask(
    parent: TaskNode,
    subtask: Partial<TaskNode>
): TaskNode {
    const newSubtask = createTaskNode(subtask.title || '', {
        ...subtask,
        parentId: parent.id,
        level: (parent.level || 0) + 1,
        chainId: parent.chainId,
    });

    return newSubtask;
}

/**
 * 构建任务树
 */
export function buildTaskTree(tasks: TaskNode[]): TaskTreeNode[] {
    const taskMap = new Map<string, TaskTreeNode>();
    const rootTasks: TaskTreeNode[] = [];

    // 创建任务映射
    tasks.forEach(task => {
        taskMap.set(task.id, {...task, children: [], expanded: false});
    });

    // 构建树结构
    tasks.forEach(task => {
        const treeNode = taskMap.get(task.id);
        if (!treeNode) return;

        if (!task.parentId) {
            // 根任务
            rootTasks.push(treeNode);
        } else {
            // 子任务
            const parent = taskMap.get(task.parentId);
            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(treeNode);
            }
        }
    });

    return rootTasks;
}

/**
 * 扁平化任务树
 */
export function flattenTaskTree(tree: TaskTreeNode[]): TaskNode[] {
    const result: TaskNode[] = [];

    function traverse(node: TaskTreeNode) {
        const {children, expanded, depth, ...task} = node;
        result.push(task);
        if (children) {
            children.forEach(traverse);
        }
    }

    tree.forEach(traverse);
    return result;
}

/**
 * 获取任务的所有子孙任务
 */
export function getAllDescendants(
    taskId: string,
    tasks: TaskNode[]
): TaskNode[] {
    const descendants: TaskNode[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    function collectDescendants(id: string) {
        const task = taskMap.get(id);
        if (!task || !task.childIds) return;

        task.childIds.forEach(childId => {
            const child = taskMap.get(childId);
            if (child) {
                descendants.push(child);
                collectDescendants(childId);
            }
        });
    }

    collectDescendants(taskId);
    return descendants;
}

/**
 * 获取任务的所有祖先任务
 */
export function getAllAncestors(
    taskId: string,
    tasks: TaskNode[]
): TaskNode[] {
    const ancestors: TaskNode[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    let currentId: string | undefined = taskId;
    while (currentId) {
        const task = taskMap.get(currentId);
        if (!task || !task.parentId) break;

        const parent = taskMap.get(task.parentId);
        if (parent) {
            ancestors.unshift(parent);
            currentId = parent.id;
        } else {
            break;
        }
    }

    return ancestors;
}

/**
 * 检查是否可以删除任务（有子任务时需要确认）
 */
export function canDeleteTask(task: TaskNode): {
    canDelete: boolean;
    reason?: string;
    hasChildren: boolean;
} {
    const hasChildren = task.childIds && task.childIds.length > 0;

    return {
        canDelete: true,
        hasChildren: hasChildren || false,
        reason: hasChildren ? '此任务有子任务，删除将同时删除所有子任务' : undefined,
    };
}

/**
 * 删除任务及其所有子任务
 */
export function deleteTaskWithChildren(
    taskId: string,
    tasks: TaskNode[]
): string[] {
    const deletedIds: string[] = [];
    const descendants = getAllDescendants(taskId, tasks);

    deletedIds.push(taskId);
    descendants.forEach(d => deletedIds.push(d.id));

    return deletedIds;
}

/**
 * 更新任务的父子关系
 */
export function updateTaskRelations(
    tasks: TaskNode[],
    parentId: string,
    childId: string,
    action: 'add' | 'remove'
): TaskNode[] {
    return tasks.map(task => {
        if (task.id === parentId) {
            const childIds = task.childIds || [];
            return {
                ...task,
                childIds: action === 'add'
                    ? [...childIds, childId]
                    : childIds.filter(id => id !== childId),
            };
        }
        if (task.id === childId) {
            return {
                ...task,
                parentId: action === 'add' ? parentId : null,
                level: action === 'add' ? (tasks.find(t => t.id === parentId)?.level || 0) + 1 : 0,
            };
        }
        return task;
    });
}

/**
 * 计算任务链的完成进度
 */
export function calculateChainProgress(tasks: TaskNode[]): {
    total: number;
    completed: number;
    progress: number;
} {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {total, completed, progress};
}

/**
 * 检查任务是否可以开始（依赖任务是否完成）
 */
export function canStartTask(task: TaskNode, allTasks: TaskNode[]): {
    canStart: boolean;
    reason?: string;
    pendingDependencies?: string[];
} {
    if (!task.dependsOn || task.dependsOn.length === 0) {
        return {canStart: true};
    }

    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    const pendingDependencies: string[] = [];

    for (const depId of task.dependsOn) {
        const depTask = taskMap.get(depId);
        if (!depTask || depTask.status !== 'completed') {
            pendingDependencies.push(depId);
        }
    }

    if (pendingDependencies.length > 0) {
        return {
            canStart: false,
            reason: '存在未完成的依赖任务',
            pendingDependencies,
        };
    }

    return {canStart: true};
}

/**
 * 获取任务的层级路径（面包屑）
 */
export function getTaskPath(
    taskId: string,
    tasks: TaskNode[]
): TaskNode[] {
    const ancestors = getAllAncestors(taskId, tasks);
    const task = tasks.find(t => t.id === taskId);

    return task ? [...ancestors, task] : ancestors;
}

/**
 * 验证任务链的完整性
 */
export function validateTaskChain(chain: TaskChain): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const taskIds = new Set(chain.tasks.map(t => t.id));

    // 检查父子关系是否有效
    chain.tasks.forEach(task => {
        if (task.parentId && !taskIds.has(task.parentId)) {
            errors.push(`任务 ${task.id} 的父任务 ${task.parentId} 不存在`);
        }

        if (task.childIds) {
            task.childIds.forEach(childId => {
                if (!taskIds.has(childId)) {
                    errors.push(`任务 ${task.id} 的子任务 ${childId} 不存在`);
                }
            });
        }

        // 检查依赖关系
        if (task.dependsOn) {
            task.dependsOn.forEach(depId => {
                if (!taskIds.has(depId)) {
                    errors.push(`任务 ${task.id} 依赖的任务 ${depId} 不存在`);
                }
            });
        }
    });

    // 检查循环依赖
    const hasCycle = detectCyclicDependency(chain.tasks);
    if (hasCycle) {
        errors.push('检测到循环依赖');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * 检测循环依赖
 */
function detectCyclicDependency(tasks: TaskNode[]): boolean {
    const graph = new Map<string, string[]>();

    // 构建依赖图
    tasks.forEach(task => {
        graph.set(task.id, task.dependsOn || []);
    });

    // DFS检测环
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
        if (!visited.has(nodeId)) {
            visited.add(nodeId);
            recStack.add(nodeId);

            const neighbors = graph.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && hasCycle(neighbor)) {
                    return true;
                }
                if (recStack.has(neighbor)) {
                    return true;
                }
            }
        }

        recStack.delete(nodeId);
        return false;
    }

    for (const taskId of graph.keys()) {
        if (hasCycle(taskId)) {
            return true;
        }
    }

    return false;
}

/**
 * 排序任务（拓扑排序，考虑依赖关系）
 */
export function sortTasksByDependency(tasks: TaskNode[]): TaskNode[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // 初始化
    tasks.forEach(task => {
        graph.set(task.id, task.dependsOn || []);
        inDegree.set(task.id, 0);
    });

    // 计算入度
    tasks.forEach(task => {
        (task.dependsOn || []).forEach(depId => {
            inDegree.set(depId, (inDegree.get(depId) || 0) + 1);
        });
    });

    // 拓扑排序
    const queue: string[] = [];
    const result: TaskNode[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    // 找到所有入度为0的节点
    inDegree.forEach((degree, taskId) => {
        if (degree === 0) {
            queue.push(taskId);
        }
    });

    while (queue.length > 0) {
        const taskId = queue.shift()!;
        const task = taskMap.get(taskId);
        if (task) {
            result.push(task);
        }

        const deps = graph.get(taskId) || [];
        deps.forEach(depId => {
            const degree = inDegree.get(depId) || 0;
            inDegree.set(depId, degree - 1);
            if (degree - 1 === 0) {
                queue.push(depId);
            }
        });
    }

    return result;
}
