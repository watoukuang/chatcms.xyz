import React, {useState} from 'react';
import moment from 'moment';

interface DataExportProps {
    onImport?: (data: any) => void;
    iconOnly?: boolean;
}

const DataExport: React.FC<DataExportProps> = ({onImport, iconOnly = false}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    // 导出所有数据
    const handleExportAll = () => {
        try {
            const allData = {
                tasks: localStorage.getItem('scrum_tasks') || '[]',
                settings: localStorage.getItem('app_settings') || '{}',
                exportTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(JSON.parse(allData.tasks), null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aitodo_backup_${moment().format('YYYYMMDD_HHmmss')}.json`;
            link.click();
            URL.revokeObjectURL(url);
            setShowMenu(false);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请稍后重试');
        }
    };

    // 导出为CSV
    const handleExportCSV = () => {
        try {
            const tasksStr = localStorage.getItem('scrum_tasks') || '[]';
            const tasks = JSON.parse(tasksStr);

            if (tasks.length === 0) {
                alert('暂无数据可导出');
                return;
            }

            // CSV 头部
            const headers = ['ID', '任务日期', '开始时间', '结束时间', '任务内容', '备注', '状态', '创建时间', '更新时间'];
            const csvRows = [headers.join(',')];

            // 数据行
            tasks.forEach((task: any) => {
                const row = [
                    task.id || '',
                    task.taskTime || '',
                    task.startTime || '',
                    task.endTime || '',
                    `"${(task.task || '').replace(/"/g, '""')}"`, // 转义双引号
                    `"${(task.remark || '').replace(/"/g, '""')}"`,
                    task.state || '',
                    task.createdAt || '',
                    task.updatedAt || ''
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');
            const BOM = '\uFEFF'; // UTF-8 BOM for Excel
            const dataBlob = new Blob([BOM + csvContent], {type: 'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aitodo_tasks_${moment().format('YYYYMMDD_HHmmss')}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            setShowMenu(false);
        } catch (error) {
            console.error('导出CSV失败:', error);
            alert('导出CSV失败，请稍后重试');
        }
    };

    // 导入数据
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // 验证数据格式
                if (!Array.isArray(data)) {
                    throw new Error('数据格式不正确，应为数组');
                }

                // 保存到 localStorage
                localStorage.setItem('scrum_tasks', JSON.stringify(data));
                
                // 通知父组件
                onImport?.(data);
                
                setImportError(null);
                setShowMenu(false);
                alert(`成功导入 ${data.length} 条任务数据`);
                
                // 刷新页面以加载新数据
                window.location.reload();
            } catch (error) {
                console.error('导入失败:', error);
                setImportError('导入失败：文件格式不正确或数据损坏');
            }
        };
        reader.readAsText(file);
        
        // 重置input以允许重复选择同一文件
        event.target.value = '';
    };

    // 清空所有数据
    const handleClearAll = () => {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！建议先导出备份。')) {
            localStorage.removeItem('scrum_tasks');
            alert('数据已清空');
            setShowMenu(false);
            window.location.reload();
        }
    };

    return (
        <div className="relative">
            {/* 触发按钮（支持图标模式） */}
            <button
                onClick={() => iconOnly ? handleExportAll() : setShowMenu(!showMenu)}
                className={`${iconOnly
                    ? 'w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
                    : 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105'
                }`}
                title={iconOnly ? '导出数据' : '数据管理'}
            >
                {/* 下载图标 */}
                <svg className={`${iconOnly ? 'w-5 h-5 text-gray-700 dark:text-gray-300' : 'w-5 h-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v6m0 0l-3-3m3 3l3-3M12 4v8"/>
                </svg>
                {!iconOnly && <span className="font-medium">数据管理</span>}
            </button>

            {/* 下拉菜单（图标模式不显示菜单） */}
            {!iconOnly && showMenu && (
                <>
                    {/* 遮罩层 */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* 菜单内容 */}
                    <div
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideDown">
                        <div className="p-2 space-y-1">
                            {/* 导出JSON */}
                            <button
                                onClick={handleExportAll}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors group"
                            >
                                <svg className="w-5 h-5 text-lime-600 dark:text-lime-400" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <div className="flex-1">
                                    <div
                                        className="font-medium text-gray-900 dark:text-white group-hover:text-lime-700 dark:group-hover:text-lime-300">
                                        导出 JSON
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">完整数据备份</div>
                                </div>
                            </button>

                            {/* 导出CSV */}
                            <button
                                onClick={handleExportCSV}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                            >
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <div className="flex-1">
                                    <div
                                        className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                                        导出 CSV
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Excel 表格格式</div>
                                </div>
                            </button>

                            {/* 导入数据 */}
                            <label
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors cursor-pointer group">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                                <div className="flex-1">
                                    <div
                                        className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                        导入数据
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">从JSON文件恢复</div>
                                </div>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"/>

                            {/* 清空数据 */}
                            <button
                                onClick={handleClearAll}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                            >
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                <div className="flex-1">
                                    <div
                                        className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                                        清空数据
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">删除所有任务</div>
                                </div>
                            </button>
                        </div>

                        {/* 错误提示 */}
                        {importError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                                <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DataExport;
