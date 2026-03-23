import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido1: ['', [Validators.required]],
    apellido2: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const credentials = {
        nombre: this.loginForm.value.nombre!,
        apellido1: this.loginForm.value.apellido1!,
        apellido2: this.loginForm.value.apellido2!,
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!
      };

      try {
        const response = await this.authService.login(credentials);
        console.log('Login exitoso', response);
        // Redirigir según el rol
        if (response.rol.toLowerCase() === 'admin') {
          this.router.navigate(['/admin']); 
        } else {
          this.router.navigate(['/dashboard']); 
        }
      } catch (err) {
        this.isLoading.set(false);
        this.errorMessage.set('Correo o contraseña incorrectos');
        console.error('Error en login', err);
      }
    }
  }
}
