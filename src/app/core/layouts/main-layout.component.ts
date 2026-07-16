import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@features/auth/auth.store';
import { TicketStore } from '@features/tickets/ticket.store';
import { CommandPaletteComponent } from '@shared/components/command-palette/command-palette.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommandPaletteComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <!-- Header Navigation Bar -->
      <header class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <!-- Left: Logo & Scoped Switcher -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2 cursor-pointer" (click)="goToDashboard()">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              B
            </span>
            <span class="text-base font-black tracking-tight bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">B-Agile</span>
          </div>

          <!-- Product Switcher (Universal access, but UI binding to TicketStore) -->
          <div class="relative flex items-center" *ngIf="ticketStore.selectedProduct() && authStore.role() !== 'CLIENT'">
            <div class="h-4 w-px bg-slate-800 mr-4"></div>
            <div class="flex items-center space-x-1 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-lg">
              <span class="text-[10px] text-slate-500 font-bold uppercase mr-1">Product:</span>
              <select
                [ngModel]="ticketStore.selectedProduct()?.id"
                (ngModelChange)="onProductChange($event)"
                class="bg-transparent text-xs font-bold text-teal-400 border-0 outline-none pr-6 cursor-pointer focus:ring-0"
              >
                <option *ngFor="let p of ticketStore.products()" [value]="p.id" class="bg-slate-900 text-slate-100 font-semibold">
                  {{ p.name }} ({{ p.key }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Center: Quick Command Palette Info -->
        <div *ngIf="authStore.role() !== 'CLIENT'" class="hidden md:flex items-center bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl cursor-pointer hover:border-slate-700/50 transition-colors" (click)="openPalette()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <span class="text-xs text-slate-400 mr-4 font-medium">Search or command...</span>
          <kbd class="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-850 border border-slate-700/60 rounded">Ctrl+K</kbd>
        </div>

        <!-- Right: Nav Links & Profile Dropdown -->
        <div class="flex items-center space-x-4">
          <nav class="flex items-center space-x-1">
            <ng-container *ngIf="authStore.role() !== 'CLIENT'">
              <a
                routerLink="/dashboard"
                routerLinkActive="active-nav"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Dashboard
              </a>
              <a
                routerLink="/board"
                routerLinkActive="active-nav"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Kanban Board
              </a>
            </ng-container>
            <ng-container *ngIf="authStore.role() === 'CLIENT'">
              <a
                routerLink="/tickets"
                routerLinkActive="active-nav"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
              >
                My Tickets
              </a>
            </ng-container>
          </nav>

          <div class="h-4 w-px bg-slate-800"></div>

          <!-- User Info & Logout -->
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <span class="block text-xs font-bold text-slate-200">{{ authStore.currentUser()?.name || authStore.currentUser()?.email }}</span>
              <span class="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{{ authStore.currentUser()?.role }}</span>
            </div>
            <button
              (click)="authStore.logout()"
              class="p-2 bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-400 transition-all duration-300"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="flex-1 relative">
        <router-outlet></router-outlet>
      </main>

      <!-- Command Palette Overlay -->
      <app-command-palette #palette></app-command-palette>
    </div>
  `,
  styles: [`
    .active-nav {
      background: rgba(255, 255, 255, 0.05);
      color: rgb(241, 245, 249) !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  authStore = inject(AuthStore);
  ticketStore = inject(TicketStore);
  private router = inject(Router);

  ngOnInit(): void {
    this.ticketStore.loadProducts();
    this.ticketStore.loadUsers();
  }

  goToDashboard(): void {
    if (this.authStore.role() === 'CLIENT') {
      this.router.navigate(['/tickets']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onProductChange(productId: any): void {
    const found = this.ticketStore.products().find(p => p.id === Number(productId));
    if (found) {
      this.ticketStore.selectProduct(found);
    }
  }

  openPalette(): void {
    // Open palette globally
    const el = document.querySelector('app-command-palette');
    if (el) {
      const paletteComp = (el as any).__ngContext__?.[25] || (el as any)._component;
      if (paletteComp && typeof paletteComp.toggle === 'function') {
        paletteComp.toggle();
      } else {
        // Fallback: search components using trigger
        (window as any).toggleCommandPalette?.();
      }
    }
  }
}
