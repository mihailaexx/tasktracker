import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  template: `
    <div class="logout-container">
      <h2>Logging out...</h2>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
    }
  `]
})
export class LogoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.logout().subscribe({
      next: (response: AuthResponse) => {
        this.router.navigate(['/profile']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.router.navigate(['/profile']);
      }
    });
  }
}