import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css']
})
export class PatientHistoryComponent {
  searchTerm = '';
  patients = [
    { name: 'Carlos Daniel Viencia Díaz' },
    { name: 'Maximiliano Díaz Clemente' },
    { name: 'Leonardo Daniel Velasco Gómez' },
    { name: 'Joaquín Gómez Molina' },
  ];
}
