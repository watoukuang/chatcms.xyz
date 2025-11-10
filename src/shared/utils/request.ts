import {R} from '@/src/shared/types/response';

interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    skipErrorHandler?: boolean;
}

class RequestService {
    private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8086';

    private async request<T>(url: string, options: RequestInit & RequestConfig = {}): Promise<R<T>> {
        const {headers = {}, timeout = 10000, skipErrorHandler, ...fetchOptions} = options;

        // 构建请求头
        const reqHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        Object.assign(reqHeaders, headers);
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) reqHeaders.Authorization = `Bearer ${token}`;
        }

        // 超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const {credentials, ...restFetchOptions} = fetchOptions as RequestInit;
            const response = await fetch(`${this.baseURL}${url}`, {
                ...restFetchOptions,
                headers: reqHeaders,
                credentials: credentials ?? 'include',
                signal: controller.signal,
            });

            // 后端统一返回 { success, data, message, code }
            let parsed: R<T> | null = null;
            try {
                parsed = await response.json();
            } catch {
                parsed = null;
            }

            // 错误处理：统一返回结构，而不是直接抛错（401 仍特殊处理）
            if (!response.ok) {
                const errMsg = (parsed && typeof parsed === 'object' && (parsed as any).message)
                    ? (parsed as any).message as string
                    : `请求失败 (${response.status})`;
                if (response.status === 401) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_detail');
                        try {
                            window.dispatchEvent(new Event('authChanged'));
                        } catch {
                        }
                    }
                    return {success: false, data: null, message: '登录已过期，请重新登录', code: 401} as R<T>;
                }
                return {success: false, data: null, message: errMsg, code: response.status} as R<T>;
            }

            // 直接返回后端统一结构
            if (parsed && typeof parsed === 'object' && 'success' in parsed) {
                return parsed as R<T>;
            }
            // 极端情况（无可解析内容）
            return {success: true, data: null, message: null, code: null};
        } catch (error: any) {
            if (error.name === 'AbortError') throw new Error('请求超时');
            if (!skipErrorHandler) console.error('Request error:', error);
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    get<T>(url: string, config?: RequestConfig): Promise<R<T>> {
        const separator = url.includes('?') ? '&' : '?';
        return this.request<T>(`${url}${separator}_t=${Date.now()}`, {method: 'GET', ...config});
    }

    post<T>(url: string, data?: any, config?: RequestConfig): Promise<R<T>> {
        return this.request<T>(url, {method: 'POST', body: data ? JSON.stringify(data) : undefined, ...config});
    }

    put<T>(url: string, data?: any, config?: RequestConfig): Promise<R<T>> {
        return this.request<T>(url, {method: 'PUT', body: data ? JSON.stringify(data) : undefined, ...config});
    }

    delete<T>(url: string, config?: RequestConfig): Promise<R<T>> {
        return this.request<T>(url, {method: 'DELETE', ...config});
    }

    patch<T>(url: string, data?: any, config?: RequestConfig): Promise<R<T>> {
        return this.request<T>(url, {method: 'PATCH', body: data ? JSON.stringify(data) : undefined, ...config});
    }

    upload<T>(url: string, formData: FormData, config?: RequestConfig): Promise<R<T>> {
        const {headers = {}, ...restConfig} = config || {};
        const uploadHeaders = {...headers};
        delete uploadHeaders['Content-Type'];
        return this.request<T>(url, {method: 'POST', body: formData, headers: uploadHeaders, ...restConfig});
    }
}

// 创建请求实例
const request = new RequestService();

export default request;

// 导出常用方法
export const {get, post, put, delete: del, patch, upload} = request;
