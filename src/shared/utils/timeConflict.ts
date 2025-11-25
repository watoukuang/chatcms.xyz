/**
 * 时间冲突检测工具
 */

import {ScheduledTask, TaskNode} from '../types/task';

/**
 * 时间段接口
 */
export interface TimeSlot {
    date: string;        // YYYY-MM-DD
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
}

/**
 * 冲突检测结果
 */
export interface ConflictResult {
    hasConflict: boolean;
    conflicts: ConflictDetail[];
}

/**
 * 冲突详情
 */
export interface ConflictDetail {
    taskId: string;
    taskTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    overlapMinutes: number;
}

/**
 * 将时间字符串转换为分钟数
 * @param time HH:mm 格式
 */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * 将分钟数转换为时间字符串
 * @param minutes 分钟数
 */
function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 检查两个时间段是否重叠
 */
export function isTimeOverlap(
    slot1: TimeSlot,
    slot2: TimeSlot
): boolean {
    // 不同日期不冲突
    if (slot1.date !== slot2.date) {
        return false;
    }

    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);

    // 检查是否有重叠
    return start1 < end2 && start2 < end1;
}

/**
 * 计算两个时间段的重叠时长（分钟）
 */
export function calculateOverlapMinutes(
    slot1: TimeSlot,
    slot2: TimeSlot
): number {
    if (!isTimeOverlap(slot1, slot2)) {
        return 0;
    }

    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return overlapEnd - overlapStart;
}

/**
 * 检测任务与现有任务列表的时间冲突
 */
export function detectTaskConflict(
    newTask: TimeSlot,
    existingTasks: ScheduledTask[],
    excludeTaskId?: string
): ConflictResult {
    const conflicts: ConflictDetail[] = [];

    existingTasks.forEach(task => {
        // 排除指定任务（用于编辑时）
        if (excludeTaskId && task.id === excludeTaskId) {
            return;
        }

        const taskSlot: TimeSlot = {
            date: task.taskTime,
            startTime: task.startTime,
            endTime: task.endTime,
        };

        if (isTimeOverlap(newTask, taskSlot)) {
            const overlapMinutes = calculateOverlapMinutes(newTask, taskSlot);
            conflicts.push({
                taskId: task.id,
                taskTitle: task.title,
                date: task.taskTime,
                startTime: task.startTime,
                endTime: task.endTime,
                overlapMinutes,
            });
        }
    });

    return {
        hasConflict: conflicts.length > 0,
        conflicts,
    };
}

/**
 * 检测任务链中的时间冲突
 * 规则：子任务不能早于父任务
 */
export function detectChainTimeConflict(
    tasks: TaskNode[]
): ConflictResult {
    const conflicts: ConflictDetail[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    tasks.forEach(task => {
        if (!task.parentId || !task.scheduledDate || !task.scheduledStartTime) {
            return;
        }

        const parent = taskMap.get(task.parentId);
        if (!parent || !parent.scheduledDate || !parent.scheduledEndTime) {
            return;
        }

        // 检查子任务是否在父任务结束之前开始
        const parentDate = new Date(parent.scheduledDate);
        const taskDate = new Date(task.scheduledDate);

        if (taskDate < parentDate) {
            conflicts.push({
                taskId: task.id,
                taskTitle: task.title,
                date: task.scheduledDate,
                startTime: task.scheduledStartTime,
                endTime: task.scheduledEndTime || '',
                overlapMinutes: 0,
            });
        } else if (taskDate.getTime() === parentDate.getTime()) {
            // 同一天，检查时间
            const parentEnd = timeToMinutes(parent.scheduledEndTime);
            const taskStart = timeToMinutes(task.scheduledStartTime);

            if (taskStart < parentEnd) {
                conflicts.push({
                    taskId: task.id,
                    taskTitle: task.title,
                    date: task.scheduledDate,
                    startTime: task.scheduledStartTime,
                    endTime: task.scheduledEndTime || '',
                    overlapMinutes: parentEnd - taskStart,
                });
            }
        }
    });

    return {
        hasConflict: conflicts.length > 0,
        conflicts,
    };
}

/**
 * 查找可用的时间段
 * @param date 日期
 * @param duration 所需时长（分钟）
 * @param existingTasks 已有任务
 * @param workStart 工作开始时间
 * @param workEnd 工作结束时间
 */
export function findAvailableTimeSlots(
    date: string,
    duration: number,
    existingTasks: ScheduledTask[],
    workStart: string = '09:00',
    workEnd: string = '18:00'
): TimeSlot[] {
    const availableSlots: TimeSlot[] = [];
    const workStartMinutes = timeToMinutes(workStart);
    const workEndMinutes = timeToMinutes(workEnd);

    // 获取当天的所有任务并排序
    const dayTasks = existingTasks
        .filter(t => t.taskTime === date)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    let currentTime = workStartMinutes;

    dayTasks.forEach(task => {
        const taskStart = timeToMinutes(task.startTime);
        const taskEnd = timeToMinutes(task.endTime);

        // 检查当前时间到任务开始之间是否有足够空间
        if (taskStart - currentTime >= duration) {
            availableSlots.push({
                date,
                startTime: minutesToTime(currentTime),
                endTime: minutesToTime(currentTime + duration),
            });
        }

        currentTime = Math.max(currentTime, taskEnd);
    });

    // 检查最后一个任务之后到工作结束时间
    if (workEndMinutes - currentTime >= duration) {
        availableSlots.push({
            date,
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(currentTime + duration),
        });
    }

    return availableSlots;
}

/**
 * 自动安排任务到最近的可用时间段
 */
export function autoScheduleTask(
    task: TaskNode,
    existingTasks: ScheduledTask[],
    startDate: Date = new Date(),
    maxDaysAhead: number = 7,
    workStart: string = '09:00',
    workEnd: string = '18:00'
): TimeSlot | null {
    const duration = task.estimatedDuration || 60; // 默认60分钟

    for (let i = 0; i < maxDaysAhead; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const availableSlots = findAvailableTimeSlots(
            dateStr,
            duration,
            existingTasks,
            workStart,
            workEnd
        );

        if (availableSlots.length > 0) {
            return availableSlots[0];
        }
    }

    return null;
}

/**
 * 批量检测任务冲突
 */
export function batchDetectConflicts(
    newTasks: TimeSlot[],
    existingTasks: ScheduledTask[]
): Map<number, ConflictResult> {
    const results = new Map<number, ConflictResult>();

    newTasks.forEach((task, index) => {
        const result = detectTaskConflict(task, existingTasks);
        if (result.hasConflict) {
            results.set(index, result);
        }
    });

    return results;
}

/**
 * 生成冲突报告文本
 */
export function generateConflictReport(conflicts: ConflictDetail[]): string {
    if (conflicts.length === 0) {
        return '没有时间冲突';
    }

    const lines = ['检测到以下时间冲突：'];
    conflicts.forEach((conflict, index) => {
        lines.push(
            `${index + 1}. ${conflict.taskTitle} (${conflict.date} ${conflict.startTime}-${conflict.endTime}) - 重叠 ${conflict.overlapMinutes} 分钟`
        );
    });

    return lines.join('\n');
}

/**
 * 验证时间格式
 */
export function validateTimeFormat(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

/**
 * 验证日期格式
 */
export function validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return false;
    }

    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * 验证时间段是否有效（结束时间晚于开始时间）
 */
export function validateTimeSlot(slot: TimeSlot): {
    valid: boolean;
    error?: string;
} {
    if (!validateDateFormat(slot.date)) {
        return {valid: false, error: '日期格式无效'};
    }

    if (!validateTimeFormat(slot.startTime)) {
        return {valid: false, error: '开始时间格式无效'};
    }

    if (!validateTimeFormat(slot.endTime)) {
        return {valid: false, error: '结束时间格式无效'};
    }

    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);

    if (start >= end) {
        return {valid: false, error: '结束时间必须晚于开始时间'};
    }

    return {valid: true};
}
