export interface AuthResponse {
  token: string;
  rol: string;
  nombre: string;
  id: number;
  user?: any; // To match the check in service
}
