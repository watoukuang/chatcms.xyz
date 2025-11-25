/**
 * 统一的本地存储工具类
 * 提供类型安全的 localStorage 操作
 */

type StorageKey =
    | 'taskPlan'
    | 'token'
    | 'user_detail'
    | string;

class StorageService {
    /**
     * 检查是否在浏览器环境
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    /**
     * 获取存储的值
     * @param key 存储键
     * @param defaultValue 默认值
     * @returns 存储的值或默认值
     */
    get<T = any>(key: StorageKey, defaultValue?: T): T | null {
        if (!this.isBrowser()) {
            return defaultValue ?? null;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue ?? null;
            }

            // 尝试解析 JSON
            try {
                return JSON.parse(item) as T;
            } catch {
                // 如果不是 JSON，返回原始字符串
                return item as unknown as T;
            }
        } catch (error) {
            console.error(`Error getting item from localStorage: ${key}`, error);
            return defaultValue ?? null;
        }
    }

    /**
     * 设置存储的值
     * @param key 存储键
     * @param value 要存储的值
     */
    set<T = any>(key: StorageKey, value: T): void {
        if (!this.isBrowser()) {
            return;
        }

        try {
            const serialized = typeof value === 'string'
                ? value
                : JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error setting item to localStorage: ${key}`, error);
        }
    }

    /**
     * 移除存储的值
     * @param key 存储键
     */
    remove(key: StorageKey): void {
        if (!this.isBrowser()) {
            return;
        }

        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage: ${key}`, error);
        }
    }

    /**
     * 清空所有存储
     */
    clear(): void {
        if (!this.isBrowser()) {
            return;
        }

        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }

    /**
     * 检查键是否存在
     * @param key 存储键
     */
    has(key: StorageKey): boolean {
        if (!this.isBrowser()) {
            return false;
        }

        return localStorage.getItem(key) !== null;
    }

    /**
     * 获取所有键
     */
    keys(): string[] {
        if (!this.isBrowser()) {
            return [];
        }

        return Object.keys(localStorage);
    }

    /**
     * 获取存储大小（字节）
     */
    getSize(): number {
        if (!this.isBrowser()) {
            return 0;
        }

        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
}

// 创建单例实例
const storage = new StorageService();

export default storage;

// 导出常用方法
export const {get, set, remove, clear, has, keys, getSize} = storage;
