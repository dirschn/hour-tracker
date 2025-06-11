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
  }
];
