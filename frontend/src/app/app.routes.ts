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
    path: 'employments/new',
    loadComponent: () => import('./components/employment-form.component').then(m => m.EmploymentFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'employments/:id',
    loadComponent: () => import('./components/employment.component').then(m => m.EmploymentComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'employments/:id/edit',
    loadComponent: () => import('./components/employment-form.component').then(m => m.EmploymentFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'shifts/:id',
    loadComponent: () => import('./components/shift.component').then(m => m.ShiftComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'shifts/:id/edit',
    loadComponent: () => import('./components/shift-edit.component').then(m => m.ShiftEditComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign_in',
    loadComponent: () => import('./components/sign-in.component').then(m => m.SignInComponent)
  },
];
