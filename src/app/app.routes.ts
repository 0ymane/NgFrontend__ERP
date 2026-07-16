import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layouts/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: 'board',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPPORT'] },
        loadComponent: () => import('./features/tickets/components/board-page/board-page.component').then(m => m.BoardPageComponent)
      },
      {
        path: 'tickets',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () => import('@features/tickets/components/tickets-portal-page/tickets-portal-page.component').then(m => m.TicketsPortalPageComponent)
      }
    ]
  }
];
