import React, {useState, useEffect} from 'react';
import {useAuth} from '@/src/shared/hooks/useAuth';
import {login, register} from '@/src/shared/service/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'login' | 'register';
}

export default function AuthModal({isOpen, onClose, defaultMode = 'login'}: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const {login: authLogin} = useAuth();

    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    useEffect(() => {
        if (!isOpen) {
            // 重置表单
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 验证
        if (!email || !password) {
            setError('请填写所有必填字段');
            return;
        }

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setError('两次输入的密码不一致');
                return;
            }
            if (password.length < 6) {
                setError('密码长度至少为6位');
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const response = await login({email, password});
                authLogin(response.user_detail, response.token);
                onClose();
            } else {
                await register({email, password, confirmPassword});
                setError('');
                // 注册成功后自动登录
                const response = await login({email, password});
                authLogin(response.user_detail, response.token);
                onClose();
            }
        } catch (err: any) {
            setError(err.message || (mode === 'login' ? '登录失败' : '注册失败'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <div className="p-8">
                    {/* 标题 */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {mode === 'login' ? '欢迎回来' : '创建账户'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {mode === 'login' ? '登录以使用完整功能' : '注册以开始使用'}
                        </p>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                邮箱
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                密码
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    确认密码
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] font-medium rounded-xl hover:from-lime-600 hover:to-lime-700 transition-all duration-300 shadow-lg shadow-lime-400/50 hover:shadow-lime-400/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
                        </button>
                    </form>

                    {/* 切换模式 */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'login' ? '还没有账户？' : '已有账户？'}
                            <button
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError('');
                                }}
                                className="ml-2 text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 font-medium"
                            >
                                {mode === 'login' ? '立即注册' : '立即登录'}
                            </button>
                        </p>
                    </div>

                    {/* 第三方登录 (占位) */}
                    {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">或</span>
                                </div>
                            </div>

                            <a
                                href={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">使用 Google 登录</span>
                            </a>
                        </>
                    )}

                    {/* 用户协议 */}
                    <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                        继续即表示您同意我们的
                        <a href="#" className="text-lime-600 dark:text-lime-400 hover:underline">用户协议</a>
                        和
                        <a href="#" className="text-lime-600 dark:text-lime-400 hover:underline">隐私政策</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
