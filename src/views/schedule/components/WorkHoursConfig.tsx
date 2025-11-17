import React, {useState, useEffect} from 'react';
import storage from '@/src/shared/utils/storage';

interface WorkHoursSettings {
    workDays: number[]; // 0=周日, 1=周一, ..., 6=周六
    dailyHours: number;
    startTime: string;
    lunchBreak: {
        enabled: boolean;
        start: string;
        end: string;
    };
    unavailableSlots: Array<{
        day: number;
        start: string;
        end: string;
        reason: string;
    }>;
}

const defaultSettings: WorkHoursSettings = {
    workDays: [1, 2, 3, 4, 5], // 周一到周五
    dailyHours: 8,
    startTime: '09:00',
    lunchBreak: {
        enabled: true,
        start: '12:00',
        end: '13:00'
    },
    unavailableSlots: []
};

const STORAGE_KEY = 'work_hours_settings';

const WorkHoursConfig: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<WorkHoursSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    const weekDays = [
        {value: 0, label: '周日'},
        {value: 1, label: '周一'},
        {value: 2, label: '周二'},
        {value: 3, label: '周三'},
        {value: 4, label: '周四'},
        {value: 5, label: '周五'},
        {value: 6, label: '周六'}
    ];

    // 加载设置
    useEffect(() => {
        const saved = storage.get<WorkHoursSettings>(STORAGE_KEY, null);
        if (saved) {
            setSettings(saved);
        }
    }, []);

    // 保存设置
    const handleSave = () => {
        storage.set(STORAGE_KEY, settings);
        setHasChanges(false);
        alert('工作时段配置已保存');
        setIsOpen(false);
    };

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

    // 计算结束时间
    const calculateEndTime = () => {
        const [hours, minutes] = settings.startTime.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes + settings.dailyHours * 60;
        
        // 如果启用午休，加上午休时间
        if (settings.lunchBreak.enabled) {
            const [lunchStart] = settings.lunchBreak.start.split(':').map(Number);
            const [lunchEnd] = settings.lunchBreak.end.split(':').map(Number);
            const lunchDuration = (lunchEnd * 60) - (lunchStart * 60);
            totalMinutes += lunchDuration;
        }
        
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    return (
        <>
            {/* 触发按钮 */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                title="工作时段配置"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-medium hidden sm:inline">工作时段</span>
            </button>

            {/* 配置弹窗 */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideDown">
                        {/* 头部 */}
                        <div
                            className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <h2 className="text-xl font-bold">工作时段配置</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* 内容 */}
                        <div className="p-6 space-y-6">
                            {/* 工作日选择 */}
                            <div>
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

                            {/* 每日工时 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    每日工作时长（小时）
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={settings.dailyHours}
                                    onChange={(e) => {
                                        setSettings({...settings, dailyHours: parseInt(e.target.value) || 8});
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* 开始时间 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    开始时间
                                </label>
                                <input
                                    type="time"
                                    value={settings.startTime}
                                    onChange={(e) => {
                                        setSettings({...settings, startTime: e.target.value});
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    预计结束时间：{calculateEndTime()}
                                </p>
                            </div>

                            {/* 午休设置 */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        午休时间
                                    </label>
                                    <button
                                        onClick={() => {
                                            setSettings({
                                                ...settings,
                                                lunchBreak: {...settings.lunchBreak, enabled: !settings.lunchBreak.enabled}
                                            });
                                            setHasChanges(true);
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.lunchBreak.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.lunchBreak.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                                {settings.lunchBreak.enabled && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                开始
                                            </label>
                                            <input
                                                type="time"
                                                value={settings.lunchBreak.start}
                                                onChange={(e) => {
                                                    setSettings({
                                                        ...settings,
                                                        lunchBreak: {...settings.lunchBreak, start: e.target.value}
                                                    });
                                                    setHasChanges(true);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                结束
                                            </label>
                                            <input
                                                type="time"
                                                value={settings.lunchBreak.end}
                                                onChange={(e) => {
                                                    setSettings({
                                                        ...settings,
                                                        lunchBreak: {...settings.lunchBreak, end: e.target.value}
                                                    });
                                                    setHasChanges(true);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 提示信息 */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                        <p className="font-medium mb-1">配置说明</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• 选择你的工作日，系统会在这些日期生成固定任务时段</li>
                                            <li>• 设置每日工作时长，系统会自动计算结束时间</li>
                                            <li>• 启用午休后，午休时间不计入工作时长</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 底部按钮 */}
                        <div
                            className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setSettings(defaultSettings);
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
        </>
    );
};

export default WorkHoursConfig;
