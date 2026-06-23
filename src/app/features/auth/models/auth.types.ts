export interface SignInRequest {
    email: string;
    password: string;
  }

  export interface SignUpRequest {
    email: string;
    password: string;
    confirmPassword: string;
  }

  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }

  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }

  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
