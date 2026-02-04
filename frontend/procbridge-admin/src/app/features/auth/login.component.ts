import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, CardModule],
    template: `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="logo">PB</div>
                    <h1>ProcBridge</h1>
                    <p>Dynamic Stored Procedure Execution</p>
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input 
                            pInputText 
                            id="email" 
                            type="email" 
                            formControlName="email"
                            [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                            placeholder="admin@procbridge.local"
                        />
                        <small *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-text">
                            Email inválido
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            pInputText 
                            id="password" 
                            type="password" 
                            formControlName="password"
                            [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                            placeholder="••••••••"
                        />
                        <small *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-text">
                            Password requerido
                        </small>
                    </div>

                    <div *ngIf="errorMessage" class="error-banner">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errorMessage }}
                    </div>

                    <button 
                        pButton 
                        type="submit" 
                        label="Iniciar Sesión" 
                        [loading]="loading"
                        [disabled]="loginForm.invalid || loading"
                        class="login-button"
                    ></button>
                </form>

                <div class="login-footer">
                    <p class="hint">💡 Usuario de prueba:</p>
                    <code>admin@procbridge.local / Admin123!</code>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--black-pure);
            padding: 1rem;
        }

        .login-card {
            width: 100%;
            max-width: 420px;
            background: var(--black-elevated);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-lg);
            padding: 2.5rem;
            box-shadow: var(--shadow-md);
        }

        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .logo {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 24px;
            letter-spacing: -0.5px;
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 0.5rem;
        }

        p {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0;
        }

        form {
            margin-bottom: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        input {
            width: 100%;
        }

        input.error {
            border-color: var(--accent-red) !important;
        }

        .error-text {
            display: block;
            color: var(--accent-red);
            font-size: 12px;
            margin-top: 0.25rem;
        }

        .error-banner {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--accent-red);
            border-radius: var(--radius-sm);
            color: var(--accent-red);
            padding: 0.75rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 13px;
        }

        .login-button {
            width: 100%;
            padding: 0.875rem !important;
            font-weight: 600 !important;
            font-size: 15px !important;
        }

        .login-footer {
            text-align: center;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-subtle);
        }

        .hint {
            color: var(--text-tertiary);
            font-size: 12px;
            margin-bottom: 0.5rem;
        }

        code {
            display: block;
            background: var(--black-pure);
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 12px;
            color: var(--accent-blue);
        }
    `]
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.errorMessage = '';

        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Error de autenticación. Verifica tus credenciales.';
            }
        });
    }
}
