import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class PanelAdministrador implements OnInit {
  private authService = inject(AuthService);
  private enrutador = inject(Router);

  datosUsuario = signal<any>(null);
  fechaActual = signal(new Date());
  
  estadisticas = signal({
    totalEmpleados: 24,
    activosAhora: 18,
    mediaHoras: 38.5,
    retrasosHoy: 2
  });

  actividadReciente = signal([
    { nombre: 'Carlos Ruíz', accion: 'Entrada', tiempo: '08:02', estado: 'A tiempo' },
    { nombre: 'Ana Belén', accion: 'Entrada', tiempo: '07:55', estado: 'A tiempo' },
    { nombre: 'David M.', accion: 'Salida', tiempo: '17:30', estado: 'Completado' },
    { nombre: 'Laura G.', accion: 'Entrada', tiempo: '09:15', estado: 'Tarde' },
    { nombre: 'Jorge Pérez', accion: 'Entrada', tiempo: '08:10', estado: 'A tiempo' },
  ]);

  ngOnInit() {
    this.datosUsuario.set(this.authService.getUserData());
    
    // Reloj en tiempo real
    setInterval(() => {
      this.fechaActual.set(new Date());
    }, 1000);
  }

  /**
   * Formatea un número decimal de horas a una cadena legible (ej: 38.5 -> 38h 30m)
   * @param valor Horas en formato decimal
   */
  formatearTiempo(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '--:--';
    }

    // Calculamos minutos totales redondeando
    const minutosTotales = Math.round(valor * 60);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    // Formato amigable para menos de una hora
    if (horas === 0) {
      return `${minutos}m`;
    }

    // Formato estándar Xh YYm para visualización clara
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }

  logout() {
    this.authService.logout();
  }
}
