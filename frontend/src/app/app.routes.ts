import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sign_in',
    loadComponent: () => import('./components/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/index/users-index.component').then(m => m.UsersIndexComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users/new',
    loadComponent: () => import('./users/new/users-new.component').then(m => m.UsersNewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./users/edit/users-edit.component').then(m => m.UsersEditComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/index/companies-index.component').then(m => m.CompaniesIndexComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'companies/new',
    loadComponent: () => import('./companies/new/companies-new.component').then(m => m.CompaniesNewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'companies/:id/edit',
    loadComponent: () => import('./companies/edit/companies-edit.component').then(m => m.CompaniesEditComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'positions',
    loadComponent: () => import('./positions/index/positions-index.component').then(m => m.PositionsIndexComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'positions/new',
    loadComponent: () => import('./positions/new/positions-new.component').then(m => m.PositionsNewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'positions/:id/edit',
    loadComponent: () => import('./positions/edit/positions-edit.component').then(m => m.PositionsEditComponent),
    canActivate: [AuthGuard]
  }
];
