import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';
import { User } from './models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getPatients(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API_URL}/doctors/${id}/patients`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }
}
