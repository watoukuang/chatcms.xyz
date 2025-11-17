import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({children}: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => setIsDark(mq.matches);
        apply();
        mq.addEventListener?.('change', apply);
        return () => mq.removeEventListener?.('change', apply);
    }, []);

    const push = useCallback((type: ToastType, message: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const item: ToastItem = {id, type, message};
        setToasts(prev => [...prev, item]);
        // 自动销毁
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 2500);
    }, []);

    const api = useMemo<ToastContextValue>(() => ({
        success: (m: string) => push('success', m),
        error: (m: string) => push('error', m),
        info: (m: string) => push('info', m),
        warning: (m: string) => push('warning', m),
    }), [push]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            {/* 容器 */}
            <div style={{
                position: 'fixed',
                right: 16,
                bottom: 16,
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                pointerEvents: 'none',
            }}>
                {toasts.map(t => {
                    const accent = t.type === 'success'
                        ? '#10b981'
                        : t.type === 'error'
                            ? '#ef4444'
                            : t.type === 'warning'
                                ? '#f59e0b'
                                : '#3b82f6';

                    const icon = t.type === 'success'
                        ? '✓'
                        : t.type === 'error'
                            ? '!'
                            : t.type === 'warning'
                                ? '!'
                                : 'i';

                    const panelBg = isDark ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.98)';
                    const panelText = isDark ? '#ffffff' : '#5b4636';
                    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                    const accentBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
                    const badgeBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
                    const shadow = isDark ? '0 12px 30px rgba(0,0,0,0.45)' : '0 10px 28px rgba(0,0,0,0.12)';

                    return (
                        <div key={t.id} role="status" style={{
                            minWidth: 240,
                            maxWidth: 360,
                            padding: '12px 14px',
                            borderRadius: 14,
                            boxShadow: shadow,
                            fontSize: 14,
                            fontWeight: 500,
                            color: panelText,
                            background: panelBg,
                            border: `1px solid ${borderColor}`,
                            outline: `1px solid ${accentBorder}`,
                            backdropFilter: 'saturate(130%) blur(8px)',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
              <span aria-hidden style={{
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: badgeBg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12.5,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: accent,
                  border: `1px solid ${accentBorder}`,
              }}>{icon}</span>
                            <span style={{flex: 1}}>{t.message}</span>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
