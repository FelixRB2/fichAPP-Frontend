import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe, TitleCasePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { Router } from '@angular/router';
import { User } from 'src/app/interface/user';
import { Fichaje } from 'src/app/interface/attendance';

import { Sidebar } from './sidebar';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, CommonModule, Sidebar, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class PanelAdministrador implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private enrutador = inject(Router);

  datosUsuario = signal<any>(null);
  fechaActual = signal(new Date());

  // Lista de usuarios y filtrado
  trabajadores = this.authService.trabajadores;
  seccionActiva = signal<'resumen' | 'usuarios'>('usuarios');

  // Detalle de usuario seleccionado
  usuarioSeleccionado = signal<User | null>(null);
  registrosUsuario = signal<Fichaje[]>([]);
  filtroTemporal = signal<'hoy' | 'semana' | 'mes' | 'todos'>('todos'); // Para compatibilidad
  
  // Nuevos selectores detallados
  tipoFiltro = signal<'dia' | 'semana' | 'mes' | 'todos'>('todos');
  fechaFiltro = signal<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  // UI - Creación y Edición de usuario
  mostrarFormCrear = signal(false);
  usuarioAEditar = signal<User | null>(null);

  nuevoUsuario = signal({
    nombre: '',
    apellido1: '',
    apellido2: '',
    puesto: '',
    horasSemanales: 40,
    email: '',
    password: '',
    rol: 'TRABAJADOR'
  });

  // Estadísticas globales (reactivas a la lista de trabajadores)
  estadisticas = computed(() => {
    const users = this.trabajadores();
    return {
      totalEmpleados: users.length,
      activosAhora: users.filter(u => u.activo).length,
      mediaHoras: 38.5,
      retrasosHoy: 2
    };
  });

  // Registros filtrados dinámicos para el usuario seleccionado
  registrosFiltrados = computed(() => {
    const registros = this.registrosUsuario();
    const tipo = this.tipoFiltro();
    const fechaRef = this.fechaFiltro();
    if (!fechaRef || tipo === 'todos') return registros;

    const dRef = new Date(fechaRef);
    
    return registros.filter(r => {
      const dReg = new Date(r.fecha);
      
      if (tipo === 'dia') {
        return dReg.toDateString() === dRef.toDateString();
      }
      
      if (tipo === 'mes') {
        return dReg.getMonth() === dRef.getMonth() && dReg.getFullYear() === dRef.getFullYear();
      }
      
      if (tipo === 'semana') {
        // Calcular inicio y fin de la semana de la fecha de referencia
        const day = dRef.getDay();
        const diff = dRef.getDate() - day + (day === 0 ? -6 : 1);
        const inicioSemana = new Date(dRef);
        inicioSemana.setDate(diff);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        finSemana.setHours(23, 59, 59, 999);
        
        return dReg >= inicioSemana && dReg <= finSemana;
      }
      
      return true;
    });
  });

  // Resumen del periodo seleccionado
  resumenPeriodo = computed(() => {
    const filtrados = this.registrosFiltrados();
    const usuario = this.usuarioSeleccionado();
    const tipo = this.tipoFiltro();
    const fechaRef = this.fechaFiltro();
    
    if (!usuario) return null;

    const horasTotales = filtrados.reduce((acc, curr) => acc + (curr.horasTrabajadas || 0), 0);
    const horasSemanales = usuario.horasSemanales || 40;
    
    let horasObjetivo = 0;
    if (tipo === 'dia') {
      horasObjetivo = horasSemanales / 5;
    } else if (tipo === 'semana') {
      horasObjetivo = horasSemanales;
    } else if (tipo === 'mes') {
      // Cálculo aproximado por días laborables (lun-vie)
      const d = new Date(fechaRef);
      const año = d.getFullYear();
      const mes = d.getMonth();
      let diasLaborables = 0;
      const totalDias = new Date(año, mes + 1, 0).getDate();
      for (let i = 1; i <= totalDias; i++) {
        const diaSemana = new Date(año, mes, i).getDay();
        if (diaSemana !== 0 && diaSemana !== 6) diasLaborables++;
      }
      horasObjetivo = (horasSemanales / 5) * diasLaborables;
    }

    return {
      total: horasTotales,
      objetivo: horasObjetivo,
      porcentaje: horasObjetivo > 0 ? Math.min(100, (horasTotales / horasObjetivo) * 100) : 0,
      cumplido: horasTotales >= horasObjetivo
    };
  });

  async ngOnInit() {
    this.datosUsuario.set(this.authService.getUserData());
    setInterval(() => this.fechaActual.set(new Date()), 1000);
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      await this.authService.getUsers();
    } catch (error) {
      console.error('Error al cargar usuarios', error);
    }
  }

  // --- Edición de Usuario ---
  abrirEdicion(user: User) {
    this.usuarioAEditar.set({ ...user });
  }

  cerrarEdicion() {
    this.usuarioAEditar.set(null);
  }

  async guardarEdicion() {
    const user = this.usuarioAEditar();
    if (!user) return;

    // Mapeo: Frontend -> Backend (Spring Boot ActualizarUsuarioRequest)
    const backendData = {
      nombreRol: user.rol === 'Administrador' ? 'Administrador' : 'Trabajador',
      nombre: user.nombre,
      apellido1: user.apellido1,
      apellido2: user.apellido2,
      correo: user.email,
      puesto: user.puesto,
      horasSemanales: user.horasSemanales,
      contrasena: user.password,
      activo: user.activo
    };

    try {
      await this.authService.updateUser(user.id, backendData);
      this.cerrarEdicion();
      await this.cargarUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario', error);
    }
  }

  // --- Selección de Usuario y Drill-down ---
  async verHistorial(usuario: User) {
    this.usuarioSeleccionado.set(usuario);
    this.seccionActiva.set('usuarios'); // Asegurar que estamos en la sección de usuarios
    try {
      const logs = await this.attendanceService.obtenerHistorial(usuario.id.toString());
      this.registrosUsuario.set(logs);
    } catch (error) {
      console.error('Error al cargar historial', error);
    }
  }

  // --- Acciones de Gestión ---
  async crearUsuario() {
    const data = this.nuevoUsuario();
    if (!data.nombre || !data.email || !data.password) {
      alert('Por favor, rellena todos los campos.');
      return;
    }

    // Mapeo: Frontend -> Backend (Spring Boot Request Model)
    const backendData = {
      nombreRol: data.rol.charAt(0).toUpperCase() + data.rol.slice(1).toLowerCase(), // 'Trabajador' o 'Administrador'
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2,
      email: data.email,
      puesto: data.puesto,
      horasSemanales: data.horasSemanales,
      contrasena: data.password
    };

    console.log('backendData:', backendData);

    try {
      await this.authService.register(backendData);
      this.mostrarFormCrear.set(false);
      this.nuevoUsuario.set({ nombre: '', apellido1: '', apellido2: '', puesto: '', horasSemanales: 40, email: '', password: '', rol: 'TRABAJADOR' });
      await this.cargarUsuarios();
    } catch (error) {
      console.error('Error al crear usuario', error);
    }
  }

  async borrarUsuario(id: number) {
    if (confirm('¿Seguro que quieres eliminar este usuario permanentemente?')) {
      try {
        await this.authService.deleteUser(id);
        if (this.usuarioSeleccionado()?.id === id) {
          this.usuarioSeleccionado.set(null);
          this.registrosUsuario.set([]);
        }
      } catch (error) {
        console.error('Error al borrar usuario', error);
      }
    }
  }

  

  // --- UI Helpers ---
  cambiarSeccion(seccion: 'resumen' | 'usuarios') {
    this.seccionActiva.set(seccion);
    if (seccion === 'resumen') this.usuarioSeleccionado.set(null);
  }

  cambiarFiltro(nuevoFiltro: 'dia' | 'semana' | 'mes' | 'todos') {
    this.tipoFiltro.set(nuevoFiltro);
  }

  cambiarFechaFiltro(nuevaFecha: string) {
    this.fechaFiltro.set(nuevaFecha);
  }

  cambiarNuevoUsuario(campo: string, valor: string) {
    const finalValue = campo === 'horasSemanales' ? Number(valor) : valor;
    this.nuevoUsuario.update(u => ({ ...u, [campo]: finalValue }));
  }

  formatearTiempo(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '--:--';
    const minutosTotales = Math.round(valor * 60);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;
    if (horas === 0) return `${minutos}m`;
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }
}



