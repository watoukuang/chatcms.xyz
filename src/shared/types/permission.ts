export interface AccessState {
    hasPermission: boolean;
    reason?: string;
}

/**
 * 权限类型定义
 */
export type PermissionType =
    | 'login_required'      // 需要登录
    | 'publish_market'      // 发布到任务市场
    | 'submit_app'          // 提交智能应用
    | 'use_system_model'    // 使用系统内置模型
    | 'advanced_features'   // 高级功能
    | 'ai_generate'         // AI生成功能
    | 'local_data'          // 本地数据操作
    | 'browse_market';      // 浏览市场







