import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  // Formulario reactivo
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Toggle mostrar/ocultar contraseña
   */
  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.errorMessage.set(null);
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // La redirección la maneja el AuthService automáticamente
      },
      error: (error) => {
        const message = error.error?.message || 'Email o contraseña incorrectos';
        this.errorMessage.set(message);
      }
    });
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Helpers para validación en template
   */
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get isLoading() {
    return this.authService.isLoading();
  }
}