/**
 * 存储调试工具
 * 用于检查 localStorage 和 IndexedDB 中的数据
 */

import storage from './storage';
import indexedDB, { STORES } from './indexedDB';

export const debugStorage = {
    /**
     * 检查 localStorage 中的任务数据
     */
    checkLocalStorage: () => {
        console.group('📦 LocalStorage 数据检查');
        
        const tasks = storage.get('scrum_tasks', []);
        console.log('任务数量:', tasks?.length || 0);
        console.log('任务数据:', tasks);
        
        const workHours = storage.get('work_hours_settings');
        console.log('工作时段设置:', workHours);
        
        const allKeys = storage.keys();
        console.log('所有存储键:', allKeys);
        
        const size = storage.getSize();
        console.log('存储大小:', (size / 1024).toFixed(2), 'KB');
        
        console.groupEnd();
        
        return { tasks, workHours, allKeys, size };
    },

    /**
     * 检查 IndexedDB 中的任务数据
     */
    checkIndexedDB: async () => {
        console.group('💾 IndexedDB 数据检查');
        
        try {
            const tasks = await indexedDB.getAll(STORES.TASKS);
            console.log('任务数量:', tasks?.length || 0);
            console.log('任务数据:', tasks);
            
            const count = await indexedDB.count(STORES.TASKS);
            console.log('任务总数:', count);
            
            console.groupEnd();
            
            return { tasks, count };
        } catch (error) {
            console.error('IndexedDB 读取失败:', error);
            console.groupEnd();
            return null;
        }
    },

    /**
     * 完整的存储检查
     */
    checkAll: async () => {
        console.log('🔍 开始完整存储检查...\n');
        
        const localStorage = debugStorage.checkLocalStorage();
        const indexedDB = await debugStorage.checkIndexedDB();
        
        console.log('\n📊 检查总结:');
        console.log('LocalStorage 任务数:', localStorage.tasks?.length || 0);
        console.log('IndexedDB 任务数:', indexedDB?.tasks?.length || 0);
        
        if (localStorage.tasks?.length !== indexedDB?.tasks?.length) {
            console.warn('⚠️ 警告: LocalStorage 和 IndexedDB 数据不一致！');
        } else {
            console.log('✅ 数据一致');
        }
        
        return { localStorage, indexedDB };
    },

    /**
     * 清空所有存储
     */
    clearAll: async () => {
        if (!confirm('确定要清空所有存储数据吗？此操作不可恢复！')) {
            return;
        }
        
        console.log('🗑️ 清空所有存储...');
        
        // 清空 localStorage
        storage.remove('scrum_tasks');
        console.log('✓ LocalStorage 已清空');
        
        // 清空 IndexedDB
        try {
            await indexedDB.clear(STORES.TASKS);
            console.log('✓ IndexedDB 已清空');
        } catch (error) {
            console.error('IndexedDB 清空失败:', error);
        }
        
        console.log('✅ 清空完成');
    },

    /**
     * 导出所有数据（用于备份）
     */
    exportData: async () => {
        const data = await debugStorage.checkAll();
        const json = JSON.stringify(data, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aitodo-backup-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 数据已导出');
    },

    /**
     * 测试保存功能
     */
    testSave: async () => {
        console.log('🧪 测试保存功能...');
        
        const testTask = {
            id: Date.now(),
            taskTime: new Date().toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '11:00',
            task: '测试任务 ' + new Date().toLocaleTimeString(),
            remark: '这是一个测试任务',
            state: 'pending'
        };
        
        // 保存到 localStorage
        const tasks = storage.get<any[]>('scrum_tasks', []) || [];
        tasks.push(testTask);
        storage.set('scrum_tasks', tasks);
        console.log('✓ 已保存到 LocalStorage');
        
        // 保存到 IndexedDB
        try {
            await indexedDB.set(STORES.TASKS, testTask);
            console.log('✓ 已保存到 IndexedDB');
        } catch (error) {
            console.error('IndexedDB 保存失败:', error);
        }
        
        // 验证
        await debugStorage.checkAll();
    }
};

// 挂载到 window 对象，方便在控制台调用
if (typeof window !== 'undefined') {
    (window as any).debugStorage = debugStorage;
    console.log('💡 调试工具已加载，使用方法:');
    console.log('  debugStorage.checkAll() - 检查所有存储');
    console.log('  debugStorage.checkLocalStorage() - 检查 LocalStorage');
    console.log('  debugStorage.checkIndexedDB() - 检查 IndexedDB');
    console.log('  debugStorage.testSave() - 测试保存功能');
    console.log('  debugStorage.exportData() - 导出数据备份');
    console.log('  debugStorage.clearAll() - 清空所有数据');
}

export default debugStorage;
