import apiClient from './client';

export interface CommentAuthor {
    id: number;
    name: string;
    avatar?: string;
}

export interface Comment {
    id: number;
    content: string;
    post_id: number;
    author_id: number;
    author: CommentAuthor;
    created_at: string;
}

// Get comments for a post
export const getPostComments = async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/post/${postId}`);
    return response.data;
};

// Add comment to post
export const addComment = async (postId: number, content: string): Promise<Comment> => {
    const response = await apiClient.post('/comments', {
        post_id: postId,
        content,
    });
    return response.data;
};

// Delete comment
export const deleteComment = async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
};
