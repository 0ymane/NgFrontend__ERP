export type UserRole = 'CLIENT' | 'SUPPORT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface UpdateRoleRequest {
  role: UserRole;
}
