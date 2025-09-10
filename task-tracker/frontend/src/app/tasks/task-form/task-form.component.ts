import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TaskStatus} from '../../core/models/task.model';
import {TaskService} from '../../core/services/task.service';
import {TagService} from '../../core/services/tag.service';
import {AuthService} from '../../core/services/auth.service';
import {Tag} from '../../core/models/tag.model';
import {NgIf, NgClass} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {InputTextModule} from 'primeng/inputtext';
import {TextareaModule} from 'primeng/textarea';
import {SelectModule} from 'primeng/select';
import {MultiSelectModule} from 'primeng/multiselect';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgClass,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule
  ],
  providers: [MessageService]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  isAuthenticated = false;
  tags: Tag[] = [];
  selectedTags: number[] = [];

  statusOptions = [
    {label: 'To Do', value: TaskStatus.TODO},
    {label: 'In Progress', value: TaskStatus.IN_PROGRESS},
    {label: 'Done', value: TaskStatus.DONE}
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private tagService: TagService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.TODO],
      tagIds: [[]]
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
      // Load tags first
      this.loadTags();
      
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode = true;
        this.taskId = +id;
        this.loadTask(this.taskId);
      }
    }
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  loadTask(id: number): void {
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status
        });
        
        // Set selected tags if task has tags
        if (task.tags && task.tags.length > 0) {
          this.selectedTags = task.tags.map(tag => tag.id).filter(id => id !== undefined);
          this.taskForm.patchValue({
            tagIds: this.selectedTags
          });
        } else {
          this.selectedTags = [];
          this.taskForm.patchValue({
            tagIds: []
          });
        }
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

    const taskData = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      status: this.taskForm.value.status,
      tagIds: this.selectedTags.filter(id => id !== undefined)
    };

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