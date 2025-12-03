import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    ConfirmDialogModule,
    TranslateModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filter: string = 'all';
  isAuthenticated = false;
  userId: number | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService
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

    // Check for userId query param
    this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.userId = +params['userId'];
        this.loadTasks();
      }
    });
  }

  loadTasks(): void {
    const userId = this.userId ? this.userId : undefined;
    this.taskService.getTasks(userId).subscribe({
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

  formatStatusDisplay(status: string): string {
    switch (status) {
      case 'TODO':
        return this.translate.instant('TASKS.STATUS.TODO');
      case 'IN_PROGRESS':
        return this.translate.instant('TASKS.STATUS.IN_PROGRESS');
      case 'DONE':
        return this.translate.instant('TASKS.STATUS.DONE');
      default:
        return status;
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
      message: this.translate.instant('TASKS.CONFIRM_DELETE'),
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