import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    collapse: () => void;
    expand: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'aitodo.sidebarCollapsed.v1';

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    // 初始化：从本地存储恢复
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            if (raw === 'true') setIsCollapsed(true);
            if (raw === 'false') setIsCollapsed(false);
        } catch {
            // 忽略存储异常
        }
    }, []);

    // 存储持久化
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, String(isCollapsed));
            }
        } catch {
        }
    }, [isCollapsed]);

    const toggleSidebar = () => setIsCollapsed((v) => !v);
    const collapse = () => setIsCollapsed(true);
    const expand = () => setIsCollapsed(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, collapse, expand }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
