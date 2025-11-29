import apiClient from './client';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    is_verified: number;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
    otp_code: string; // Only in development
}

export interface VerifyResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Register new user
export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
    });
    return response.data;
};

// Verify OTP
export const verifyOTP = async (email: string, otp_code: string): Promise<VerifyResponse> => {
    const response = await apiClient.post('/auth/verify', {
        email,
        otp_code,
    });
    return response.data;
};

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    // OAuth2 password flow requires form data
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await apiClient.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

// Update profile
export const updateProfile = async (data: {
    name?: string;
    email?: string;
    bio?: string;
    avatar?: string;
}): Promise<User> => {
    const response = await apiClient.put('/auth/me', data);
    return response.data;
};

// Change password
export const changePassword = async (
    current_password: string,
    new_password: string,
    confirm_password: string
): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password', {
        current_password,
        new_password,
        confirm_password,
    });
    return response.data;
};

// Logout
export const logout = async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
};
