import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Profile } from '../core/models/profile.model';
import { ProfileService } from '../core/services/profile.service';
import { TaskService } from '../core/services/task.service';
import { Task } from '../core/models/task.model';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  template: `
    <div class="p-4">
      <div *ngIf="!isAuthenticated; else authenticatedView">
        <div class="card shadow-lg">
          <div class="card-body text-center py-12">
            <i class="pi pi-home text-6xl text-blue-500 mb-4"></i>
            <h2 class="text-2xl font-bold mb-2">Welcome to Task Tracker</h2>
            <p class="text-gray-600 mb-6">Please log in or register to access your tasks and profile.</p>
            <div class="flex justify-center gap-4">
              <p-button label="Login" icon="pi pi-sign-in" (click)="navigateToLogin()" />
              <p-button label="Register" icon="pi pi-user-plus" (click)="navigateToRegister()" severity="secondary" />
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #authenticatedView>
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800">User Profile</h1>
          <p class="text-gray-600">Manage your profile information</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card shadow-lg">
            <div class="card-body">
              <h3 class="text-xl font-semibold mb-4">Profile Information</h3>
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="mb-4">
                  <label for="username" class="block text-gray-700 font-medium mb-2">Username</label>
                  <input 
                    pInputText
                    type="text" 
                    id="username" 
                    formControlName="username" 
                    class="w-full"
                    readonly>
                </div>
                
                <div class="mb-4">
                  <label for="firstName" class="block text-gray-700 font-medium mb-2">First Name</label>
                  <input 
                    pInputText
                    type="text" 
                    id="firstName" 
                    formControlName="firstName" 
                    class="w-full">
                </div>
                
                <div class="mb-4">
                  <label for="lastName" class="block text-gray-700 font-medium mb-2">Last Name</label>
                  <input 
                    pInputText
                    type="text" 
                    id="lastName" 
                    formControlName="lastName" 
                    class="w-full">
                </div>
                
                <div class="mb-6">
                  <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
                  <input 
                    pInputText
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    class="w-full"
                    [class.ng-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                  <small class="text-red-500" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                    Please enter a valid email address
                  </small>
                </div>
                
                <div class="flex justify-end">
                  <p-button 
                    type="submit" 
                    label="Update Profile" 
                    icon="pi pi-save"
                    [disabled]="profileForm.invalid || profileForm.pristine">
                  </p-button>
                </div>
              </form>
            </div>
          </div>
          
          <div class="card shadow-lg">
            <div class="card-body">
              <h3 class="text-xl font-semibold mb-4">Your Tasks</h3>
              <p-table 
                [value]="tasks" 
                [paginator]="true" 
                [rows]="5"
                responsiveLayout="scroll"
                styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-task>
                  <tr>
                    <td class="font-medium">{{ task.title }}</td>
                    <td>
                      <p-tag [severity]="getSeverity(task.status)" [value]="task.status"></p-tag>
                    </td>
                    <td>{{ task.updatedAt | date:'short' }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="3" class="text-center py-4">No tasks found.</td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
    }
    
    .card-body {
      padding: 1.5rem;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding: 1rem 1.5rem;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      font-weight: 600;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      border: 1px solid #dee2e6;
    }
    
    :host ::ng-deep .p-tag {
      font-weight: 500;
    }
  `],
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    PanelModule,
    TagModule,
    TableModule
  ],
  providers: [MessageService]
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
    private router: Router,
    private messageService: MessageService
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
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load profile' 
        });
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
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load tasks' 
        });
      }
    });
  }

  getSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'warn';
      case 'in_progress':
        return 'info';
      case 'done':
        return 'success';
      default:
        return 'info';
    }
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
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Profile updated successfully' 
        });
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to update profile' 
        });
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