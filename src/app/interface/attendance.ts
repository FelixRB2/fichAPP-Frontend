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
}
