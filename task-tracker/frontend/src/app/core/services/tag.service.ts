import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, TagRequest } from '../models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = '/api/tags';

  constructor(private http: HttpClient) { }

  /**
   * Get all tags for the current user
   */
  getTags(userId?: number): Observable<Tag[]> {
    if (userId) {
      return this.http.get<Tag[]>(`${this.apiUrl}/user/${userId}`);
    }
    return this.http.get<Tag[]>(this.apiUrl);
  }

  /**
   * Get a specific tag by ID
   */
  getTag(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new tag
   */
  createTag(tag: TagRequest): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  /**
   * Update an existing tag
   */
  updateTag(id: number, tag: TagRequest): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, tag);
  }

  /**
   * Delete a tag
   */
  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search tags by name
   */
  searchTags(query: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  /**
   * Get tag count for the current user
   */
  getTagCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
