import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import storage from '@/src/shared/utils/storage';

export interface WorkHoursSettings {
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

export const DEFAULT_WORK_HOURS_SETTINGS: WorkHoursSettings = {
    workDays: [1, 2, 3, 4, 5],
    dailyHours: 8,
    startTime: '09:00',
    lunchBreak: {
        enabled: true,
        start: '12:00',
        end: '13:00'
    },
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
        const saved = storage.get<WorkHoursSettings>(WORK_HOURS_STORAGE_KEY);
        if (saved) {
            setWorkHoursSettings(saved);
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