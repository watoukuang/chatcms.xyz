import moment from 'moment';
import storage from '@/src/shared/utils/storage';
import {Task} from '@/types/app/scrum';

// 本地缓存键
const STORAGE_KEY = 'scrum_tasks';

/**
 * 从本地缓存读取所有任务
 */
export const loadAllTasks = (): Task[] => {
    const list = storage.get<Task[]>(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
};

/**
 * 保存所有任务到本地缓存
 */
export const saveAllTasks = (list: Task[]): void => {
    storage.set(STORAGE_KEY, list);
};

/**
 * 按条件查询本地任务
 */
export const getTasksLocal = (params: {
    userId?: number;
    startDate?: string;
    endDate?: string;
}): Task[] => {
    const {userId, startDate, endDate} = params;
    const all = loadAllTasks();
    return all.filter((t) => {
        if (userId !== undefined && t.userId !== userId) return false;
        if (startDate && moment(t.taskTime, 'YYYY-MM-DD').isBefore(moment(startDate, 'YYYY-MM-DD'), 'day')) return false;
        if (endDate && moment(t.taskTime, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD'), 'day')) return false;
        return true;
    });
};

/**
 * 新增本地任务
 */
export const addTaskLocal = (partial: Partial<Task>): Task => {
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

/**
 * 修改本地任务
 */
export const updateTaskLocal = (updated: Task): Task => {
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
