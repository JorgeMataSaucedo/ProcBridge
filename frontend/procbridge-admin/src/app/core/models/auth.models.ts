export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: UserInfo;
}

export interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

export interface RefreshTokenRequest {
    refreshToken: string;
}
