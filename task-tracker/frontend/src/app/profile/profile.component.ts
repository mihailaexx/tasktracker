import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Profile } from '../core/models/profile.model';
import { ProfileService } from '../core/services/profile.service';
import { TaskService } from '../core/services/task.service';
import { Task } from '../core/models/task.model';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container">
      <div *ngIf="!isAuthenticated; else authenticatedView">
        <h2>Welcome to Task Tracker</h2>
        <p>Please log in or register to access your tasks and profile.</p>
        <div class="auth-actions">
          <button class="btn btn-primary" (click)="navigateToLogin()">Login</button>
          <button class="btn btn-secondary" (click)="navigateToRegister()">Register</button>
        </div>
      </div>
      
      <ng-template #authenticatedView>
        <h2>User Profile</h2>
        
        <div class="user-info">
          <h3>Hi, {{ username }}!</h3>
          <p>Here's your profile information and tasks:</p>
        </div>
        
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              class="form-control"
              readonly>
          </div>
          
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              formControlName="firstName" 
              class="form-control">
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              formControlName="lastName" 
              class="form-control">
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
            <div class="invalid-feedback" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="profileForm.invalid || profileForm.pristine">
              Update Profile
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px 0;
    }
    
    .auth-actions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }
    
    .user-info {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .user-info h3 {
      margin: 0 0 10px 0;
      color: #007bff;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
    }
    
    .form-control:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }
    
    .form-control:read-only {
      background-color: #f8f9fa;
    }
    
    .is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875em;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
    }
    
    .tasks-section {
      margin-top: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .tasks-section h3 {
      margin: 0;
    }
    
    .no-tasks {
      text-align: center;
      padding: 40px 0;
      color: #999;
    }
    
    .task-list {
      margin-top: 20px;
    }
    
    .task-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .task-header h4 {
      margin: 0;
      font-size: 1.1em;
    }
    
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
    }
    
    .status-todo {
      background-color: #ffc107;
      color: #212529;
    }
    
    .status-in_progress {
      background-color: #17a2b8;
      color: white;
    }
    
    .status-done {
      background-color: #28a745;
      color: white;
    }
    
    .task-description {
      margin-bottom: 15px;
      color: #666;
    }
    
    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
    
    .date {
      font-size: 0.9em;
      color: #999;
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
    
    .btn-primary {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }
    
    .btn-primary:hover {
      color: #fff;
      background-color: #0069d9;
      border-color: #0062cc;
    }
  `],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DatePipe
  ]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: Profile | null = null;
  tasks: Task[] = [];
  isAuthenticated = false;
  username: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.loadProfile();
          this.loadTasks();
        }
      }
    );
    
    // Subscribe to username
    this.authService.username$.subscribe(
      username => {
        this.username = username;
      }
    );
    
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: Profile) => {
        this.profile = profile;
        this.profileForm.patchValue(profile);
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks;
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.profile) {
      return;
    }

    const profileData = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      email: this.profileForm.get('email')?.value
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: (updatedProfile: Profile) => {
        this.profile = updatedProfile;
        this.profileForm.markAsPristine();
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
      }
    });
  }

  addTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}