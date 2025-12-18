export type Role = "admin" | "blog_writer" | "viewer";

export const RoleEnum = {
  admin: "admin" as Role,
  blog_writer: "blog_writer" as Role,
  viewer: "viewer" as Role,
} as const;

export interface User {
  id: number;
  email: string;
  role?: Role;
}

export interface UserResponse {
  id: number;
  email: string;
  role: Role;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  owner_id: number;
  owner: User;
  vote?: number;
  photo_path?: string | null;
}

export interface PostCreate {
  title: string;
  content: string;
  published?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  user: User;
}

export interface CommentCreate {
  text: string;
}

export interface Vote {
  post_id: number;
  dir: number; // 1 to add, 0 to remove
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: Role;
}

