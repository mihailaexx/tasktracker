import { Tag } from './tag.model';

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  tagIds?: number[];
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}