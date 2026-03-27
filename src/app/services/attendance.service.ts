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

  async startShift(userId: string, comment: string = ''): Promise<Fichaje> {
    return await firstValueFrom(
      this.http.post<Fichaje>(`${this.baseUrl}`, { idUsuario: userId, comentario: comment })
    );
  }

  async stopShift(fichajeId: string): Promise<Fichaje> {
    return await firstValueFrom(
      this.http.put<Fichaje>(`${this.baseUrl}/${fichajeId}/salida`, {})
    );
  }

  async getHistory(userId: string): Promise<Fichaje[]> {
    return await firstValueFrom(
      this.http.get<Fichaje[]>(`${this.baseUrl}/usuario/${userId}`)
    );
  }

  async getDashboardData(userId: string): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/dashboard/${userId}`)
    );
  }
}
