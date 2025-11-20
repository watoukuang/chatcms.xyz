import React from 'react';
import Link from 'next/link';
import {useAccess} from '@/src/shared/hooks/useAccess';
import {AccessState} from '@/src/shared/types/permission';

interface AccessProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
}

const Access = ({children, fallback, showUpgradePrompt = true}: AccessProps) => {
    const {checkPermission} = useAccess();
    const {hasPermission, reason}: AccessState = checkPermission();
    if (hasPermission) {
        return <>{children}</>;
    }
    if (fallback) {
        return <>{fallback}</>;
    }
    if (showUpgradePrompt) {
        return <UpgradePrompt reason={reason}/>;
    }
    return null;
};

interface UpgradePromptProps {
    reason?: string;
}

function UpgradePrompt({reason}: UpgradePromptProps) {

    return (
        <div className="pt-4 mt-8 sm:mt-12 lg:mt-16 text-center">
            <div className="mb-4">
                <div
                    className="w-16 h-16 bg-gradient-to-r from-lime-500 to-lime-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lime-400/40 dark:shadow-transparent">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    需要升级访问权限
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6">{reason || '此功能需要付费订阅才能使用'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-[#0f1115] font-medium rounded-xl hover:from-lime-600 hover:to-lime-700 transition-all duration-300 shadow-lg shadow-lime-400/50 hover:shadow-lime-400/70"
                >
                    查看所有计划
                </Link>
            </div>
        </div>
    );
}

export default Access;
