import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import storage from '@/src/shared/utils/storage';

export interface WorkHoursSettings {
    workDays: number[]; // 0=周日, 1=周一, ..., 6=周六
    startTime: string; // 工作开始时间 HH:mm
    endTime: string;   // 工作结束时间 HH:mm
    breaks: Array<{    // 多段休息时间（可为空）
        start: string;
        end: string;
        label?: string;
    }>;
    calendarStoragePath?: string; // 日历存储路径（供前端显示与记录）
    unavailableSlots: Array<{
        day: number;
        start: string;
        end: string;
        reason: string;
    }>;
}

export const DEFAULT_WORK_HOURS_SETTINGS: WorkHoursSettings = {
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    breaks: [
        { start: '12:00', end: '13:00', label: '午休' }
    ],
    calendarStoragePath: '',
    unavailableSlots: []
};

export const WORK_HOURS_STORAGE_KEY = 'work_hours_settings';

interface AppSettingsContextValue {
    workHoursSettings: WorkHoursSettings;
    updateWorkHoursSettings: (next: WorkHoursSettings) => void;
    resetWorkHoursSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [workHoursSettings, setWorkHoursSettings] = useState<WorkHoursSettings>(DEFAULT_WORK_HOURS_SETTINGS);

    // 初始化从本地存储加载设置
    useEffect(() => {
        const saved: any = storage.get<any>(WORK_HOURS_STORAGE_KEY);
        if (saved) {
            setWorkHoursSettings(migrateSettings(saved));
        }
    }, []);

    const updateWorkHoursSettings = (next: WorkHoursSettings) => {
        setWorkHoursSettings(next);
        storage.set(WORK_HOURS_STORAGE_KEY, next);
    };

    const resetWorkHoursSettings = () => {
        setWorkHoursSettings(DEFAULT_WORK_HOURS_SETTINGS);
        storage.set(WORK_HOURS_STORAGE_KEY, DEFAULT_WORK_HOURS_SETTINGS);
    };

    const value = useMemo<AppSettingsContextValue>(() => ({
        workHoursSettings,
        updateWorkHoursSettings,
        resetWorkHoursSettings,
    }), [workHoursSettings]);

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = (): AppSettingsContextValue => {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) {
        throw new Error('useAppSettings must be used within AppSettingsProvider');
    }
    return ctx;
};

// ============ 迁移与工具函数 ============
function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function computeEndTimeFromDailyHours(startTime: string, dailyHours?: number, lunchBreak?: { enabled: boolean; start: string; end: string; }): string {
    const base = timeToMinutes(startTime);
    let total = base + (dailyHours ? dailyHours * 60 : 0);
    if (lunchBreak?.enabled && lunchBreak.start && lunchBreak.end) {
        total += Math.max(0, timeToMinutes(lunchBreak.end) - timeToMinutes(lunchBreak.start));
    }
    return minutesToTime(total);
}

function migrateSettings(saved: any): WorkHoursSettings {
    const base = DEFAULT_WORK_HOURS_SETTINGS;
    const workDays = Array.isArray(saved?.workDays) ? saved.workDays : base.workDays;
    const startTime = typeof saved?.startTime === 'string' ? saved.startTime : base.startTime;
    const endTime = typeof saved?.endTime === 'string'
        ? saved.endTime
        : computeEndTimeFromDailyHours(startTime, saved?.dailyHours, saved?.lunchBreak);
    const breaks = Array.isArray(saved?.breaks)
        ? saved.breaks
        : (saved?.lunchBreak?.enabled ? [{ start: saved.lunchBreak.start, end: saved.lunchBreak.end, label: '午休' }] : base.breaks);
    const unavailableSlots = Array.isArray(saved?.unavailableSlots) ? saved.unavailableSlots : base.unavailableSlots;
    const calendarStoragePath = typeof saved?.calendarStoragePath === 'string' ? saved.calendarStoragePath : base.calendarStoragePath;
    return { workDays, startTime, endTime, breaks, calendarStoragePath, unavailableSlots };
}