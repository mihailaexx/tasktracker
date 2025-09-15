
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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
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
        },
        {
          label: 'Tags',
          icon: 'pi pi-tags',
          routerLink: '/tags'
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