import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../features/user/models/user';
import { AuthService } from '../../../auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Record } from '../../../features/medicalRecord/models/record';
import { MedicalRecordService } from '../../../features/medicalRecord/medical-record.service';
import { UserService } from '../../../features/user/user.service';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    InputTextModule,
    TableModule,
    ButtonModule,
    FormsModule,
    DatePickerModule,
    SelectModule
  ],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.css'
})
export class MedicalRecordsComponent implements OnInit {
  currentUser!: User;
  patients: User[] = [];
  records: Record[] = [];
  rangeDates: Date[] | undefined;
  selectedPatient: User | undefined;
  recordNumber: string = '';
  patientOptions: any[] = [];

  constructor(
    private authService: AuthService,
    private recordService: MedicalRecordService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    if (this.authService.getUser()) {
      this.currentUser = this.authService.getUser() as User;
    }
    this.getRecords();
    if (this.currentUser.role === 'doctor') {
      this.loadPatients();
    }
  }

  loadPatients(): void {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return;
    }
    this.userService.getPatients(this.currentUser.id).subscribe({
      next: (data) => {
        this.patients = data;
        this.patientOptions = data.map(patient => ({
          label: `${patient.name} ${patient.lastname}`,
          value: patient
        }));
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
      }
    });
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
    return this.patients;
  }

  applyFilters(): void {
    // Si hay al menos una fecha seleccionada
    if (this.rangeDates && this.rangeDates.length > 0 && this.rangeDates[0]) {
      // Si solo hay una fecha, usa la misma para inicio y fin
      const startDate = this.rangeDates[0].toISOString().split('T')[0];
      const endDate = (this.rangeDates[1] ? this.rangeDates[1] : this.rangeDates[0]).toISOString().split('T')[0];

      if (this.currentUser.role === 'doctor') {
        const doctorId = this.currentUser.id!;
        let patientId = this.selectedPatient?.id!;

        if (patientId) {
          this.recordService.getPatientMedicalRecordsByRange(patientId, startDate, endDate).subscribe({
            next: (data) => {
              this.records = this.filterByRecordNumber(data);
            },
            error: (error) => {
              console.error('Error filtrando por paciente y rango:', error);
            }
          });
        } else {
          this.recordService.getDoctorMedicalRecordsByRange(doctorId, startDate, endDate).subscribe({
            next: (data) => {
              this.records = this.filterByRecordNumber(data);
            },
            error: (error) => {
              console.error('Error filtrando por doctor y rango:', error);
            }
          });
        }
      } else if (this.currentUser.role === 'patient') {
        const patientId = this.currentUser.id!;
        this.recordService.getPatientMedicalRecordsByRange(patientId, startDate, endDate).subscribe({
          next: (data) => {
            this.records = this.filterByRecordNumber(data);
          },
          error: (error) => {
            console.error('Error filtrando por paciente y rango:', error);
          }
        });
      }
    } else if (this.recordNumber) {
      this.records = this.filterByRecordNumber(this.records);
    } else {
      this.getRecords();
    }
  }

  // Método auxiliar para filtrar por número de expediente
  filterByRecordNumber(records: Record[]): Record[] {
    if (!this.recordNumber) return records;
    return records.filter(record => record.id.toString().includes(this.recordNumber));
  }
}