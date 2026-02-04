import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    // Verificar rol si es requerido
    const requiredRole = route.data['role'] as string | undefined;
    if (requiredRole && !authService.hasRole(requiredRole)) {
        router.navigate(['/access-denied']);
        return false;
    }

    return true;
};
