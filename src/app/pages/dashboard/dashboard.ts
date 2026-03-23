import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, UpperCasePipe, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = signal<any>(null);
  currentDate = signal(new Date());
  isClockedIn = signal(false);
  lastClockIn = signal<string | null>(null);
  
  history = signal([
    { date: '2026-03-23', duration: '8h 00m', status: 'Completado' },
    { date: '2026-03-22', duration: '7h 45m', status: 'Completado' },
    { date: '2026-03-21', duration: '8h 15m', status: 'Completado' }
  ]);

  ngOnInit() {
    this.userData.set(this.authService.getUserData());
    
    // Update clock every second
    setInterval(() => {
      this.currentDate.set(new Date());
    }, 1000);
  }

  toggleClock() {
    this.isClockedIn.update(val => !val);
    if (this.isClockedIn()) {
      this.lastClockIn.set(this.currentDate().toLocaleTimeString());
    }
  }

  logout() {
    this.authService.logout();
  }
}
