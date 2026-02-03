import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
    },
    {
        path: 'playground',
        loadComponent: () => import('./features/playground/playground.component')
            .then(m => m.PlaygroundComponent)
    },
    {
        path: 'catalog',
        loadComponent: () => import('./features/catalog/catalog-list.component')
            .then(m => m.CatalogListComponent)
    },
    {
        path: 'logs',
        loadComponent: () => import('./features/logs/logs.component')
            .then(m => m.LogsComponent)
    }
];
