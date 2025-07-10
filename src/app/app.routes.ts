import { Routes } from '@angular/router';
import { LoginComponent } from './ui/pages/login/login.component';
import { HomeComponent } from './ui/pages/home/home.component';
import { PanelComponent } from './ui/pages/panel/panel.component';
import { MedicalRecordsComponent } from './ui/pages/medical-records/medical-records.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'panel', component: PanelComponent },
  { path: 'records', component: MedicalRecordsComponent },
  
];
