/**
 * 任务市场 API
 */

import request from '../utils/request';
import {R} from '../types/response';
import {TaskNode} from '../types/task';

/**
 * 市场任务接口
 */
export interface MarketTask {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    priority?: string;
    estimatedDuration?: number;  // 预估时长（分钟）
    budget?: number;              // 预算
    currency?: string;            // 货币单位
    deadline?: string;            // 截止日期
    
    // 发布者信息
    publisherId: string;
    publisherName: string;
    publisherEmail?: string;
    contactInfo?: string;
    
    // 状态
    status: 'open' | 'in_progress' | 'completed' | 'closed';
    
    // 统计
    viewCount?: number;
    applicantCount?: number;
    
    // 时间戳
    publishedAt: string;
    updatedAt: string;
}

/**
 * 发布任务请求
 */
export interface PublishTaskRequest {
    title: string;
    description: string;
    category: string;
    tags?: string[];
    priority?: string;
    estimatedDuration?: number;
    budget?: number;
    currency?: string;
    deadline?: string;
    contactInfo?: string;
}

/**
 * 任务搜索参数
 */
export interface TaskSearchParams {
    keyword?: string;
    category?: string;
    tags?: string[];
    status?: string;
    minBudget?: number;
    maxBudget?: number;
    sortBy?: 'latest' | 'budget' | 'deadline' | 'popular';
    page?: number;
    pageSize?: number;
}

/**
 * 发布任务到市场
 */
export async function publishTaskToMarket(
    task: PublishTaskRequest
): Promise<R<MarketTask>> {
    return await request.post<MarketTask>('/api/market/tasks', task);
}

/**
 * 获取市场任务列表
 */
export async function getMarketTasks(
    params?: TaskSearchParams
): Promise<R<{tasks: MarketTask[]; total: number}>> {
    let url = '/service/market/tasks';
    if (params) {
        const queryString = new URLSearchParams(params as any).toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }
    return await request.get<{tasks: MarketTask[]; total: number}>(url);
}

/**
 * 获取任务详情
 */
export async function getMarketTaskDetail(
    taskId: string
): Promise<R<MarketTask>> {
    return await request.get<MarketTask>(`/api/market/tasks/${taskId}`);
}

/**
 * 更新市场任务
 */
export async function updateMarketTask(
    taskId: string,
    updates: Partial<PublishTaskRequest>
): Promise<R<MarketTask>> {
    return await request.put<MarketTask>(`/api/market/tasks/${taskId}`, updates);
}

/**
 * 删除市场任务
 */
export async function deleteMarketTask(taskId: string): Promise<R<null>> {
    return await request.delete<null>(`/api/market/tasks/${taskId}`);
}

/**
 * 获取我发布的任务
 */
export async function getMyPublishedTasks(): Promise<R<MarketTask[]>> {
    return await request.get<MarketTask[]>('/api/market/my-tasks');
}

/**
 * 申请任务
 */
export async function applyForTask(
    taskId: string,
    message?: string
): Promise<R<{applicationId: string}>> {
    return await request.post<{applicationId: string}>(
        `/api/market/tasks/${taskId}/apply`,
        {message}
    );
}

/**
 * 增加任务浏览量
 */
export async function incrementTaskView(taskId: string): Promise<R<null>> {
    return await request.post<null>(`/api/market/tasks/${taskId}/view`, {});
}

/**
 * 获取热门任务
 */
export async function getPopularTasks(limit: number = 10): Promise<R<MarketTask[]>> {
    return await request.get<MarketTask[]>(`/api/market/tasks/popular?limit=${limit}`);
}

/**
 * 获取推荐任务
 */
export async function getRecommendedTasks(limit: number = 10): Promise<R<MarketTask[]>> {
    return await request.get<MarketTask[]>(`/api/market/tasks/recommended?limit=${limit}`);
}

/**
 * 将本地任务转换为市场任务格式
 */
export function convertToMarketTask(
    task: TaskNode,
    publisherInfo: {
        publisherId: string;
        publisherName: string;
        publisherEmail?: string;
    },
    additionalInfo?: Partial<PublishTaskRequest>
): PublishTaskRequest {
    return {
        title: task.title,
        description: task.description || '',
        category: additionalInfo?.category || '其他',
        tags: task.tags || [],
        priority: task.priority,
        estimatedDuration: task.estimatedDuration,
        contactInfo: publisherInfo.publisherEmail,
        ...additionalInfo,
    };
}

/**
 * 验证任务发布数据
 */
export function validatePublishTask(task: PublishTaskRequest): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    if (!task.title || task.title.trim().length === 0) {
        errors.push('任务标题不能为空');
    }
    
    if (task.title && task.title.length > 100) {
        errors.push('任务标题不能超过100个字符');
    }
    
    if (!task.description || task.description.trim().length === 0) {
        errors.push('任务描述不能为空');
    }
    
    if (task.description && task.description.length > 2000) {
        errors.push('任务描述不能超过2000个字符');
    }
    
    if (!task.category) {
        errors.push('请选择任务类别');
    }
    
    if (task.budget !== undefined && task.budget < 0) {
        errors.push('预算不能为负数');
    }
    
    if (task.estimatedDuration !== undefined && task.estimatedDuration <= 0) {
        errors.push('预估时长必须大于0');
    }
    
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        if (deadlineDate <= now) {
            errors.push('截止日期必须晚于当前时间');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * 任务类别列表
 */
export const TASK_CATEGORIES = [
    '开发',
    '设计',
    '写作',
    '营销',
    '数据',
    '翻译',
    '咨询',
    '教育',
    '其他',
];

/**
 * 获取类别的图标
 */
export function getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
        '开发': '💻',
        '设计': '🎨',
        '写作': '✍️',
        '营销': '📢',
        '数据': '📊',
        '翻译': '🌐',
        '咨询': '💼',
        '教育': '📚',
        '其他': '📋',
    };
    
    return iconMap[category] || '📋';
}
