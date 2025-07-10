import { Routes } from '@angular/router';

export const routes: Routes = [
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
];
