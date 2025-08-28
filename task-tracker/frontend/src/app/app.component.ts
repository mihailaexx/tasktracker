
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-50">
      <p-menubar [model]="navItems" class="shadow-md">
        <ng-template #start>
          <div class="flex items-center px-4">
            <i class="pi pi-calendar-clock text-blue-500 text-2xl mr-2"></i>
            <span class="font-bold text-xl">Task Tracker</span>
          </div>
        </ng-template>
        <ng-template #end>
          <div class="flex items-center" *ngIf="isAuthenticated; else loginLinks">
            <span class="mr-4 text-gray-700">Hi, {{ username }}!</span>
            <p-button label="Logout" icon="pi pi-sign-out" (click)="logout()" severity="secondary" />
          </div>
          <ng-template #loginLinks>
            <div class="flex gap-2">
              <p-button label="Login" icon="pi pi-sign-in" routerLink="/login" [outlined]="true" />
              <p-button label="Register" icon="pi pi-user-plus" routerLink="/register" />
            </div>
          </ng-template>
        </ng-template>
      </p-menubar>
      <main class="container mx-auto p-4">
        <router-outlet></router-outlet>
      </main>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `],
  imports: [
    RouterLink,
    RouterOutlet,
    NgIf,
    MenubarModule,
    ButtonModule,
    ToastModule
  ]
})
export class AppComponent implements OnInit {
  title = 'task-tracker-frontend';
  isAuthenticated = false;
  username: string | null = null;
  navItems: MenuItem[] = [];

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
        this.updateNavItems();
      }
    );
    
    // Subscribe to username changes
    this.authService.username$.subscribe(
      username => {
        this.username = username;
        this.updateNavItems();
      }
    );
    
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    // Also get initial username
    this.username = this.authService.getCurrentUsername();
    
    // Initialize navigation items
    this.updateNavItems();
  }

  updateNavItems(): void {
    if (this.isAuthenticated) {
      this.navItems = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/profile'
        },
        {
          label: 'Tasks',
          icon: 'pi pi-check-square',
          routerLink: '/tasks'
        }
      ];
    } else {
      this.navItems = [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/profile'
        }
      ];
    }
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
        this.updateNavItems();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, we should still update the UI and navigate to login
        this.isAuthenticated = false;
        this.username = null;
        this.updateNavItems();
        this.router.navigate(['/login']);
      }
    });
  }
}