import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = signal<any>(null);
  
  stats = signal({
    totalEmployees: 24,
    activeNow: 18,
    averageHours: 38.5,
    lateArrivals: 2
  });

  recentActivity = signal([
    { name: 'Carlos Ruíz', action: 'Entrada', time: '08:02', status: 'On-time' },
    { name: 'Ana Belén', action: 'Entrada', time: '07:55', status: 'On-time' },
    { name: 'David M.', action: 'Salida', time: '17:30', status: 'Completed' },
    { name: 'Laura G.', action: 'Entrada', time: '09:15', status: 'Late' },
    { name: 'Jorge Pérez', action: 'Entrada', time: '08:10', status: 'On-time' },
  ]);

  ngOnInit() {
    this.userData.set(this.authService.getUserData());
  }

  logout() {
    this.authService.logout();
  }
}
