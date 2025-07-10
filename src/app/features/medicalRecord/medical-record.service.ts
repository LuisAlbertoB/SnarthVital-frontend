import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Record } from './models/record';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private apiUrl = environment.API_URL;

  constructor(private authService: AuthService, private http: HttpClient) { }

  getDoctorMedicalRecords(doctor_id: number): Observable<Record[]> {
    return this.http.get<Record[]>(`${this.apiUrl}/doctors/${doctor_id}/medicalRecords`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  getPatientMedicalRecords(patient_id: number): Observable<Record[]> {
    return this.http.get<Record[]>(`${this.apiUrl}/patients/${patient_id}/medicalRecords`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }
}
