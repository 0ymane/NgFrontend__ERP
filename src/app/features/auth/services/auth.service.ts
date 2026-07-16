import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { LoginRequest, RegisterRequest, AuthResponse, CurrentUser } from '@shared/models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', request);
  }

  me(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>('/auth/me');
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {});
  }
}
