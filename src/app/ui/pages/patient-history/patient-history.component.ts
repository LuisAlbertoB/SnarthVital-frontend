import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../features/user/user.service';
import { User} from '../../../features/user/models/user';

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

  // Dropdowns
  selectedState: any;
  stateOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: 'active' },
    { label: 'Crítico', value: 'critical' },
    { label: 'Alta', value: 'discharged' },
  ];

  selectedStation: any;
  stationOptions = [
    { label: 'Todas las estaciones', value: null },
    { label: 'Estación 1', value: 'station1' },
    { label: 'Estación 2', value: 'station2' },
  ];

  // Fechas
  startDate: Date | undefined;
  endDate: Date | undefined;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const doctorId = Number(localStorage.getItem('doctor_id'));
    if (doctorId) {
      this.userService.getPatients(doctorId).subscribe({
        next: (data) => {
          this.patients = data;
        },
        error: (error) => {
          console.error('Error al obtener pacientes:', error);
        }
      });
    } else {
      console.warn('No se encontró doctor_id en localStorage.');
    }
  }
}
