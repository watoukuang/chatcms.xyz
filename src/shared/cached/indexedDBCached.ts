import moment from 'moment';
import indexedDB, { STORES } from '@/src/shared/utils/indexedDB';
import { Task } from '@/types/app/scrum';
import storage from '@/src/shared/utils/storage';

/**
 * IndexedDB 任务缓存服务
 * 提供与 localStorage 兼容的接口，但使用 IndexedDB 存储
 */

/**
 * 从 IndexedDB 读取所有任务
 */
export const loadAllTasksFromDB = async (): Promise<Task[]> => {
    try {
        const tasks = await indexedDB.getAll<Task>(STORES.TASKS);
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error('Failed to load tasks from IndexedDB:', error);
        // 降级到 localStorage
        return storage.get<Task[]>('scrum_tasks', []) || [];
    }
};

/**
 * 保存所有任务到 IndexedDB
 */
export const saveAllTasksToDB = async (list: Task[]): Promise<void> => {
    try {
        // 清空现有数据
        await indexedDB.clear(STORES.TASKS);
        // 批量添加新数据
        if (list.length > 0) {
            await indexedDB.bulkPut(STORES.TASKS, list);
        }
        // 同时保存到 localStorage 作为备份
        storage.set('scrum_tasks', list);
    } catch (error) {
        console.error('Failed to save tasks to IndexedDB:', error);
        // 降级到 localStorage
        storage.set('scrum_tasks', list);
    }
};

/**
 * 按条件查询任务（从 IndexedDB）
 */
export const getTasksFromDB = async (params: {
    userId?: number;
    startDate?: string;
    endDate?: string;
}): Promise<Task[]> => {
    const { startDate, endDate } = params;
    
    try {
        let tasks: Task[] = [];
        
        if (startDate && endDate) {
            // 使用索引范围查询
            const range = IDBKeyRange.bound(startDate, endDate);
            tasks = await indexedDB.getByRange<Task>(STORES.TASKS, 'taskTime', range);
        } else {
            // 获取所有任务后过滤
            const all = await loadAllTasksFromDB();
            tasks = all.filter((t) => {
                if (startDate && moment(t.taskTime, 'YYYY-MM-DD').isBefore(moment(startDate, 'YYYY-MM-DD'), 'day')) return false;
                if (endDate && moment(t.taskTime, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD'), 'day')) return false;
                return true;
            });
        }
        
        return tasks;
    } catch (error) {
        console.error('Failed to query tasks from IndexedDB:', error);
        // 降级到 localStorage
        const all = storage.get<Task[]>('scrum_tasks', []) || [];
        return all.filter((t) => {
            if (startDate && moment(t.taskTime, 'YYYY-MM-DD').isBefore(moment(startDate, 'YYYY-MM-DD'), 'day')) return false;
            if (endDate && moment(t.taskTime, 'YYYY-MM-DD').isAfter(moment(endDate, 'YYYY-MM-DD'), 'day')) return false;
            return true;
        });
    }
};

/**
 * 新增任务到 IndexedDB
 */
export const addTaskToDB = async (partial: Partial<Task>): Promise<Task> => {
    const newTask: Task = {
        id: partial.id ?? Date.now(),
        taskTime: partial.taskTime ?? moment().format('YYYY-MM-DD'),
        startTime: partial.startTime ?? '00:00',
        endTime: partial.endTime ?? '01:00',
        task: partial.task ?? '',
        remark: partial.remark ?? '',
        state: partial.state ?? 'pending',
        createdAt: moment().toISOString(),
    } as Task;

    try {
        await indexedDB.set(STORES.TASKS, newTask);
        // 同步到 localStorage
        const all = await loadAllTasksFromDB();
        storage.set('scrum_tasks', all);
        return newTask;
    } catch (error) {
        console.error('Failed to add task to IndexedDB:', error);
        throw error;
    }
};

/**
 * 更新任务到 IndexedDB
 */
export const updateTaskInDB = async (updated: Task): Promise<Task> => {
    const item: Task = {
        ...updated,
        updatedAt: moment().toISOString(),
    } as Task;

    try {
        await indexedDB.set(STORES.TASKS, item);
        // 同步到 localStorage
        const all = await loadAllTasksFromDB();
        storage.set('scrum_tasks', all);
        return item;
    } catch (error) {
        console.error('Failed to update task in IndexedDB:', error);
        throw error;
    }
};

/**
 * 删除任务从 IndexedDB
 */
export const deleteTaskFromDB = async (taskId: number): Promise<void> => {
    try {
        await indexedDB.delete(STORES.TASKS, taskId);
        // 同步到 localStorage
        const all = await loadAllTasksFromDB();
        storage.set('scrum_tasks', all);
    } catch (error) {
        console.error('Failed to delete task from IndexedDB:', error);
        throw error;
    }
};

/**
 * 从 localStorage 迁移数据到 IndexedDB
 */
export const migrateToIndexedDB = async (): Promise<void> => {
    try {
        const localTasks = storage.get<Task[]>('scrum_tasks', []) || [];
        if (localTasks.length > 0) {
            const dbTasks = await loadAllTasksFromDB();
            if (dbTasks.length === 0) {
                // 只在 IndexedDB 为空时迁移
                await saveAllTasksToDB(localTasks);
                console.log('Migrated tasks from localStorage to IndexedDB');
            }
        }
    } catch (error) {
        console.error('Failed to migrate to IndexedDB:', error);
    }
};
