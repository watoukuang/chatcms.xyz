/**
 * IndexedDB 统一存储服务
 * 提供类型安全的 IndexedDB 操作
 */

const DB_NAME = 'aitodo_db';
const DB_VERSION = 1;

// 定义存储对象
export const STORES = {
    TASKS: 'tasks',
    SETTINGS: 'settings',
    WORK_HOURS: 'work_hours',
} as const;

type StoreNames = typeof STORES[keyof typeof STORES];

class IndexedDBService {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<IDBDatabase> | null = null;

    /**
     * 初始化数据库
     */
    private async init(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // 创建任务存储对象
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    const taskStore = db.createObjectStore(STORES.TASKS, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    taskStore.createIndex('taskTime', 'taskTime', { unique: false });
                    taskStore.createIndex('state', 'state', { unique: false });
                }

                // 创建设置存储对象
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                // 创建工作时间设置存储对象
                if (!db.objectStoreNames.contains(STORES.WORK_HOURS)) {
                    db.createObjectStore(STORES.WORK_HOURS, { keyPath: 'id' });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * 添加或更新数据
     */
    async set<T = any>(storeName: StoreNames, data: T): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to set data in ${storeName}`));
        });
    }

    /**
     * 获取单条数据
     */
    async get<T = any>(storeName: StoreNames, key: IDBValidKey): Promise<T | null> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(new Error(`Failed to get data from ${storeName}`));
        });
    }

    /**
     * 获取所有数据
     */
    async getAll<T = any>(storeName: StoreNames): Promise<T[]> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error(`Failed to get all data from ${storeName}`));
        });
    }

    /**
     * 按索引查询数据
     */
    async getByIndex<T = any>(
        storeName: StoreNames,
        indexName: string,
        value: IDBValidKey
    ): Promise<T[]> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error(`Failed to get data by index from ${storeName}`));
        });
    }

    /**
     * 按范围查询数据
     */
    async getByRange<T = any>(
        storeName: StoreNames,
        indexName: string,
        range: IDBKeyRange
    ): Promise<T[]> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(range);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error(`Failed to get data by range from ${storeName}`));
        });
    }

    /**
     * 删除数据
     */
    async delete(storeName: StoreNames, key: IDBValidKey): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to delete data from ${storeName}`));
        });
    }

    /**
     * 清空存储对象
     */
    async clear(storeName: StoreNames): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
        });
    }

    /**
     * 批量添加数据
     */
    async bulkAdd<T = any>(storeName: StoreNames, items: T[]): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            let completed = 0;
            const total = items.length;

            items.forEach((item) => {
                const request = store.add(item);
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) resolve();
                };
                request.onerror = () => {
                    reject(new Error(`Failed to add item to ${storeName}`));
                };
            });

            if (total === 0) resolve();
        });
    }

    /**
     * 批量更新数据
     */
    async bulkPut<T = any>(storeName: StoreNames, items: T[]): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            let completed = 0;
            const total = items.length;

            items.forEach((item) => {
                const request = store.put(item);
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) resolve();
                };
                request.onerror = () => {
                    reject(new Error(`Failed to put item to ${storeName}`));
                };
            });

            if (total === 0) resolve();
        });
    }

    /**
     * 统计数据数量
     */
    async count(storeName: StoreNames): Promise<number> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error(`Failed to count data in ${storeName}`));
        });
    }
}

// 创建单例实例
const indexedDB = new IndexedDBService();

export default indexedDB;
