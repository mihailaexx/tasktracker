import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="card shadow-lg w-full max-w-md">
        <div class="card-body p-8">
          <div class="text-center mb-8">
            <i class="pi pi-sign-in text-4xl text-blue-500 mb-3"></i>
            <h1 class="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p class="text-gray-600">Sign in to your account</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-5">
              <label for="username" class="block text-gray-700 font-medium mb-2">Username</label>
              <input 
                pInputText
                type="text" 
                id="username" 
                formControlName="username" 
                class="w-full"
                [class.ng-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              <small class="text-red-500" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                Username is required
              </small>
            </div>
            
            <div class="mb-6">
              <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
              <p-password 
                id="password" 
                formControlName="password" 
                class="w-full"
                [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                [feedback]="false"
                toggleMask="true">
              </p-password>
              <small class="text-red-500" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Password is required
              </small>
            </div>
            
            <div class="mb-6">
              <p-button 
                type="submit" 
                label="Sign In" 
                icon="pi pi-sign-in"
                class="w-full"
                [disabled]="loginForm.invalid">
              </p-button>
            </div>
          </form>
          
          <div class="text-center border-t border-gray-200 pt-6">
            <p class="text-gray-600">
              Don't have an account? 
              <a class="text-blue-500 hover:underline cursor-pointer font-medium" (click)="navigateToRegister()">
                Register here
              </a>
            </p>
          </div>
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
    
    :host ::ng-deep .p-password input {
      width: 100%;
    }
  `],
  imports: [
    ReactiveFormsModule,
    NgIf,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule
  ],
  providers: [MessageService]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const credentials = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Login successful!' 
          });
          this.router.navigate(['/profile']);
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: response.message 
          });
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Login failed. Please try again.' 
        });
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}