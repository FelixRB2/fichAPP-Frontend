import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe, UpperCasePipe, NgClass, TitleCasePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { Router } from '@angular/router';
import { Fichaje } from '../../interface/attendance';

import { Sidebar } from '../admin/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, NgClass, TitleCasePipe, CommonModule, Sidebar],
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
  filtroTemporal = signal<'hoy' | 'semana' | 'mes' | 'todos'>('todos');

  // Historial filtrado dinámico
  historialFiltrado = computed(() => {
    const registros = this.historial();
    const filtro = this.filtroTemporal();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (filtro === 'todos') return registros;

    return registros.filter(r => {
      const fechaReg = new Date(r.fecha);
      fechaReg.setHours(0, 0, 0, 0);
      
      if (filtro === 'hoy') {
        return fechaReg.getTime() === hoy.getTime();
      }
      
      if (filtro === 'semana') {
        const tempHoy = new Date(hoy);
        const diff = tempHoy.getDate() - tempHoy.getDay() + (tempHoy.getDay() === 0 ? -6 : 1);
        const primerDiaSemana = new Date(tempHoy.setDate(diff));
        primerDiaSemana.setHours(0, 0, 0, 0);
        return fechaReg >= primerDiaSemana;
      }
      
      if (filtro === 'mes') {
        return fechaReg.getMonth() === hoy.getMonth() && 
               fechaReg.getFullYear() === hoy.getFullYear();
      }
      
      return true;
    });
  });

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
      const datos = await this.attendanceService.obtenerDatosDashboard(idUsuario);
      
      this.historial.set(datos.historialReciente);
      this.fichajeActivo.set(datos.fichajeActivo);
      this.fichado.set(!!datos.fichajeActivo);
      this.horasSemanales.set(datos.horasSemanalesFormateadas);
      this.porcentajeSemanal.set(datos.porcentajeSemanal);

      if (datos.fichajeActivo) {
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
          await this.attendanceService.detenerJornada(activo.idFichajes);
        }
      } else {
        await this.attendanceService.iniciarJornada(idUsuario, 'Entrada desde Dashboard');
      }
      await this.cargarDatos();
    } catch (error) {
      alert('Error al fichar: ' + error);
    }
  }

  cambiarFiltro(nuevoFiltro: 'hoy' | 'semana' | 'mes' | 'todos') {
    this.filtroTemporal.set(nuevoFiltro);
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

  formatearTiempo(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '--:--';
    const minutosTotales = Math.round(valor * 60);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;
    if (horas === 0 && minutos === 0 && valor > 0) return '< 1m';
    if (horas === 0) return `${minutos}m`;
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }

  logout() {
    this.authService.logout();
  }
}
