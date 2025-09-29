export interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  mail?: string;
  image?: string;
  isAdmin?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  surname: string;
  password: string;
  mail: string;
  image: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSession {
  sessionToken: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface SessionsResponse {
  success: boolean;
  message?: string;
  sessions?: UserSession[];
}

export interface UpdateUserInfoRequest {
  name?: string;
  surname?: string;
  mail?: string;
  image?: string;
}

export interface UpdateUserInfoResponse {
  success: boolean;
  message: string;
  user?: User;
}
