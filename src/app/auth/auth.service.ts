import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../features/user/models/user';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  register(data: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  // Ya existente:
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, data);
  }
}
