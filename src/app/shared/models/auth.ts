export interface AuthResponse {
  userId: number;
  email: string;
  name: string | null;
  role: 'CLIENT' | 'SUPPORT' | 'ADMIN';
  token: string;
  expiresAt: string;
}

export interface CurrentUser {
  userId: number;
  email: string;
  name: string | null;
  role: 'CLIENT' | 'SUPPORT' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}
