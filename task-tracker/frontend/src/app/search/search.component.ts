import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

import { Task } from '../core/models/task.model';
import { Tag } from '../core/models/tag.model';
import { TaskService } from '../core/services/task.service';
import { TagService } from '../core/services/tag.service';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-search',
    standalone: true,
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    imports: [
        CommonModule,
        DatePipe,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        TagModule,
        ConfirmDialogModule,
        TranslateModule
    ],
    providers: [ConfirmationService, MessageService]
})
export class SearchComponent implements OnInit {
    activeTab: 'tasks' | 'tags' = 'tasks';
    searchQuery: string = '';

    // Task search results
    taskResults: Task[] = [];
    filteredTaskResults: Task[] = [];
    taskFilter: string = 'all';

    // Tag search results
    tagResults: Tag[] = [];

    isAuthenticated = false;

    constructor(
        private taskService: TaskService,
        private tagService: TagService,
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
            }
        );

        // Check initial authentication status
        this.isAuthenticated = this.authService.isAuthenticated();
    }

    onSearch(): void {
        if (!this.searchQuery.trim()) {
            this.taskResults = [];
            this.filteredTaskResults = [];
            this.tagResults = [];
            return;
        }

        if (this.activeTab === 'tasks') {
            this.searchTasks();
        } else {
            this.searchTags();
        }
    }

    searchTasks(): void {
        this.taskService.searchTasks(this.searchQuery).subscribe({
            next: (tasks) => {
                this.taskResults = tasks;
                this.applyTaskFilter();
            },
            error: (error) => {
                console.error('Error searching tasks:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to search tasks'
                });
            }
        });
    }

    searchTags(): void {
        this.tagService.searchTags(this.searchQuery).subscribe({
            next: (tags) => {
                this.tagResults = tags;
            },
            error: (error) => {
                console.error('Error searching tags:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to search tags'
                });
            }
        });
    }

    switchTab(tab: 'tasks' | 'tags'): void {
        this.activeTab = tab;
        this.taskFilter = 'all'; // Reset filter when switching tabs
        this.onSearch(); // Re-run search for new tab
    }

    filterTasks(filter: string): void {
        this.taskFilter = filter;
        this.applyTaskFilter();
    }

    applyTaskFilter(): void {
        if (this.taskFilter === 'all') {
            this.filteredTaskResults = this.taskResults;
        } else {
            this.filteredTaskResults = this.taskResults.filter(task =>
                task.status.toLowerCase() === this.taskFilter
            );
        }
    }

    // Task actions
    editTask(id: number): void {
        this.router.navigate(['/tasks/edit', id]);
    }

    confirmDeleteTask(task: Task): void {
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
                this.onSearch(); // Refresh search results
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

    // Tag actions
    confirmDeleteTag(tag: Tag): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the tag "${tag.name}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteTag(tag.id!);
            }
        });
    }

    deleteTag(id: number): void {
        this.tagService.deleteTag(id).subscribe({
            next: () => {
                this.onSearch(); // Refresh search results
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tag deleted successfully'
                });
            },
            error: (error) => {
                console.error('Error deleting tag:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete tag'
                });
            }
        });
    }

    // Helper methods
    formatStatusDisplay(status: string): string {
        switch (status) {
            case 'TODO':
                return 'To Do';
            case 'IN_PROGRESS':
                return 'In Progress';
            case 'DONE':
                return 'Done';
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

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
    }
}
