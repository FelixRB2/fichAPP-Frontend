import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environment';
import { Fichaje } from '../interface/attendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fichajes`;

  async iniciarJornada(idUsuario: string, comentario: string = ''): Promise<Fichaje> {
    return await firstValueFrom(
      this.http.post<Fichaje>(`${this.baseUrl}`, { idUsuario, comentario })
    );
  }

  async detenerJornada(idFichaje: string): Promise<Fichaje> {
    return await firstValueFrom(
      this.http.put<Fichaje>(`${this.baseUrl}/${idFichaje}/salida`, {})
    );
  }

  async obtenerHistorial(idUsuario: string): Promise<Fichaje[]> {
    return await firstValueFrom(
      this.http.get<Fichaje[]>(`${this.baseUrl}/usuario/${idUsuario}`)
    );
  }

  async obtenerDatosDashboard(idUsuario: string): Promise<any> {
    const datos = await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/dashboard/${idUsuario}`)
    );

    // Mapeo selectivo: Backend (Inglés) -> Frontend (Español)
    return {
      historialReciente: datos.recentHistory || [],
      fichajeActivo: datos.activeFichaje || null,
      horasSemanalesFormateadas: datos.weeklyHours || '0h 00m',
      porcentajeSemanal: datos.weeklyPercentage || 0
    };
  }
}
