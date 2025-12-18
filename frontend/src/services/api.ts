import axios from 'axios';
import type { Post, PostCreate, Comment, CommentCreate, Vote, Token, LoginCredentials, RegisterData, UserResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<Token>('/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/admin/register', data);
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (limit = 10, skip = 0, search = ''): Promise<Post[]> => {
    const response = await api.get<Post[]>('/posts', {
      params: { limit, skip, search },
    });
    return response.data;
  },

  createPost: async (post: PostCreate): Promise<Post> => {
    const response = await api.post<Post>('/posts', post);
    return response.data;
  },

  updatePost: async (id: number, post: PostCreate): Promise<{ detail: string }> => {
    const response = await api.put<{ detail: string }>(`/posts/${id}`, post);
    return response.data;
  },

  deletePost: async (id: number): Promise<{ detail: string }> => {
    const response = await api.delete<{ detail: string }>(`/posts/${id}`);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/post/${postId}`);
    return response.data;
  },

  createComment: async (postId: number, comment: CommentCreate): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/?post_id=${postId}`, comment, {
      params: { post_id: postId },
    });
    return response.data;
  },
};

// Votes API
export const votesAPI = {
  vote: async (vote: Vote): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/vote/', vote);
    return response.data;
  },
};

export default api;

