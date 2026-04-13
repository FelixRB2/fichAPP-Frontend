export interface User {
  id: number;
  nombre: string;
  apellido1?: string;
  apellido2?: string;
  puesto?: string;
  horasSemanales?: number;
  email?: string;
  password: string;
  rol: string;
  activo: boolean; // For suspension
  ultimaConexion?: string;
}
