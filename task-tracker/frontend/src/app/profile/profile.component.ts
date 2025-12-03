import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Profile } from '../core/models/profile.model';
import { ProfileService } from '../core/services/profile.service';
import { TaskService } from '../core/services/task.service';
import { Task } from '../core/models/task.model';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    PanelModule,
    TagModule,
    TableModule,
    TranslateModule
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