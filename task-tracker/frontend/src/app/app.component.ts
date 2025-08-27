
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <header>
        <h1>Task Tracker</h1>
        <nav>
          <button class="nav-btn" routerLink="/tasks" routerLinkActive="active">Tasks</button>
          <div class="auth-links" *ngIf="isAuthenticated; else loginLinks">
            <button class="nav-btn user-profile-link" routerLink="/profile" routerLinkActive="active">
              <span class="welcome">Hi, {{ username }}!</span>
            </button>
            <button class="btn btn-secondary" (click)="logout()">Logout</button>
          </div>
          <ng-template #loginLinks>
            <button class="nav-btn" routerLink="/login">Login</button>
            <button class="nav-btn" routerLink="/register">Register</button>
          </ng-template>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    
    nav {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .nav-btn {
      background: none;
      border: none;
      text-decoration: none;
      color: #333;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease-in-out;
    }
    
    .nav-btn.active {
      background-color: #007bff;
      color: white;
    }
    
    .nav-btn:hover {
      background-color: #f8f9fa;
    }
    
    .nav-btn.active:hover {
      background-color: #0056b3;
    }
    
    .auth-links {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .welcome {
      color: #007bff;
      font-weight: bold;
      font-size: 1.1em;
    }
    
    .user-profile-link {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      background-color: #f8f9fa;
      transition: all 0.2s ease-in-out;
      border: none;
      cursor: pointer;
    }
    
    .user-profile-link:hover {
      background-color: #e9ecef;
    }
    
    .user-profile-link.active {
      background-color: #007bff;
      color: white;
    }
    
    .user-profile-link.active .welcome {
      color: white;
    }
    
    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      cursor: pointer;
    }
    
    .btn:focus {
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
    }
    
    .btn-secondary:hover {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62;
    }
  `],
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgIf
  ]
})
export class AppComponent implements OnInit {
  title = 'task-tracker-frontend';
  isAuthenticated = false;
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Fetch CSRF token on app initialization
    this.fetchCsrfToken();
    
    // Subscribe to authentication status changes
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
    
    // Subscribe to username changes
    this.authService.username$.subscribe(
      username => {
        this.username = username;
      }
    );
    
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    // Also get initial username
    this.username = this.authService.getCurrentUsername();
  }

  fetchCsrfToken(): void {
    // Make a request to the CSRF endpoint to ensure the token cookie is set
    this.http.get('/api/csrf', { responseType: 'text' }).subscribe({
      next: () => {
        console.log('CSRF token fetched successfully');
      },
      error: (error) => {
        console.error('Error fetching CSRF token:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Update local state immediately
        this.isAuthenticated = false;
        this.username = null;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, we should still update the UI and navigate to login
        this.isAuthenticated = false;
        this.username = null;
        this.router.navigate(['/login']);
      }
    });
  }
}