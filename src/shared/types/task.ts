/**
 * 任务类型定义 - 支持父子任务关联
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

/**
 * 基础任务接口
 */
export interface BaseTask {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * 时间相关任务（用于日程）
 */
export interface ScheduledTask extends BaseTask {
    taskTime: string;      // 任务日期 YYYY-MM-DD
    startTime: string;     // 开始时间 HH:mm
    endTime: string;       // 结束时间 HH:mm
    duration?: number;     // 持续时间（分钟）
}

/**
 * 任务链节点 - 支持父子关系
 */
export interface TaskNode extends BaseTask {
    // 父子关系
    parentId?: string | null;     // 父任务ID
    childIds?: string[];          // 子任务ID列表
    level?: number;               // 层级深度（0为根任务）
    
    // 任务链相关
    chainId?: string;             // 所属任务链ID
    order?: number;               // 在同级中的顺序
    
    // 依赖关系
    dependsOn?: string[];         // 依赖的任务ID列表
    
    // 时间信息（可选，用于日程安排）
    scheduledDate?: string;       // 计划日期
    scheduledStartTime?: string;  // 计划开始时间
    scheduledEndTime?: string;    // 计划结束时间
    estimatedDuration?: number;   // 预估时长（分钟）
    
    // AI生成相关
    aiGenerated?: boolean;        // 是否由AI生成
    prompt?: string;              // 生成提示词
}

/**
 * 任务链 - 一组相关联的任务
 */
export interface TaskChain {
    id: string;
    title: string;
    description?: string;
    rootTaskIds: string[];        // 根任务ID列表
    tasks: TaskNode[];            // 所有任务节点
    createdAt: string;
    updatedAt: string;
    
    // 元数据
    totalTasks?: number;          // 总任务数
    completedTasks?: number;      // 已完成任务数
    progress?: number;            // 完成进度 0-100
}

/**
 * 任务拆分请求
 */
export interface TaskSplitRequest {
    taskId: string;
    parentTask: TaskNode;
    maxSubtasks?: number;         // 最大子任务数
    context?: string;             // 额外上下文
}

/**
 * 任务拆分响应
 */
export interface TaskSplitResponse {
    parentId: string;
    subtasks: TaskNode[];
}

/**
 * 任务树节点（用于UI展示）
 */
export interface TaskTreeNode extends TaskNode {
    children?: TaskTreeNode[];
    expanded?: boolean;           // 是否展开
    depth?: number;               // 深度
}

/**
 * 任务关系类型
 */
export type TaskRelationType = 'parent-child' | 'dependency' | 'chain';

/**
 * 任务关系
 */
export interface TaskRelation {
    type: TaskRelationType;
    sourceId: string;
    targetId: string;
    metadata?: Record<string, any>;
}

/**
 * 任务操作类型
 */
export type TaskAction = 
    | 'create'
    | 'update'
    | 'delete'
    | 'split'              // 拆分为子任务
    | 'merge'              // 合并子任务
    | 'move'               // 移动到其他位置
    | 'schedule'           // 安排到日程
    | 'unschedule'         // 从日程移除
    | 'add_to_backlog'     // 添加到备选
    | 'publish_to_market'; // 发布到市场

/**
 * 任务操作结果
 */
export interface TaskActionResult {
    success: boolean;
    action: TaskAction;
    taskIds: string[];
    message?: string;
    data?: any;
}
