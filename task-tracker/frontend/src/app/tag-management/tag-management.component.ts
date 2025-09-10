import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Tag, TagRequest } from '../core/models/tag.model';
import { TagService } from '../core/services/tag.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  templateUrl: './tag-management.component.html',
  styleUrls: ['./tag-management.component.css'],
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    ColorPickerModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class TagManagementComponent implements OnInit {
  tags: Tag[] = [];
  tagForm: FormGroup;
  showTagDialog = false;
  isEditMode = false;
  selectedTag: Tag | null = null;
  loading = false;
  isFormPage = false; // New property to track if we're on form page

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tagForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      color: ['#3B82F6', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check if we're on a form page
    this.route.url.subscribe(segments => {
      const path = segments.map(segment => segment.path).join('/');
      this.isFormPage = path === 'new' || path.startsWith('edit/');
      
      if (path === 'new') {
        this.openNewTagDialog();
      } else if (path.startsWith('edit/')) {
        const tagId = parseInt(segments[1]?.path || '0');
        if (tagId) {
          this.loadTagForEdit(tagId);
        }
      }
    });
    
    if (!this.isFormPage) {
      this.loadTags();
    }
  }

  loadTags(): void {
    this.loading = true;
    this.tagService.getTags().subscribe({
      next: (tags: Tag[]) => {
        this.tags = tags;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading tags:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tags'
        });
        this.loading = false;
      }
    });
  }

  loadTagForEdit(tagId: number): void {
    this.loading = true;
    this.tagService.getTag(tagId).subscribe({
      next: (tag: Tag) => {
        this.isEditMode = true;
        this.selectedTag = tag;
        this.tagForm.patchValue({
          name: tag.name,
          color: tag.color
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading tag:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tag'
        });
        this.router.navigate(['/tags']);
        this.loading = false;
      }
    });
  }

  openNewTagDialog(): void {
    this.isEditMode = false;
    this.selectedTag = null;
    this.tagForm.reset();
    this.tagForm.patchValue({
      name: '',
      color: '#3B82F6'
    });
    
    if (this.isFormPage) {
      // We're on the form page, just set up the form
      return;
    } else {
      // We're on the list page, show dialog
      this.showTagDialog = true;
    }
  }

  openEditTagDialog(tag: Tag): void {
    this.isEditMode = true;
    this.selectedTag = tag;
    this.tagForm.patchValue({
      name: tag.name,
      color: tag.color
    });
    
    if (this.isFormPage) {
      // Navigate to edit page
      this.router.navigate(['/tags/edit', tag.id]);
    } else {
      // Show dialog
      this.showTagDialog = true;
    }
  }

  onSubmit(): void {
    if (this.tagForm.valid) {
      const tagRequest: TagRequest = {
        name: this.tagForm.value.name.trim(),
        color: this.tagForm.value.color
      };

      if (this.isEditMode && this.selectedTag) {
        this.updateTag(this.selectedTag.id!, tagRequest);
      } else {
        this.createTag(tagRequest);
      }
    }
  }

  createTag(tagRequest: TagRequest): void {
    this.tagService.createTag(tagRequest).subscribe({
      next: (tag: Tag) => {
        this.tags.push(tag);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag created successfully'
        });
        
        if (this.isFormPage) {
          this.router.navigate(['/tags']);
        } else {
          this.showTagDialog = false;
          this.loadTags();
        }
        
        this.tagForm.reset();
      },
      error: (error: any) => {
        console.error('Error creating tag:', error);
        let errorMessage = 'Failed to create tag';
        if (error.status === 409) {
          errorMessage = 'A tag with this name already exists';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  updateTag(id: number, tagRequest: TagRequest): void {
    this.tagService.updateTag(id, tagRequest).subscribe({
      next: (updatedTag: Tag) => {
        const index = this.tags.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tags[index] = updatedTag;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag updated successfully'
        });
        
        if (this.isFormPage) {
          this.router.navigate(['/tags']);
        } else {
          this.showTagDialog = false;
          this.loadTags();
        }
        
        this.tagForm.reset();
      },
      error: (error: any) => {
        console.error('Error updating tag:', error);
        let errorMessage = 'Failed to update tag';
        if (error.status === 409) {
          errorMessage = 'A tag with this name already exists';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  confirmDelete(tag: Tag): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the tag "${tag.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTag(tag.id!);
      }
    });
  }

  deleteTag(id: number): void {
    this.tagService.deleteTag(id).subscribe({
      next: () => {
        this.tags = this.tags.filter(t => t.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag deleted successfully'
        });
      },
      error: (error: any) => {
        console.error('Error deleting tag:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete tag'
        });
      }
    });
  }

  onDialogHide(): void {
    this.tagForm.reset();
    this.selectedTag = null;
    this.isEditMode = false;
  }

  onCancel(): void {
    if (this.isFormPage) {
      this.router.navigate(['/tags']);
    } else {
      this.showTagDialog = false;
      this.onDialogHide();
    }
  }
}
