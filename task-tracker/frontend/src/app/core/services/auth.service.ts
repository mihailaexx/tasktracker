import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string | null;
  username: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private usernameSubject = new BehaviorSubject<string | null>(null);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check initial authentication status
    this.checkAuthStatus();
  }

  register(userData: { username: string, password: string, email: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.isAuthenticatedSubject.next(true);
          this.usernameSubject.next(response.username);
        }
      })
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.usernameSubject.next(null);
      }),
      catchError((error) => {
        // Even if there's an error, we should still update the UI
        this.isAuthenticatedSubject.next(false);
        this.usernameSubject.next(null);
        // Return a successful response to the caller
        return of({ success: true, message: 'Logout successful', token: null, username: null });
      })
    );
  }

  getCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success) {
          this.isAuthenticatedSubject.next(true);
          this.usernameSubject.next(response.username);
        } else {
          this.isAuthenticatedSubject.next(false);
          this.usernameSubject.next(null);
        }
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        this.usernameSubject.next(null);
        return of({ success: false, message: 'Not authenticated', token: null, username: null });
      })
    );
  }

  private checkAuthStatus(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this.isAuthenticatedSubject.next(true);
          this.usernameSubject.next(response.username);
        }
      },
      error: () => {
        this.isAuthenticatedSubject.next(false);
        this.usernameSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  
  getCurrentUsername(): string | null {
    return this.usernameSubject.value;
  }
}