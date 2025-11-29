import apiClient from './client';

export interface UploadResponse {
    url: string;
    filename: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    // Prepend API URL if the response is a relative path
    const url = response.data.url;
    if (url.startsWith('/')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        response.data.url = `${apiUrl}${url}`;
    }

    return response.data;
};
