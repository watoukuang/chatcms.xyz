// API Mock 配置管理相关接口

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 获取所有 Mock 配置
export async function getMockConfigs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取 Mock 配置失败:', error);
        throw error;
    }
}

// 创建新的 Mock 配置
export async function createMockConfig(config: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('创建 Mock 配置失败:', error);
        throw error;
    }
}

// 更新 Mock 配置
export async function updateMockConfig(id: string, config: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('更新 Mock 配置失败:', error);
        throw error;
    }
}

// 删除 Mock 配置
export async function deleteMockConfig(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('删除 Mock 配置失败:', error);
        throw error;
    }
}

// 获取单个 Mock 配置
export async function getMockConfig(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取 Mock 配置失败:', error);
        throw error;
    }
}

// 切换 Mock 配置状态
export async function toggleMockStatus(id: string, status: 'active' | 'inactive') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/mocks/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('切换 Mock 状态失败:', error);
        throw error;
    }
}
