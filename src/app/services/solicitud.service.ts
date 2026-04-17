import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environment';
import { Solicitud } from '../interface/attendance';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  async obtenerPendientes(): Promise<Solicitud[]> {
    return await firstValueFrom(
      this.http.get<Solicitud[]>(`${this.baseUrl}/pendientes`)
    );
  }

  async obtenerPorUsuario(idUsuario: string): Promise<Solicitud[]> {
    return await firstValueFrom(
      this.http.get<Solicitud[]>(`${this.baseUrl}/usuario/${idUsuario}`)
    );
  }

  async crearSolicitudCorreccion(data: {
    idUsuario: string;
    idFichaje: string;
    nuevaHoraEntrada: string | null;
    nuevaHoraSalida: string | null;
    comentario: string;
  }): Promise<Solicitud> {
    return await firstValueFrom(
      this.http.post<Solicitud>(`${this.baseUrl}/correccion`, data)
    );
  }

  async resolverSolicitud(idSolicitud: string, aprobado: boolean, idRevisor: string): Promise<Solicitud> {
    return await firstValueFrom(
      this.http.put<Solicitud>(`${this.baseUrl}/${idSolicitud}/resolver?aprobado=${aprobado}&idRevisor=${idRevisor}`, {})
    );
  }
}
