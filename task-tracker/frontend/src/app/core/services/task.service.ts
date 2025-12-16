import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(userId?: number): Observable<Task[]> {
    if (userId) {
      return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`);
    }
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: TaskRequest, userId?: number): Observable<Task> {
    if (userId) {
      return this.http.post<Task>(`${this.apiUrl}/user/${userId}`, task);
    }
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: TaskRequest, userId?: number): Observable<Task> {
    if (userId) {
      return this.http.put<Task>(`${this.apiUrl}/user/${userId}/task/${id}`, task);
    }
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number, userId?: number): Observable<void> {
    if (userId) {
      return this.http.delete<void>(`${this.apiUrl}/user/${userId}/task/${id}`);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchTasks(query: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}