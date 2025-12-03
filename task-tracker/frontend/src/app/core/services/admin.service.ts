import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = '/api/admin';

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    toggleUserEnabled(userId: number): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${userId}/enable`, {});
    }
}
