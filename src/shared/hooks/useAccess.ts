import {useCallback, useMemo} from 'react';
import {AccessState, PermissionType} from '../types/permission';
import {useAuth} from './useAuth';

export function useAccess() {
    const {isAuthenticated, userDetail, isLoading} = useAuth();

    // 判断是否为付费用户
    const isPaidPlan = useMemo(() => {
        if (!isAuthenticated || !userDetail) return false;
        // vip 字段：'free' | 'pro' | 'premium' 等
        return userDetail.vip !== 'free';
    }, [isAuthenticated, userDetail]);

    const isFreePlan = useMemo(() => {
        if (!isAuthenticated) return true; // 未登录视为免费
        return userDetail?.vip === 'free';
    }, [isAuthenticated, userDetail]);

    /**
     * 检查特定权限
     * @param permission 权限类型
     */
    const checkPermission = useCallback((permission?: PermissionType): AccessState => {
        // 如果未指定权限类型，默认检查登录状态
        if (!permission) {
            return {
                hasPermission: isAuthenticated,
                reason: isAuthenticated ? undefined : '请先登录以使用此功能'
            };
        }

        switch (permission) {
            case 'login_required':
                return {
                    hasPermission: isAuthenticated,
                    reason: isAuthenticated ? undefined : '请先登录以使用此功能'
                };

            case 'publish_market':
                // 发布到任务市场需要登录
                return {
                    hasPermission: isAuthenticated,
                    reason: isAuthenticated ? undefined : '发布任务到市场需要登录账户'
                };

            case 'submit_app':
                // 提交智能应用需要登录
                return {
                    hasPermission: isAuthenticated,
                    reason: isAuthenticated ? undefined : '提交智能应用需要登录账户'
                };

            case 'use_system_model':
                // 使用系统内置模型需要付费
                return {
                    hasPermission: isPaidPlan,
                    reason: isPaidPlan ? undefined : '使用系统内置AI模型需要升级到付费版本'
                };

            case 'advanced_features':
                // 高级功能需要付费
                return {
                    hasPermission: isPaidPlan,
                    reason: isPaidPlan ? undefined : '此功能为高级功能，需要升级到付费版本'
                };

            case 'ai_generate':
                // AI生成功能：未登录可用（需配置API Key），登录用户可用
                return {
                    hasPermission: true,
                    reason: undefined
                };

            case 'local_data':
                // 本地数据操作：所有用户可用
                return {
                    hasPermission: true,
                    reason: undefined
                };

            case 'browse_market':
                // 浏览市场：所有用户可用
                return {
                    hasPermission: true,
                    reason: undefined
                };

            default:
                return {
                    hasPermission: false,
                    reason: '未知权限类型'
                };
        }
    }, [isAuthenticated, isPaidPlan]);

    return {
        loading: isLoading,
        checkPermission,
        isFreePlan,
        isPaidPlan,
        isAuthenticated,
        userDetail,
    };
}
