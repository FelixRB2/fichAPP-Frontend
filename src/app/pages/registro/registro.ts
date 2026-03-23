import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido1: ['', [Validators.required]],
    apellido2: [''],
    email: ['', [Validators.required, Validators.email]],
    puesto: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  async onSubmit() {
    if (this.registroForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      try {
        const response = await this.authService.register(this.registroForm.value);
        console.log('Registro exitoso', response);
        this.router.navigate(['/login']); // Redirigir al login tras el registro
      } catch (err) {
        this.isLoading.set(false);
        this.errorMessage.set('Error al crear la cuenta. Inténtalo de nuevo.');
        console.error('Error en registro', err);
      }
    }
  }
}
