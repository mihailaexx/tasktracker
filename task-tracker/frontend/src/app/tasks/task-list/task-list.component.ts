import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { DatePipe, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-list',
  template: `
    <div class="p-4">
      <div *ngIf="!isAuthenticated; else authenticatedView">
        <div class="card shadow-lg">
          <div class="card-body text-center py-12">
            <i class="pi pi-lock text-6xl text-blue-500 mb-4"></i>
            <h2 class="text-2xl font-bold mb-2">Task List</h2>
            <p class="text-gray-600 mb-6">Please log in to view and manage your tasks.</p>
            <div class="flex justify-center gap-4">
              <p-button label="Login" icon="pi pi-sign-in" (click)="navigateToLogin()" />
              <p-button label="Register" icon="pi pi-user-plus" (click)="navigateToRegister()" severity="secondary" />
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #authenticatedView>
        <div class="mb-6 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-800">Tasks</h1>
          <p-button label="Add Task" icon="pi pi-plus" (click)="addTask()" />
        </div>
        
        <div class="card shadow-lg mb-6">
          <div class="card-body">
            <div class="flex flex-wrap gap-2 mb-4">
              <p-button label="All" [outlined]="filter !== 'all'" (click)="filterTasks('all')" />
              <p-button label="To Do" [outlined]="filter !== 'todo'" (click)="filterTasks('todo')" severity="warn" />
              <p-button label="In Progress" [outlined]="filter !== 'in_progress'" (click)="filterTasks('in_progress')" severity="info" />
              <p-button label="Done" [outlined]="filter !== 'done'" (click)="filterTasks('done')" severity="success" />
            </div>
            
            <p-table 
              [value]="filteredTasks" 
              [paginator]="true" 
              [rows]="10"
              responsiveLayout="scroll"
              styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-task>
                <tr>
                  <td class="font-medium">{{ task.title }}</td>
                  <td>{{ task.description }}</td>
                  <td>
                    <p-tag [severity]="getSeverity(task.status)" [value]="task.status"></p-tag>
                  </td>
                  <td>{{ task.updatedAt | date:'short' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <p-button icon="pi pi-pencil" (click)="editTask(task.id!)" styleClass="p-button-sm p-button-outlined" />
                      <p-button icon="pi pi-trash" (click)="confirmDelete(task)" styleClass="p-button-sm p-button-outlined p-button-danger" />
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center py-4">No tasks found.</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </ng-template>
    </div>
    
    <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
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
    CommonModule,
    DatePipe,
    ButtonModule,
    CardModule,
    TagModule,
    TableModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filter: string = 'all';
  isAuthenticated = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.loadTasks();
        }
      }
    );
    
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load tasks' 
        });
      }
    });
  }

  filterTasks(filter: string): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(task => 
        task.status.toLowerCase() === this.filter
      );
    }
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

  addTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(id: number): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  confirmDelete(task: Task): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the task "${task.title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTask(task.id!);
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks(); // Reload the tasks list
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Task deleted successfully' 
        });
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to delete task' 
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}