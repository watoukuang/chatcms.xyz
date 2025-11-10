import {ReactNode} from 'react';

export interface LayoutProps {
    children: ReactNode;
}


// API Mock 相关类型定义
export interface ApiMockConfig {
    id: string;
    name: string;
    description?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    path: string;
    request_headers?: Record<string, string>;
    request_params?: Record<string, any>;
    response_status: number;
    response_headers?: Record<string, string>;
    response_body: string;
    delay?: number; // 响应延迟（毫秒）
    status: 'active' | 'inactive';
    created_at: number;
    updated_at: number;
}

export interface NewApiMockConfig {
    name: string;
    description?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    path: string;
    request_headers?: Record<string, string>;
    request_params?: Record<string, any>;
    response_status: number;
    response_headers?: Record<string, string>;
    response_body: string;
    delay?: number;
}

export interface ApiTestRequest {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
}

export interface ApiTestResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: string;
}
