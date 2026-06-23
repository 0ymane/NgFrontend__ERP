import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'sign-in',
        loadComponent: () => import('./pages/sign-in/sign-in-page.component').then(m => m.SignInPageComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./pages/sign-up/sign-up-page.component').then(m => m.SignUpPageComponent)
      }
    ]
  }
];
