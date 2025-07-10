import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../features/user/models/user';
import { AuthService } from '../../../auth/auth.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Record } from '../../../features/medicalRecord/models/record';
import { MedicalRecordService } from '../../../features/medicalRecord/medical-record.service';
import { UserService } from '../../../features/user/user.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, NavbarComponent, DropdownModule,
    CalendarModule,
    InputTextModule,
    TableModule,
    ButtonModule],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.css'
})
export class MedicalRecordsComponent implements OnInit {
  currentUser!: User
  patients: User[] = [];
  records: Record[] = [];
  constructor(private authService : AuthService, private recordService : MedicalRecordService, private userService: UserService) { }

  ngOnInit(): void {
    if (this.authService.getUser()) {
      this.currentUser = this.authService.getUser() as User;
    }
    this.getRecords();
    
  }

  getRecords(): Record[] {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return [];
    }
    if (this.currentUser.role === 'doctor') {
      this.recordService.getDoctorMedicalRecords(this.currentUser.id).subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (error) => {
          console.error('Error fetching doctor medical records:', error);
        }
      });
    } else if (this.currentUser.role === 'patient') {
      this.recordService.getPatientMedicalRecords(this.currentUser.id).subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (error) => {
          console.error('Error fetching patient medical records:', error);
        }
      });
    }
    return this.records;
  }

  getPatients(): User[] {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return [];
    }
    this.userService.getPatients(this.currentUser.id).subscribe({
      next: (data) => {
        console.log('Fetched patients:', data);
        this.patients = data;
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
      }
    });
    return this.patients;
  }

}
