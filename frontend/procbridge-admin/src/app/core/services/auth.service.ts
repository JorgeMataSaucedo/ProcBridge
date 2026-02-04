import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserInfo, RefreshTokenRequest } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:5194/api';
    private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Cargar usuario del localStorage si existe
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    /**
     * Login con email y password
     */
    login(email: string, password: string): Observable<LoginResponse> {
        const request: LoginRequest = { email, password };

        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
            tap(response => {
                // Guardar tokens y usuario en localStorage
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
            })
        );
    }

    /**
     * Renovar access token usando refresh token
     */
    refreshToken(): Observable<LoginResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const request: RefreshTokenRequest = { refreshToken };

        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, request).pipe(
            tap(response => {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
            })
        );
    }

    /**
     * Logout y limpiar sesión
     */
    logout(): Observable<any> {
        const refreshToken = this.getRefreshToken();

        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);

        if (refreshToken) {
            const request: RefreshTokenRequest = { refreshToken };
            return this.http.post(`${this.baseUrl}/auth/logout`, request);
        }

        return new Observable(observer => observer.complete());
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        // Verificar si el token ha expirado (simple check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convertir a milliseconds
            return Date.now() < exp;
        } catch {
            return false;
        }
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }

    /**
     * Verificar si el usuario tiene un rol específico
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles.includes(role) ?? false;
    }

    /**
     * Obtener access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Obtener refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }
}
