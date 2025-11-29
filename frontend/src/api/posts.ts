import apiClient from './client';

export interface Author {
    id: number;
    name: string;
    avatar?: string;
}

export interface Post {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    cover_image?: string;
    published_at?: string;
    read_time: number;
    is_draft: boolean;
    seo_title?: string;
    seo_description?: string;
    author_id: number;
    author: Author;
    tags: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

export interface PostListResponse {
    posts: Post[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface CreatePostData {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    seo_title?: string;
    seo_description?: string;
    is_draft: boolean;
    tags: string[];
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    seo_title?: string;
    seo_description?: string;
    is_draft?: boolean;
    tags?: string[];
}

// Get public posts (paginated)
export const getPosts = async (page: number = 1, page_size: number = 12): Promise<PostListResponse> => {
    const response = await apiClient.get('/posts', {
        params: { page, page_size },
    });
    return response.data;
};

// Get current user's posts (including drafts)
export const getMyPosts = async (page: number = 1, page_size: number = 12): Promise<PostListResponse> => {
    const response = await apiClient.get('/posts/my-posts', {
        params: { page, page_size },
    });
    return response.data;
};

// Get single post by ID
export const getPost = async (id: number): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
};

// Create new post
export const createPost = async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
};

// Update post
export const updatePost = async (id: number, data: UpdatePostData): Promise<Post> => {
    const response = await apiClient.put(`/posts/${id}`, data);
    return response.data;
};

// Delete post
export const deletePost = async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
};
