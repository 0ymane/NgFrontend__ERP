import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '@shared/models/api-error';

export const API_BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    return this.http
      .get<T>(`${API_BASE}${path}`, { params: this.buildParams(params) })
      .pipe(catchError((err) => throwError(() => this.normalizeError(err))));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${API_BASE}${path}`, body)
      .pipe(catchError((err) => throwError(() => this.normalizeError(err))));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${API_BASE}${path}`, body)
      .pipe(catchError((err) => throwError(() => this.normalizeError(err))));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${API_BASE}${path}`, body)
      .pipe(catchError((err) => throwError(() => this.normalizeError(err))));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${API_BASE}${path}`)
      .pipe(catchError((err) => throwError(() => this.normalizeError(err))));
  }

  private buildParams(params?: Record<string, string | number | boolean | undefined | null>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }

  private normalizeError(error: HttpErrorResponse): ApiError {
    if (error.error && typeof error.error === 'object') {
      return {
        status: error.error.status ?? error.status,
        message: error.error.message ?? error.message,
        code: error.error.code ?? 'UNKNOWN_ERROR',
        timestamp: error.error.timestamp ?? new Date().toISOString(),
        path: error.error.path ?? '',
        errors: error.error.errors,
      };
    }
    return {
      status: error.status,
      message: error.message,
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      path: '',
    };
  }
}
