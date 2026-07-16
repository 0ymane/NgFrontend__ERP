import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AuthStorageService } from '@core/services/auth-storage.service';
import { LoginRequest, RegisterRequest, CurrentUser } from '@shared/models/auth';
import { ApiError } from '@shared/models/api-error';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private authService = inject(AuthService);
  private authStorage = inject(AuthStorageService);
  private router = inject(Router);

  // State Signals
  private _currentUser = signal<CurrentUser | null>(this.authStorage.getCurrentUser());
  private _loading = signal<boolean>(false);
  private _error = signal<ApiError | null>(null);

  // Public Selectors
  currentUser = this._currentUser.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  isAuthenticated = computed(() => !!this._currentUser());
  role = computed(() => this._currentUser()?.role ?? null);

  async login(credentials: LoginRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.authService.login(credentials));
      this.authStorage.setToken(response.token);

      const user: CurrentUser = {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
      };

      this.authStorage.setCurrentUser(user);
      this._currentUser.set(user);
      await this.router.navigate(['/']);
    } catch (err: any) {
      const apiError: ApiError = err;
      this._error.set(apiError);
      throw apiError;
    } finally {
      this._loading.set(false);
    }
  }

  async register(request: RegisterRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.authService.register(request));
      this.authStorage.setToken(response.token);

      const user: CurrentUser = {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
      };

      this.authStorage.setCurrentUser(user);
      this._currentUser.set(user);
      await this.router.navigate(['/']);
    } catch (err: any) {
      const apiError: ApiError = err;
      this._error.set(apiError);
      throw apiError;
    } finally {
      this._loading.set(false);
    }
  }

  async fetchMe(): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.me());
      this.authStorage.setCurrentUser(user);
      this._currentUser.set(user);
    } catch (err) {
      this.logout();
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
    } catch {
      // Ignored for graceful logout
    } finally {
      this.authStorage.clear();
      this._currentUser.set(null);
      this._error.set(null);
      await this.router.navigate(['/sign-in']);
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}
