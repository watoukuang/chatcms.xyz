import {useCallback} from 'react';
import {AccessState} from '../types/permission';


export function useAccess() {
    const checkPermission = useCallback((): AccessState => {
        // 不再需要登录或会员校验，始终允许访问
        return {hasPermission: true};
    }, []);

    return {
        loading: false,
        checkPermission,
        // 默认允许所有功能
        isFreePlan: false,
        isPaidPlan: true,
    };
}
