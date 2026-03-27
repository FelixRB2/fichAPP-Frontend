import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, UpperCasePipe, NgClass, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { Router } from '@angular/router';
import { Fichaje } from '../../interface/attendance';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, NgClass, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class PanelControl implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private enrutador = inject(Router);

  datosUsuario = signal<any>(null);
  fechaActual = signal(new Date());
  fichado = signal(false);
  fichajeActivo = signal<Fichaje | null>(null);
  tiempoTranscurrido = signal('00:00:00');
  
  historial = signal<Fichaje[]>([]);
  horasSemanales = signal('0h 00m');
  porcentajeSemanal = signal(0);

  ngOnInit() {
    this.datosUsuario.set(this.authService.getUserData());
    this.cargarDatos();
    
    // Actualizar reloj y temporizador cada segundo
    setInterval(() => {
      this.fechaActual.set(new Date());
      if (this.fichado()) {
        this.actualizarTemporizador();
      }
    }, 1000);
  }

  async cargarDatos() {
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) return;

    try {
      const datos = await this.attendanceService.getDashboardData(idUsuario);
      
      this.historial.set(datos.recentHistory);
      this.fichajeActivo.set(datos.activeFichaje);
      this.fichado.set(!!datos.activeFichaje);
      this.horasSemanales.set(datos.weeklyHours);
      this.porcentajeSemanal.set(datos.weeklyPercentage);

      if (datos.activeFichaje) {
        this.actualizarTemporizador();
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  }

  async commutarFichaje() {
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) return;

    try {
      if (this.fichado()) {
        const activo = this.fichajeActivo();
        if (activo) {
          await this.attendanceService.stopShift(activo.idFichajes);
        }
      } else {
        await this.attendanceService.startShift(idUsuario, 'Entrada desde Dashboard');
      }
      await this.cargarDatos();
    } catch (error) {
      alert('Error al fichar: ' + error);
    }
  }

  actualizarTemporizador() {
    const activo = this.fichajeActivo();
    if (!activo) return;

    // Parsear tiempo del backend (HH:mm:ss) y fecha (YYYY-MM-DD)
    const inicioStr = `${activo.fecha}T${activo.horaEntrada}`;
    const inicio = new Date(inicioStr);
    const ahora = new Date();
    
    const diferencia = Math.max(0, ahora.getTime() - inicio.getTime());
    
    const horas = Math.floor(diferencia / 3600000);
    const minutos = Math.floor((diferencia % 3600000) / 60000);
    const segundos = Math.floor((diferencia % 60000) / 1000);

    this.tiempoTranscurrido.set(
      `${this.rellenarCeros(horas)}:${this.rellenarCeros(minutos)}:${this.rellenarCeros(segundos)}`
    );
  }

  private rellenarCeros(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * Convierte un valor de horas decimales (ej: 0.02) a un formato legible por humanos (ej: 1m o 1h 30m)
   * @param valor El valor numérico de las horas trabajadas
   * @returns Una cadena formateada para mostrar en la interfaz
   */
  formatearTiempo(valor: number | null | undefined): string {
    // Si no hay valor registrado, devolvemos un marcador vacío
    if (valor === null || valor === undefined) {
      return '--:--';
    }

    // Convertimos las horas decimales a minutos totales redondeando para mayor precisión
    const minutosTotales = Math.round(valor * 60);
    
    // Calculamos cuántas horas completas y cuántos minutos sobran
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    // Caso especial: si el tiempo es muy corto (menos de 1 minuto) pero existe actividad
    if (horas === 0 && minutos === 0 && valor > 0) {
      return '< 1m';
    }

    // Si es menos de una hora, mostramos solo los minutos
    if (horas === 0) {
      return `${minutos}m`;
    }

    // Si hay horas, mostramos formato "Xh YYm" asegurando dos dígitos en los minutos
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }

  logout() {
    this.authService.logout();
  }
}
