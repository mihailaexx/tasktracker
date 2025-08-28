import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/services/auth.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-logout',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="card shadow-lg w-full max-w-md">
        <div class="card-body p-8 text-center">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Logging out...</h2>
          <p class="text-gray-600">Please wait while we securely log you out.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
    }
    
    .card-body {
      padding: 2rem;
    }
  `],
  imports: [CardModule]
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