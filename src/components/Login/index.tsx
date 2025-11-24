import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import GoogleIcon from '@/src/components/Icons/GoogleIcon'
import {login, register} from '@/src/shared/service/auth';
import {useToast} from '@/src/components/Toast';
import {LoginDTO, RegisterDTO} from "@/src/shared/types/user";
import {useRouter} from 'next/router';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (user: any) => void;
    initialMode?: 'login' | 'signup';
}

export default function LoginModal({open, onClose, onSuccess, initialMode}: LoginModalProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    // 全局 Toast（必须在任何条件返回前调用，避免 Hook 顺序变化）
    const toast = useToast();

    // 仅在客户端挂载后启用 portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // 打开时根据 initialMode 设置当前模式
    useEffect(() => {
        if (!open) return;
        if (initialMode) setMode(initialMode);
        else setMode('login');
        // 重置表单错误
        setError('');
        setFormState({email: '', password: '', confirmPassword: ''});
    }, [open, initialMode]);

    // 监听 ESC 关闭
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted || !open) return null;

    const googleUrl =
        process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL || '/service/auth/google';

    const onGoogle = () => {
        try {
            window.location.href = googleUrl;
        } catch (e) {
            console.error('Google OAuth redirect failed:', e);
        }
    };


    const resetForm = () => {
        setFormState({email: '', password: '', confirmPassword: ''});
        setError('');
    };

    const handleModeChange = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormState(prev => ({...prev, [name]: value}));
        if (error) setError('');
    };

    const validateForm = (): boolean => {
        const {email, password, confirmPassword} = formState;

        if (!email || !password) return setError('请填写邮箱和密码'), false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return setError('请输入有效的邮箱地址'), false;
        if (password.length < 6)
            return setError('密码长度至少为6位'), false;
        if (mode === 'signup' && password !== confirmPassword)
            return setError('两次输入的密码不一致'), false;

        return true;
    };

    const handleLogin = async (email: string, password: string) => {
        const req: LoginDTO = {email, password};
        const res = await login(req);
        onSuccess?.(res.user_detail);
        toast.success('登录成功');
        resetForm();
        onClose();
        router.push('/console');
    };

    const handleSignup = async (email: string, password: string) => {
        const payload: RegisterDTO = {email, password};
        await register(payload);
        toast.success('注册成功');
        setMode('login');
        setFormState(prev => ({
            email: prev.email,
            password: '',
            confirmPassword: '',
        }));
    };

    const handleSubmitSuccess = async (email: string, password: string) => {
        if (mode === 'login') {
            await handleLogin(email, password);
        } else {
            await handleSignup(email, password);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        try {
            await handleSubmitSuccess(formState.email, formState.password);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || '操作失败，请重试';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <div
                role="dialog"
                aria-modal="true"
                className="w-[92%] max-w-md rounded-2xl border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5
                   border-gray-200 p-5 md:p-6 relative
                   dark:bg-[#1f2125] dark:border-[#2a2c31] dark:text-gray-100 dark:ring-white/5"
            >
                <button
                    onClick={onClose}
                    aria-label="关闭"
                    className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#26292e]"
                >
                    ✕
                </button>

                <h2 className="text-xl md:text-2xl font-bold">
                    {mode === 'login' ? '登录' : '注册'}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'login'
                        ? '登录后可收藏内容并解锁更多功能'
                        : '创建一个新账户以开始使用我们的服务'}
                </p>

                {/* Google 登录 */}
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={onGoogle}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:bg-[#141518] dark:text-gray-100 dark:border-[#2a2c31]"
                    >
                        <GoogleIcon/>
                        使用 Google 登录
                    </button>

                    <div className="my-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-[#2a2c31]"/>
                        <span>或使用邮箱{mode === 'signup' ? '注册' : '登录'}</span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-[#2a2c31]"/>
                    </div>
                </div>

                {error && (
                    <div
                        className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">邮箱</label>
                        <input
                            type="email"
                            name="email"
                            value={formState.email}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="your@email.com"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500
               bg-white text-gray-900 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
               dark:bg-[#141518] dark:text-gray-100 dark:border-[#2a2c31]"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-[#2a2c31]">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm">密码</label>
                            {mode === 'login' && (
                                <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    忘记密码?
                                </a>
                            )}
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formState.password}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="•••••••"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500
               bg-white text-gray-900 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
               dark:bg-[#141518] dark:text-gray-100 dark:border-[#2a2c31]"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="pt-2 border-t border-gray-200 dark:border-[#2a2c31]">
                            <label className="block text-sm mb-1">确认密码</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formState.confirmPassword}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                placeholder="再次输入密码"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500
                 bg-white text-gray-900 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
                 dark:bg-[#141518] dark:text-gray-100 dark:border-[#2a2c31]"
                            />
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'login' ? (
                                <>
                                    没有账户？
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('signup')}
                                        disabled={loading}
                                        className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                                    >
                                        去注册
                                    </button>
                                </>
                            ) : (
                                <>
                                    已有账户？
                                    <button
                                        type="button"
                                        onClick={() => handleModeChange('login')}
                                        disabled={loading}
                                        className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                                    >
                                        去登录
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 text-sm font-medium border border-transparent
               hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {mode === 'login' ? '登录中...' : '注册中...'}
                                </>
                            ) : (
                                mode === 'login' ? '登录' : '注册'
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-500">
                    登录/注册即表示你同意用户协议和隐私政策
                </p>
            </div>
        </div>,
        document.body
    );
}
