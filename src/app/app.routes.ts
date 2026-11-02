import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'lec', pathMatch: 'full' },
  { path: 'auth', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'lec', loadComponent: () => import('./lec/lec-list.component').then(m => m.LecListComponent) },
  { path: 'lec/edit/:id', loadComponent: () => import('./lec/lec-form.component').then(m => m.LecFormComponent) },
  { path: 'review/:id', loadComponent: () => import('./review/review.component').then(m => m.ReviewComponent) }
];