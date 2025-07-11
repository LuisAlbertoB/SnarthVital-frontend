import { Routes } from '@angular/router';
import { LoginComponent } from './ui/pages/login/login.component';
import { HomeComponent } from './ui/pages/home/home.component';
import { PanelComponent } from './ui/pages/panel/panel.component';
import { MedicalRecordsComponent } from './ui/pages/medical-records/medical-records.component';
import { PatientHistoryComponent } from './ui/pages/patient-history/patient-history.component';
import {CreatePacienteComponent} from './ui/pages/create-paciente/create-paciente.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'panel', component: PanelComponent },
  { path: 'records', component: MedicalRecordsComponent },
  { path: 'history', component: PatientHistoryComponent },
  { path: 'createPaciente', component: CreatePacienteComponent},
  
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./ui/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./ui/pages/home/home.component').then(m => m.HomeComponent)
  },
    {
        path: 'panel',
        loadComponent: () => import('./ui/pages/panel/panel.component').then(m => m.PanelComponent)
    },
    {
        path: 'history',
        loadComponent: () => import('./ui/pages/patient-history/patient-history.component').then(m => m.PatientHistoryComponent)
},
  {    path: 'createPaciente', 
       loadComponent: () => import('./ui/pages/create-paciente/create-paciente.component').then(m => m.CreatePacienteComponent)

   },
];
