import React from 'react';
import Link from 'next/link';
import {useAccess} from '@/src/shared/hooks/useAccess';
import {AccessState, PermissionType} from '@/src/shared/types/permission';

interface AccessProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
    permission?: PermissionType; // 指定需要检查的权限类型
    onUnauthorized?: () => void; // 无权限时的回调
}

const Access = ({
    children,
    fallback,
    showUpgradePrompt = true,
    permission,
    onUnauthorized
}: AccessProps) => {
    const {checkPermission} = useAccess();
    const {hasPermission, reason}: AccessState = checkPermission(permission);

    // 如果有权限，直接渲染子组件
    if (hasPermission) {
        return <>{children}</>;
    }

    // 触发无权限回调
    if (onUnauthorized) {
        onUnauthorized();
    }

    // 如果有自定义fallback，使用自定义
    if (fallback) {
        return <>{fallback}</>;
    }

    // 否则显示升级提示
    if (showUpgradePrompt) {
        return <UpgradePrompt reason={reason} permission={permission}/>;
    }

    return null;
};

interface UpgradePromptProps {
    reason?: string;
    permission?: PermissionType;
}

function UpgradePrompt({reason, permission}: UpgradePromptProps) {
    // 根据权限类型决定是否显示登录按钮还是升级按钮
    const needsLogin = permission === 'login_required' || permission === 'publish_market' || permission === 'submit_app';
    const needsUpgrade = permission === 'use_system_model' || permission === 'advanced_features';

    return (
        <div className="pt-4 mt-8 sm:mt-12 lg:mt-16 text-center">
            <div className="mb-4">
                <div
                    className="w-16 h-16 bg-gradient-to-r from-lime-500 to-lime-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lime-400/40 dark:shadow-transparent">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {needsLogin ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        )}
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {needsLogin ? '需要登录' : '需要升级访问权限'}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {reason || (needsLogin ? '请先登录以使用此功能' : '此功能需要付费订阅才能使用')}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {needsLogin ? (
                    <button
                        onClick={() => {
                            // TODO: 打开登录弹窗
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('openLoginModal'));
                            }
                        }}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] font-medium rounded-xl hover:from-lime-600 hover:to-lime-700 transition-all duration-300 shadow-lg shadow-lime-400/50 hover:shadow-lime-400/70"
                    >
                        立即登录
                    </button>
                ) : (
                    <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] font-medium rounded-xl hover:from-lime-600 hover:to-lime-700 transition-all duration-300 shadow-lg shadow-lime-400/50 hover:shadow-lime-400/70"
                    >
                        查看所有计划
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Access;
