import { TaskHistory } from "@/src/views/home/components/Sidebar";

export const HISTORY_KEY = "aitodo.taskHistory.v1";

export const loadHistoriesFromStorage = (): TaskHistory[] => {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
        if (!raw) return [];
        const parsed: TaskHistory[] = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveHistoriesToStorage = (next: TaskHistory[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        }
    } catch {
        // ignore
    }
};

export const clearHistoriesFromStorage = (): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(HISTORY_KEY);
        }
    } catch {
        // ignore
    }
};
