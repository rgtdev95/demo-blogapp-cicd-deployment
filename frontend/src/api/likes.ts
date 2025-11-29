import apiClient from './client';

export interface LikeStatus {
    is_liked: boolean;
    likes_count: number;
}

export interface BookmarkStatus {
    is_bookmarked: boolean;
}

// Toggle like on post
export const toggleLike = async (postId: number): Promise<LikeStatus> => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
};

// Get like status
export const getLikeStatus = async (postId: number): Promise<LikeStatus> => {
    const response = await apiClient.get(`/posts/${postId}/like-status`);
    return response.data;
};

// Unlike post
export const unlikePost = async (postId: number): Promise<LikeStatus> => {
    const response = await apiClient.delete(`/posts/${postId}/like`);
    return response.data;
};

// Toggle bookmark on post
export const toggleBookmark = async (postId: number): Promise<BookmarkStatus> => {
    const response = await apiClient.post(`/posts/${postId}/bookmark`);
    return response.data;
};

// Get bookmark status
export const getBookmarkStatus = async (postId: number): Promise<BookmarkStatus> => {
    const response = await apiClient.get(`/posts/${postId}/bookmark-status`);
    return response.data;
};

// Remove bookmark
export const removeBookmark = async (postId: number): Promise<BookmarkStatus> => {
    const response = await apiClient.delete(`/posts/${postId}/bookmark`);
    return response.data;
};
