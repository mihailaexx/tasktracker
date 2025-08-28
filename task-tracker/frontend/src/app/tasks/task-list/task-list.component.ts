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
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
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