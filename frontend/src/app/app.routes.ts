import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./components/profile-edit.component').then(m => m.ProfileEditComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign_in',
    loadComponent: () => import('./components/sign-in.component').then(m => m.SignInComponent)
  },
];
