import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-form',
  template: `
    <div class="p-4">
      <div *ngIf="!isAuthenticated; else authenticatedView">
        <div class="card shadow-lg">
          <div class="card-body text-center py-12">
            <i class="pi pi-lock text-6xl text-blue-500 mb-4"></i>
            <h2 class="text-2xl font-bold mb-2">Task Form</h2>
            <p class="text-gray-600 mb-6">Please log in to create or edit tasks.</p>
            <div class="flex justify-center gap-4">
              <p-button label="Login" icon="pi pi-sign-in" (click)="navigateToLogin()" />
              <p-button label="Register" icon="pi pi-user-plus" (click)="navigateToRegister()" severity="secondary" />
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #authenticatedView>
        <div class="card shadow-lg max-w-2xl mx-auto">
          <div class="card-body">
            <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Edit Task' : 'Create Task' }}</h1>
            
            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
              <div class="mb-4">
                <label for="title" class="block text-gray-700 font-medium mb-2">Title *</label>
                <input 
                  pInputText
                  type="text" 
                  id="title" 
                  formControlName="title" 
                  class="w-full"
                  [class.ng-invalid]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
                <small class="text-red-500" *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
                  Title is required
                </small>
              </div>
              
              <div class="mb-4">
                <label for="description" class="block text-gray-700 font-medium mb-2">Description</label>
                <textarea 
                  pTextarea
                  id="description" 
                  formControlName="description" 
                  class="w-full"
                  rows="4"></textarea>
              </div>
              
              <div class="mb-6">
                <label for="status" class="block text-gray-700 font-medium mb-2">Status</label>
                <p-select 
                  [options]="statusOptions" 
                  formControlName="status" 
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full">
                </p-select>
              </div>
              
              <div class="flex justify-end gap-3">
                <p-button 
                  type="button" 
                  label="Cancel" 
                  icon="pi pi-times"
                  (click)="cancel()"
                  severity="secondary">
                </p-button>
                <p-button 
                  type="submit" 
                  [label]="isEditMode ? 'Update' : 'Create'"
                  icon="pi pi-save"
                  [disabled]="taskForm.invalid">
                </p-button>
              </div>
            </form>
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
  `],
  imports: [
    ReactiveFormsModule,
    NgIf,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule
  ],
  providers: [MessageService]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  isAuthenticated = false;
  
  statusOptions = [
    { label: 'To Do', value: TaskStatus.TODO },
    { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
    { label: 'Done', value: TaskStatus.DONE }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.TODO]
    });
  }

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      }
    );
    
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode = true;
        this.taskId = +id;
        this.loadTask(this.taskId);
      }
    }
  }

  loadTask(id: number): void {
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue(task);
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load task' 
        });
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const taskData = this.taskForm.value;

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Task updated successfully' 
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to update task' 
          });
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Task created successfully' 
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to create task' 
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}