import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../features/user/user.service';
import { MedicalRecordService } from '../../../features/medicalRecord/medical-record.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../features/user/models/user';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    DropdownModule,
    CalendarModule,
    ButtonModule,
  ],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css']
})
export class PatientHistoryComponent implements OnInit {
  searchTerm = '';
  patients: User[] = [];

  selectedState: any;
  selectedStation: any;
  startDate: Date | undefined;
  endDate: Date | undefined;

  stateOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: 'active' },
    { label: 'Crítico', value: 'critical' },
    { label: 'Alta', value: 'discharged' },
  ];

  stationOptions = [
    { label: 'Todas las estaciones', value: null },
    { label: 'Estación 1', value: 'station1' },
    { label: 'Estación 2', value: 'station2' },
  ];

  constructor(
    private userService: UserService,
    private medicalRecordService: MedicalRecordService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (!user || user.role !== 'doctor') {
        console.warn('Usuario no disponible o no es doctor');
        return;
      }

      const doctorId = user.id;

      this.userService.getPatients(doctorId!).subscribe({
        next: (allPatients) => {
          this.medicalRecordService.getDoctorMedicalRecords(doctorId!).subscribe({
            next: (records) => {
              const patientIdsWithRecords = new Set(records.map(r => r.patient_id));
              this.patients = allPatients.filter(p => p.id !== undefined && patientIdsWithRecords.has(p.id));
            },
            error: (err) => console.error('Error al obtener expedientes:', err),
          });
        },
        error: (error) => {
          console.error('Error al obtener pacientes:', error);
        },
      });
    });
  }
}
