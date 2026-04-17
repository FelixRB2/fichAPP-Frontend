export interface Fichaje {
  idFichajes: string;
  usuario: any;
  fecha: string; // ISO date YYYY-MM-DD
  horaEntrada: string; // HH:mm:ss
  horaSalida: string | null; // HH:mm:ss or null
  minutosDescanso: number;
  horasTrabajadas: number | null;
  estado: 'normal' | 'editado' | 'pendiente_revision';
  comentario: string;
  horaEntradaPropuesta?: string;
  horaSalidaPropuesta?: string;
}

export interface Solicitud {
  idSolicitud: string;
  usuario: any;
  revisor?: any;
  tipo: 'vacaciones' | 'permiso_horas' | 'baja_medica' | 'correccion_fichaje';
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaInicio: string;
  fechaFin: string;
  motivo?: 'error_entrada' | 'error_salida' | 'olvido_fichaje' | 'problema_tecnico' | 'otro';
  comentario: string;
  fichajeRef?: Fichaje;
  horaEntradaPropuesta?: string;
  horaSalidaPropuesta?: string;
  fechaRevision?: string;
  createdAt?: string;
}
