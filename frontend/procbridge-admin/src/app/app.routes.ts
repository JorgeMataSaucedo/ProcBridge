import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'playground',
        loadComponent: () => import('./features/playground/playground.component')
            .then(m => m.PlaygroundComponent),
        canActivate: [authGuard]
    },
    {
        path: 'catalog',
        loadComponent: () => import('./features/catalog/catalog-list.component')
            .then(m => m.CatalogListComponent),
        canActivate: [authGuard]
    },
    {
        path: 'logs',
        loadComponent: () => import('./features/logs/logs.component')
            .then(m => m.LogsComponent),
        canActivate: [authGuard]
    }
];
