import React, {useState, useEffect} from 'react';
import SettingsIcon from '@/src/components/Icons/SettingsIcon';
import {useAppSettings, DEFAULT_WORK_HOURS_SETTINGS, WorkHoursSettings} from '@/src/provider/AppSettingsProvider';

interface WorkHoursConfigProps {
    iconOnly?: boolean;
}

const Setting: React.FC<WorkHoursConfigProps> = ({iconOnly = false}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<WorkHoursSettings>(DEFAULT_WORK_HOURS_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);
    const {workHoursSettings, updateWorkHoursSettings} = useAppSettings();

    const weekDays = [
        {value: 0, label: '周日'},
        {value: 1, label: '周一'},
        {value: 2, label: '周二'},
        {value: 3, label: '周三'},
        {value: 4, label: '周四'},
        {value: 5, label: '周五'},
        {value: 6, label: '周六'}
    ];

    // 打开时同步当前全局设置到本地编辑状态
    useEffect(() => {
        if (isOpen) {
            setSettings(workHoursSettings);
            setHasChanges(false);
        }
    }, [isOpen, workHoursSettings]);

    // 保存设置到全局
    const handleSave = () => {
        updateWorkHoursSettings(settings);
        setHasChanges(false);
        setToast('工作时段配置已保存，日程表已自动更新');
        setTimeout(() => {
            setIsOpen(false);
        }, 1500);
    };

    const [toast, setToast] = useState<string | null>(null);

    // 切换工作日
    const toggleWorkDay = (day: number) => {
        setSettings(prev => ({
            ...prev,
            workDays: prev.workDays.includes(day)
                ? prev.workDays.filter(d => d !== day)
                : [...prev.workDays, day].sort()
        }));
        setHasChanges(true);
    };

    // 时间工具与总工时计算（不跨天）
    const timeToMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const minutesToTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
    const computeTotalWorkMinutes = () => {
        const start = timeToMinutes(settings.startTime);
        const end = timeToMinutes(settings.endTime);
        if (end <= start) return 0;
        const base = end - start;
        const breaks = (settings.breaks || []).map(b => ({
            s: clamp(timeToMinutes(b.start), start, end),
            e: clamp(timeToMinutes(b.end), start, end)
        })).filter(b => b.e > b.s);
        // 合并重叠休息段，计算总休息分钟
        breaks.sort((a, b) => a.s - b.s);
        let merged: Array<{ s: number; e: number }> = [];
        for (const b of breaks) {
            const last = merged[merged.length - 1];
            if (!last || b.s > last.e) merged.push({...b});
            else last.e = Math.max(last.e, b.e);
        }
        const breakMinutes = merged.reduce((sum, b) => sum + (b.e - b.s), 0);
        return Math.max(0, base - breakMinutes);
    };
    const formatHours = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m === 0 ? `${h}小时` : `${h}小时${m}分钟`;
    };

    // 支持 ESC 关闭弹窗
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    return (
        <>
            {/* 触发按钮（支持图标模式） */}
            <button
                onClick={() => setIsOpen(true)}
                className={`${iconOnly
                    ? 'w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'
                    : 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105'
                }`}
                title="工作时段配置"
            >
                {/* 设置图标（滑杆样式） */}
                <SettingsIcon className={`${iconOnly ? 'w-5 h-5 text-gray-700 dark:text-gray-300' : 'w-5 h-5'}`}/>
                {!iconOnly && <span className="font-medium hidden sm:inline">工作时段</span>}
            </button>

            {/* 配置弹窗 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideDown"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 头部 */}
                        <div
                            className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl min-h-[56px]">
                            <div className="flex items-center gap-3">
                                <SettingsIcon className="w-6 h-6 shrink-0"/>
                                <span className="text-xl font-bold leading-none h-6 flex items-center">设置</span>
                            </div>
                        </div>

                        {/* 内容 */}
                        <div className="p-6 space-y-6">
                            {/* 提示信息 */}
                            <div
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">ℹ️</span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">设置说明</h4>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            这些设置将自动应用到<strong>日程表（Schedule）</strong>页面：
                                        </p>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                                            <li>工作日将在日程表中高亮显示</li>
                                            <li>非工作日显示为灰色背景</li>
                                            <li>休息时段显示为琥珀色背景</li>
                                            <li>时间范围将限制日程表的显示时段</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 工作日选择 */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    工作日
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map(day => (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleWorkDay(day.value)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                                settings.workDays.includes(day.value)
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 工作时段：开始/结束 + 总工时 */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    工作时段
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-xs text-gray-600 dark:text-gray-400 mb-1">开始</label>
                                        <input
                                            type="time"
                                            value={settings.startTime}
                                            onChange={(e) => {
                                                setSettings({...settings, startTime: e.target.value});
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-xs text-gray-600 dark:text-gray-400 mb-1">结束</label>
                                        <input
                                            type="time"
                                            value={settings.endTime}
                                            onChange={(e) => {
                                                setSettings({...settings, endTime: e.target.value});
                                                setHasChanges(true);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                    总工时：{formatHours(computeTotalWorkMinutes())}
                                </p>
                                {timeToMinutes(settings.endTime) <= timeToMinutes(settings.startTime) && (
                                    <p className="mt-1 text-xs text-red-600">结束时间必须晚于开始时间</p>
                                )}
                            </div>

                            {/* 休息时段（可添加多段） */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300">休息时段</label>
                                    <button
                                        onClick={() => {
                                            const startDefault = minutesToTime(timeToMinutes(settings.startTime) + 60);
                                            const endDefault = minutesToTime(timeToMinutes(settings.startTime) + 90);
                                            setSettings(prev => ({
                                                ...prev,
                                                breaks: [...(prev.breaks || []), {
                                                    start: startDefault,
                                                    end: endDefault,
                                                    label: '休息'
                                                }]
                                            }));
                                            setHasChanges(true);
                                        }}
                                        className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                    >
                                        添加休息时段
                                    </button>
                                </div>
                                {(settings.breaks && settings.breaks.length > 0) ? (
                                    <div className="space-y-3">
                                        {settings.breaks.map((b, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                                <div>
                                                    <label
                                                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1">开始</label>
                                                    <input
                                                        type="time"
                                                        value={b.start}
                                                        onChange={(e) => {
                                                            const breaks = [...settings.breaks];
                                                            breaks[idx] = {...breaks[idx], start: e.target.value};
                                                            setSettings({...settings, breaks});
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="block text-xs text-gray-600 dark:text-gray-400 mb-1">结束</label>
                                                    <input
                                                        type="time"
                                                        value={b.end}
                                                        onChange={(e) => {
                                                            const breaks = [...settings.breaks];
                                                            breaks[idx] = {...breaks[idx], end: e.target.value};
                                                            setSettings({...settings, breaks});
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const breaks = [...settings.breaks];
                                                        breaks.splice(idx, 1);
                                                        setSettings({...settings, breaks});
                                                        setHasChanges(true);
                                                    }}
                                                    className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    删除
                                                </button>
                                                {(timeToMinutes(b.end) <= timeToMinutes(b.start)) && (
                                                    <div
                                                        className="col-span-3 text-xs text-red-600">休息结束必须晚于开始</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">暂无休息时段</p>
                                )}
                            </div>
                        </div>

                        {/* 底部按钮 */}
                        <div
                            className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setSettings(DEFAULT_WORK_HOURS_SETTINGS);
                                    setHasChanges(true);
                                }}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                恢复默认
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                                        hasChanges
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/30'
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    保存配置
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast 提示 */}
            {toast && (
                <div
                    className="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn z-[60]"
                    onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}>
                    <span className="text-xl">✓</span>
                    {toast}
                </div>
            )}
        </>
    );
};

export default Setting