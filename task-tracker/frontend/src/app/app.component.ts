import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

import { HttpClient } from '@angular/common/http';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterLink,
    RouterOutlet,

    MenubarModule,
    ButtonModule,
    ToastModule,
    TranslateModule,
    LanguageSwitcherComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'task-tracker-frontend';
  isAuthenticated = false;
  username: string | null = null;
  role: string | null = null;
  navItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService
  ) {
    // Set default language
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      this.translate.use('en');
    }
  }

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

    // Subscribe to role changes
    this.authService.role$.subscribe(
      role => {
        this.role = role;
        this.updateNavItems();
      }
    );

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateNavItems();
    });

    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    // Also get initial username
    this.username = this.authService.getCurrentUsername();
    // Also get initial role
    this.role = this.authService.getCurrentRole();

    // Initialize navigation items
    this.updateNavItems();
  }

  updateNavItems(): void {
    if (this.isAuthenticated) {
      this.navItems = [
        {
          label: this.translate.instant('MENU.DASHBOARD'),
          icon: 'pi pi-home',
          routerLink: '/profile'
        },
        {
          label: this.translate.instant('MENU.SEARCH'),
          icon: 'pi pi-search',
          routerLink: '/search'
        },
        {
          label: this.translate.instant('MENU.TASKS'),
          icon: 'pi pi-check-square',
          routerLink: '/tasks'
        },
        {
          label: this.translate.instant('MENU.TAGS'),
          icon: 'pi pi-tags',
          routerLink: '/tags'
        }
      ];

      if (this.role === 'ADMIN') {
        this.navItems.push({
          label: 'Admin',
          icon: 'pi pi-cog',
          routerLink: '/admin'
        });
      }
    } else {
      this.navItems = [
        {
          label: this.translate.instant('MENU.HOME'),
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
        this.role = null;
        this.updateNavItems();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, we should still update the UI and navigate to login
        this.isAuthenticated = false;
        this.username = null;
        this.role = null;
        this.updateNavItems();
        this.router.navigate(['/login']);
      }
    });
  }
}
