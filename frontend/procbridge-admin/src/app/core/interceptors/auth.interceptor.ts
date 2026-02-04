import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Agregar token a request si existe
    const token = authService.getAccessToken();
    if (token && !req.url.includes('/auth/')) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error) => {
            // Si recibimos 401 y no es un endpoint de auth, intentar refresh
            if (error.status === 401 && !req.url.includes('/auth/')) {
                return authService.refreshToken().pipe(
                    switchMap((response) => {
                        // Reintentar request original con nuevo token
                        req = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${response.accessToken}`
                            }
                        });
                        return next(req);
                    }),
                    catchError((refreshError) => {
                        // Si el refresh falló, logout y redirect a login
                        authService.logout().subscribe();
                        router.navigate(['/login']);
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
