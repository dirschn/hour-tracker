import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () => import('./users/index/users-index.component').then(m => m.UsersIndexComponent)
  },
  {
    path: 'users/new',
    loadComponent: () => import('./users/new/users-new.component').then(m => m.UsersNewComponent)
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./users/edit/users-edit.component').then(m => m.UsersEditComponent)
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/index/companies-index.component').then(m => m.CompaniesIndexComponent)
  },
  {
    path: 'companies/new',
    loadComponent: () => import('./companies/new/companies-new.component').then(m => m.CompaniesNewComponent)
  },
  {
    path: 'companies/:id/edit',
    loadComponent: () => import('./companies/edit/companies-edit.component').then(m => m.CompaniesEditComponent)
  }
];
