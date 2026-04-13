import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from '../interface/auth-response';
import { environment } from 'src/environment';
import { User } from '../interface/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  trabajadores = signal<User[]>([]);

  async login(credentials: any): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
    );

    console.log('Respuesta completa del servidor:', response);

    if (response) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.rol.toLowerCase());
      localStorage.setItem('userId', response.id.toString());
      localStorage.setItem('userData', JSON.stringify(response));
    }

    return response; 
  } 

  getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }

  async register(userData: any): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/register`, userData, {
        responseType: 'text' as 'json'
      })
    );
  }

  private readonly userBaseUrl = `${environment.apiUrl}/usuarios`;

  async getUsers(): Promise<User[]> {
    const rawUsers = await firstValueFrom(
      this.http.get<any[]>(`${this.userBaseUrl}`)
    );
    
    // Mapeo selectivo: Backend -> Frontend
    const mappedUsers = rawUsers.map(u => this.mapUser(u));
    
    this.trabajadores.set(mappedUsers);
    return mappedUsers;
  }

  private mapUser(u: any): User {
    // Manejo de Rol (u.rol.nombreRol en el backend)
    let roleName = 'TRABAJADOR';
    if (u.rol && typeof u.rol === 'object') {
      roleName = u.rol.nombreRol || roleName;
    } else if (typeof u.rol === 'string') {
      roleName = u.rol;
    }

    // Manejo de Estado (u.estado en el backend: 'activo' o 'suspendido')
    const isActivo = u.estado === 'activo';

    return {
      id: u.idUsuario || u.id,
      nombre: u.nombre || u.name || 'Sin nombre',
      apellido1: u.apellido1 || '',
      apellido2: u.apellido2 || '',
      puesto: u.puesto || '',
      horasSemanales: u.horasSemanales || 40,
      email: u.correo || u.email,
      password: u.password,
      rol: roleName,
      activo: isActivo,
      ultimaConexion: u.ultimaConexion || u.lastLogin
    };
  }

  async deleteUser(id: string | number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.userBaseUrl}/${id}`)
    );
    this.trabajadores.update(users => users.filter(u => u.id !== id));
  }

  async updateUser(id: string | number, userData: any): Promise<void> {
    const updatedUser = await firstValueFrom(
      this.http.put<any>(`${this.userBaseUrl}/${id}`, userData)
    );
    this.trabajadores.update(users => 
      users.map(u => u.id === id ? this.mapUser(updatedUser) : u)
    );
  }

  async updateUserStatus(id: string | number, activo: boolean): Promise<void> {
    await firstValueFrom(
      this.http.patch<void>(`${this.userBaseUrl}/${id}/estado`, { activo })
    );
    this.trabajadores.update(users => 
      users.map(u => u.id === id ? { ...u, activo } : u)
    );
  }

  // --- Helpers ---

  getToken() { return localStorage.getItem('token'); }
  getRole() { return localStorage.getItem('userRole'); }
  getUserId() { return localStorage.getItem('userId'); }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
