import { Injectable } from '@angular/core';
import { CurrentUser } from '@shared/models/auth';

const TOKEN_KEY = 'jwt';
const USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: CurrentUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearCurrentUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  clear(): void {
    this.clearToken();
    this.clearCurrentUser();
  }
}
