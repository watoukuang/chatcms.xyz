import {useState, useEffect, useCallback} from 'react';
import {logout} from '../api/auth';
import {UserDetail, AuthState} from '../types/user';
import storage from '../utils/storage';

type UseAuthReturn = {
    user: UserDetail | null;
    userDetail: UserDetail | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: UserDetail, token: string) => void;
    logout: () => Promise<void>;
    updateUser: (user: UserDetail) => void;
    getLocalUser: () => UserDetail | null;
    getLocalToken: () => string | null;
    isTokenValid: () => boolean;
};

export function useAuth(): UseAuthReturn {
    const [authState, setAuthState] = useState<AuthState>({
        userDetail: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const [mounted, setMounted] = useState(false);

    // 处理客户端挂载
    useEffect(() => {
        setMounted(true);
    }, []);

    // 获取本地存储的用户信息
    const getLocalUser = (): UserDetail | null => {
        if (typeof window === 'undefined') return null;
        return storage.get<UserDetail>('user_detail');
    };

    // 获取本地存储的 token
    const getLocalToken = (): string | null => {
        if (typeof window === 'undefined') return null;
        return storage.get<string>('token');
    };

    // 检查 token 是否有效
    const isTokenValid = (): boolean => {
        if (typeof window === 'undefined') return false;
        const token = getLocalToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // 转换为毫秒
            return Date.now() < exp;
        } catch {
            return false;
        }
    };

    // 初始化与刷新认证状态
    useEffect(() => {
        if (!mounted) return; // 只在客户端执行

        const refreshAuth = () => {
            const token = getLocalToken();
            const user = getLocalUser();

            if (token && user && isTokenValid()) {
                setAuthState({
                    userDetail: user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                if (typeof window !== 'undefined') {
                    storage.remove('token');
                    storage.remove('user_detail');
                }
                setAuthState({
                    userDetail: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        // 初始化
        refreshAuth();

        // 监听同标签自定义事件与跨标签 cached 事件
        const onAuthChanged = () => refreshAuth();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'user_detail') refreshAuth();
        };

        window.addEventListener('authChanged', onAuthChanged as EventListener);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('authChanged', onAuthChanged as EventListener);
            window.removeEventListener('storage', onStorage);
        };
    }, [mounted]);

    // 登录成功后更新状态
    const handleLoginSuccess = useCallback((user: UserDetail, token: string) => {
        setAuthState({
            userDetail: user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    }, []);

    // 登出
    const handleLogout = useCallback(async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAuthState({
                userDetail: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }, []);

    // 更新用户信息
    const updateUser = useCallback((user: UserDetail) => {
        setAuthState(prev => ({
            ...prev,
            userDetail: user,
        }));

        // 更新本地存储
        if (typeof window !== 'undefined') {
            storage.set('user_detail', user);
        }
    }, []);

    // 在服务端渲染时返回默认状态，避免水合不匹配
    if (!mounted) {
        return {
            user: null,
            userDetail: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            login: handleLoginSuccess,
            logout: handleLogout,
            updateUser,
            getLocalUser,
            getLocalToken,
            isTokenValid,
        };
    }

    return {
        ...authState,
        user: authState.userDetail,
        login: handleLoginSuccess,
        logout: handleLogout,
        updateUser,
        getLocalUser,
        getLocalToken,
        isTokenValid,
    };
}
