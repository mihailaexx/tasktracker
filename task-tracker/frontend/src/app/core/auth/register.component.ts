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
  selector: 'app-register',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="card shadow-lg w-full max-w-md">
        <div class="card-body p-8">
          <div class="text-center mb-8">
            <i class="pi pi-user-plus text-4xl text-blue-500 mb-3"></i>
            <h1 class="text-2xl font-bold text-gray-800">Create Account</h1>
            <p class="text-gray-600">Sign up to get started</p>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="mb-5">
              <label for="username" class="block text-gray-700 font-medium mb-2">Username</label>
              <input 
                pInputText
                type="text" 
                id="username" 
                formControlName="username" 
                class="w-full"
                [class.ng-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
              <small class="text-red-500" *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
                <div *ngIf="registerForm.get('username')?.errors?.['required']">Username is required</div>
                <div *ngIf="registerForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</div>
              </small>
            </div>
            
            <div class="mb-5">
              <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
              <input 
                pInputText
                type="email" 
                id="email" 
                formControlName="email" 
                class="w-full"
                [class.ng-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <small class="text-red-500" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</div>
              </small>
            </div>
            
            <div class="mb-5">
              <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
              <p-password 
                id="password" 
                formControlName="password" 
                class="w-full"
                [class.ng-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                [feedback]="true"
                toggleMask="true">
              </p-password>
              <small class="text-red-500" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
                <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</div>
              </small>
            </div>
            
            <div class="mb-6">
              <label for="confirmPassword" class="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <p-password 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="w-full"
                [class.ng-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                [feedback]="false"
                toggleMask="true">
              </p-password>
              <small class="text-red-500" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</div>
              </small>
              <small class="text-red-500" *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched">
                Passwords do not match
              </small>
            </div>
            
            <div class="mb-6">
              <p-button 
                type="submit" 
                label="Sign Up" 
                icon="pi pi-user-plus"
                class="w-full"
                [disabled]="registerForm.invalid">
              </p-button>
            </div>
          </form>
          
          <div class="text-center border-t border-gray-200 pt-6">
            <p class="text-gray-600">
              Already have an account? 
              <a class="text-blue-500 hover:underline cursor-pointer font-medium" (click)="navigateToLogin()">
                Sign in here
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
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const userData = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };

    this.authService.register(userData).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Registration successful! You can now log in.' 
          });
          this.router.navigate(['/login']);
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: response.message 
          });
        }
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Registration failed. Please try again.' 
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}