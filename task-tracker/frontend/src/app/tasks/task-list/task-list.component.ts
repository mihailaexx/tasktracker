import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-task-list',
  template: `
    <div class="task-list-container">
      <div *ngIf="!isAuthenticated; else authenticatedView">
        <h2>Task List</h2>
        <p>Please log in to view and manage your tasks.</p>
        <div class="auth-actions">
          <button class="btn btn-primary" (click)="navigateToLogin()">Login</button>
          <button class="btn btn-secondary" (click)="navigateToRegister()">Register</button>
        </div>
      </div>
      
      <ng-template #authenticatedView>
        <div class="header">
          <h2>Tasks</h2>
          <button class="btn btn-primary" (click)="addTask()">Add Task</button>
        </div>
        
        <div class="filters">
          <button class="btn btn-secondary" [class.active]="filter === 'all'" (click)="filterTasks('all')">All</button>
          <button class="btn btn-secondary" [class.active]="filter === 'todo'" (click)="filterTasks('todo')">To Do</button>
          <button class="btn btn-secondary" [class.active]="filter === 'in_progress'" (click)="filterTasks('in_progress')">In Progress</button>
          <button class="btn btn-secondary" [class.active]="filter === 'done'" (click)="filterTasks('done')">Done</button>
        </div>
        
        <div class="task-list">
          <div class="task-item" *ngFor="let task of filteredTasks">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <span class="status" [class]="'status-' + task.status.toLowerCase()">{{ task.status }}</span>
            </div>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-footer">
              <span class="date">Updated: {{ task.updatedAt | date:'short' }}</span>
              <div class="actions">
                <button class="btn btn-sm btn-outline" (click)="editTask(task.id!)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="deleteTask(task.id!)">Delete</button>
              </div>
            </div>
          </div>
          
          <div class="no-tasks" *ngIf="filteredTasks.length === 0">
            <p>No tasks found.</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 20px 0;
    }
    
    .auth-actions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .filters .btn {
      padding: 8px 16px;
    }
    
    .filters .btn.active {
      background-color: #007bff;
      color: white;
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
    
    .task-header h3 {
      margin: 0;
      font-size: 1.2em;
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
    
    .actions {
      display: flex;
      gap: 10px;
    }
    
    .btn-sm {
      padding: 4px 8px;
      font-size: 0.9em;
    }
    
    .no-tasks {
      text-align: center;
      padding: 40px 0;
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
    
    .btn-secondary {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
    }
    
    .btn-secondary:hover {
      color: #fff;
      background-color: #5a6268;
      border-color: #545b62;
    }
    
    .btn-outline {
      color: #007bff;
      background-color: transparent;
      background-image: none;
      border-color: #007bff;
    }
    
    .btn-outline:hover {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }
    
    .btn-danger {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545;
    }
    
    .btn-danger:hover {
      color: #fff;
      background-color: #c82333;
      border-color: #bd2130;
    }
  `],
  imports: [
    NgIf,
    NgFor,
    DatePipe
  ]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filter: string = 'all';
  isAuthenticated = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
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

  addTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(id: number): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks(); // Reload the tasks list
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}