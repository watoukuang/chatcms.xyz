import moment from 'moment';
import storage from '@/src/shared/utils/storage';
import {Task} from '@/types/app/scrum';
import {
    loadAllTasksFromDB,
    saveAllTasksToDB,
    getTasksFromDB,
    addTaskToDB,
    updateTaskInDB,
    deleteTaskFromDB,
    migrateToIndexedDB
} from './indexedDBCached';

// 本地缓存键
const STORAGE_KEY = 'scrum_tasks';

// 是否使用 IndexedDB（默认启用）
const USE_INDEXED_DB = true;

/**
 * 从本地缓存读取所有任务
 */
export const loadAllTasks = async (): Promise<Task[]> => {
    if (USE_INDEXED_DB) {
        return await loadAllTasksFromDB();
    }
    const list = storage.get<Task[]>(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
};

/**
 * 同步版本（兼容旧代码）
 */
export const loadAllTasksSync = (): Task[] => {
    const list = storage.get<Task[]>(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
};

/**
 * 保存所有任务到本地缓存
 */
export const saveAllTasks = async (list: Task[]): Promise<void> => {
    if (USE_INDEXED_DB) {
        await saveAllTasksToDB(list);
    } else {
        storage.set(STORAGE_KEY, list);
    }
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
    const all = loadAllTasksSync();
    return all.filter((t) => {
        if (startDate && moment(t.taskTime, 'YYYY-MM-DD').isBefore(moment(startDate, 'YYYY-MM-DD'), 'day')) return false;
        if (endDate && moment(t.taskTime, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD'), 'day')) return false;
        return true;
    });
};

/**
 * 按条件查询本地任务（异步版本）
 */
export const getTasksLocalAsync = async (params: {
    userId?: number;
    startDate?: string;
    endDate?: string;
}): Promise<Task[]> => {
    if (USE_INDEXED_DB) {
        return await getTasksFromDB(params);
    }
    return getTasksLocal(params);
};

/**
 * 新增本地任务
 */
export const addTaskLocal = (partial: Partial<Task>): Task => {
    const all = loadAllTasksSync();
    const newTask: Task = {
        id: partial.id ?? Date.now(),
        taskTime: partial.taskTime ?? moment().format('YYYY-MM-DD'),
        startTime: partial.startTime ?? '00:00',
        endTime: partial.endTime ?? '01:00',
        task: partial.task ?? '',
        remark: partial.remark ?? '',
        state: partial.state ?? 'pending',
    } as Task;
    all.push(newTask);
    storage.set(STORAGE_KEY, all);
    // 异步保存到 IndexedDB
    if (USE_INDEXED_DB) {
        addTaskToDB(partial).catch(console.error);
    }
    return newTask;
};

/**
 * 修改本地任务
 */
export const updateTaskLocal = (updated: Task): Task => {
    const all = loadAllTasksSync();
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
    storage.set(STORAGE_KEY, all);
    // 异步保存到 IndexedDB
    if (USE_INDEXED_DB) {
        updateTaskInDB(item).catch(console.error);
    }
    return item;
};

/**
 * 删除本地任务
 */
export const deleteTaskLocal = (taskId: number): void => {
    const all = loadAllTasksSync();
    const filtered = all.filter(t => t.id !== taskId);
    storage.set(STORAGE_KEY, filtered);
    // 异步删除 IndexedDB
    if (USE_INDEXED_DB) {
        deleteTaskFromDB(taskId).catch(console.error);
    }
};

/**
 * 初始化数据迁移
 */
export const initMigration = async (): Promise<void> => {
    if (USE_INDEXED_DB) {
        await migrateToIndexedDB();
    }
};
