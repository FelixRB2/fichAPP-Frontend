import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TitleCasePipe],
  template: `
    <nav class="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col z-50 transition-all duration-300 shadow-2xl">
      <!-- Logo -->
      <div class="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-zinc-900/50">
        <div class="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
        <span class="hidden lg:block ml-4 text-white font-black tracking-tight text-xl">fichar<span class="text-indigo-500">APP</span></span>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 py-10 space-y-2 px-3 lg:px-4">
        <a routerLink="/dashboard" routerLinkActive="bg-white/5 text-indigo-400 border-indigo-500/50 shadow-inner shadow-indigo-500/5" class="group cursor-pointer flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border border-transparent transition-all duration-200">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900/50 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </div>
          <span class="hidden lg:block font-bold text-sm tracking-wide">Panel de Control</span>
        </a>

        @if (authService.getRole()?.includes('admin')) {
          <a routerLink="/admin" routerLinkActive="bg-white/5 text-indigo-400 border-indigo-500/50 shadow-inner shadow-indigo-500/5" class="group cursor-pointer flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border border-transparent transition-all duration-200">
            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900/50 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="hidden lg:block font-bold text-sm tracking-wide">Administración</span>
          </a>

          <button class="group cursor-pointer flex w-full items-center justify-center lg:justify-start gap-4 p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border border-transparent transition-all duration-200">
            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900/50 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            </div>
            <span class="hidden lg:block font-bold text-sm tracking-wide">Informes</span>
          </button>
        }

        <button class="group cursor-pointer flex w-full items-center justify-center lg:justify-start gap-4 p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border border-transparent transition-all duration-200">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900/50 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
          </div>
          <span class="hidden lg:block font-bold text-sm tracking-wide">Ajustes</span>
        </button>
      </div>

      <!-- Profile Section -->
      <div class="p-4 border-t border-zinc-900/50 mb-4">
        <div class="flex items-center gap-4 p-2 lg:bg-zinc-900/30 lg:border lg:border-zinc-800/50 lg:rounded-2xl group transition-all">
          <div class="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black shrink-0 shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform">
            {{ (authService.getUserData()?.nombre?.charAt(0) || 'U') | titlecase }}
          </div>
          <div class="hidden lg:block overflow-hidden">
            <p class="text-xs font-black text-white truncate">{{ authService.getUserData()?.nombre }}</p>
            <p class="text-[10px] font-bold text-zinc-500 truncate uppercase mt-0.5 tracking-widest">{{ authService.getRole() }}</p>
          </div>
        </div>
        
        <button (click)="logout()" class="mt-4 flex w-full items-center justify-center lg:justify-start gap-4 p-3 rounded-xl bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800/50 transition-all duration-200 active:scale-95 cursor-pointer">
          <div class="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </div>
          <span class="hidden lg:block font-black text-[10px] uppercase tracking-[0.2em]">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Sidebar {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
