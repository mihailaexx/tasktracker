import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, User } from '../core/services/admin.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, TooltipModule, TranslateModule],
    providers: [MessageService],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    users: User[] = [];
    loading = false;

    constructor(
        private adminService: AdminService,
        private messageService: MessageService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getAllUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
                this.loading = false;
            }
        });
    }

    toggleEnabled(user: User) {
        this.adminService.toggleUserEnabled(user.id).subscribe({
            next: (updatedUser) => {
                const index = this.users.findIndex(u => u.id === updatedUser.id);
                if (index !== -1) {
                    this.users[index] = updatedUser;
                }
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `User ${updatedUser.username} ${updatedUser.enabled ? 'enabled' : 'disabled'}` });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user status' });
            }
        });
    }

    viewUserTasks(user: User) {
        this.router.navigate(['/tasks'], { queryParams: { userId: user.id } });
    }

    viewUserTags(user: User) {
        this.router.navigate(['/tags'], { queryParams: { userId: user.id } });
    }
}
