export interface UserDetail {
    id: string;
    email: string;
    vip: string;
    username?: string | null;
    created: string; // ISO date string
    updated: string; // ISO date string
}

export interface AuthVO {
    token: string;
    user_detail: UserDetail;
    expiresIn?: number;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface AuthState {
    userDetail: UserDetail | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}