import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService } from '@features/tickets/services/ticket.service';
import { TicketStore } from '@features/tickets/ticket.store';
import { Ticket, TicketStatus } from '@shared/models/ticket';
import { Product } from '@shared/models/product';
import { firstValueFrom } from 'rxjs';

interface ProductWithMetrics {
  product: Product;
  total: number;
  backlog: number;
  active: number;
  done: number;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Title & SLA Banner -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 class="text-3xl font-black text-slate-50 tracking-tight">Dashboard</h1>
          <p class="text-xs text-slate-400 mt-1">Unified analytics command center for B-Agile ticketing</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>

      <!-- Metrics Cards -->
      <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <!-- Backlog Card -->
        <div class="metric-card bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Backlog</span>
            <span class="p-1.5 rounded-lg bg-slate-800/80 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </span>
          </div>
          <div class="text-3xl font-black text-slate-100 mt-4">{{ backlogCount() }}</div>
          <div class="text-[10px] text-slate-500 mt-1">Awaiting triage & scheduling</div>
        </div>

        <!-- Active Card -->
        <div class="metric-card bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
            <span class="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 0M4 16.24v1c0 1.1.9 2 2 2h12a2 2 0 002-2v-1M4 16.24L6.18 6.18A2 2 0 018.14 4.5h7.72a2 2 0 011.96 1.68L20 16.24M4 16.24h16" />
              </svg>
            </span>
          </div>
          <div class="text-3xl font-black text-sky-400 mt-4">{{ activeCount() }}</div>
          <div class="text-[10px] text-sky-500/80 mt-1">In Progress or In Review</div>
        </div>

        <!-- Resolution Card -->
        <div class="metric-card bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Rate</span>
            <span class="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="text-3xl font-black text-teal-400 mt-4">{{ resolutionRate() }}%</div>
          <div class="text-[10px] text-teal-500/80 mt-1">{{ doneCount() }} total tickets completed</div>
        </div>

        <!-- SLA Breaches Card -->
        <div class="metric-card bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Warning</span>
            <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
          </div>
          <div class="text-3xl font-black text-amber-400 mt-4">{{ slaBreachCount() }}</div>
          <div class="text-[10px] text-amber-500/80 mt-1">Open tickets &gt; 24h old</div>
        </div>
      </div>

      <!-- Scoped Execution Products -->
      <div *ngIf="!loading()" class="bg-slate-900/30 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <h2 class="text-lg font-bold text-slate-100 mb-4 flex items-center justify-between">
          <span>Product Execution Scope</span>
          <span class="text-xs font-normal text-slate-500">Click a product to open its focused board</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            *ngFor="let item of productMetrics()"
            (click)="selectProductAndGo(item.product)"
            class="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-850/60 transition-all duration-300 group"
          >
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="px-1.5 py-0.5 text-[9px] font-extrabold bg-teal-500/15 border border-teal-500/30 rounded text-teal-400 uppercase tracking-wider">{{ item.product.key }}</span>
                <span class="text-sm font-bold text-slate-200 group-hover:text-slate-50 transition-colors">{{ item.product.name }}</span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium truncate max-w-[280px]">
                {{ item.product.description || 'No description provided' }}
              </p>
            </div>

            <!-- Mini counts layout -->
            <div class="flex items-center space-x-3 text-right">
              <div>
                <span class="block text-xs font-black text-slate-200">{{ item.total }}</span>
                <span class="text-[9px] text-slate-500 uppercase font-semibold">Total</span>
              </div>
              <div class="w-px h-6 bg-slate-800"></div>
              <div>
                <span class="block text-xs font-black text-sky-400">{{ item.active }}</span>
                <span class="text-[9px] text-sky-500/80 uppercase font-semibold">Active</span>
              </div>
              <div class="w-px h-6 bg-slate-800"></div>
              <div>
                <span class="block text-xs font-black text-teal-400">{{ item.done }}</span>
                <span class="text-[9px] text-teal-500/80 uppercase font-semibold">Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  private ticketService = inject(TicketService);
  private ticketStore = inject(TicketStore);
  private router = inject(Router);

  loading = signal<boolean>(true);
  allTickets = signal<Ticket[]>([]);
  products = signal<Product[]>([]);

  // Computed Selectors
  backlogCount = computed(() => this.allTickets().filter(t => t.status === 'BACKLOG').length);
  activeCount = computed(() => this.allTickets().filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length);
  doneCount = computed(() => this.allTickets().filter(t => t.status === 'DONE').length);

  resolutionRate = computed(() => {
    const total = this.allTickets().length;
    if (total === 0) return 0;
    return Math.round((this.doneCount() / total) * 100);
  });

  slaBreachCount = computed(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.allTickets().filter(t => {
      if (t.isSlaBreached !== undefined) {
        return t.isSlaBreached;
      }
      const open = t.status !== 'DONE' && t.status !== 'CANCELLED';
      const created = new Date(t.createdAt);
      return open && created < oneDayAgo;
    }).length;
  });

  productMetrics = computed(() => {
    return this.products().map(p => {
      const pTickets = this.allTickets().filter(t => t.projectId === p.id);
      return {
        product: p,
        total: pTickets.length,
        backlog: pTickets.filter(t => t.status === 'BACKLOG').length,
        active: pTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length,
        done: pTickets.filter(t => t.status === 'DONE').length
      };
    });
  });

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      const prods = await firstValueFrom(this.ticketService.getProducts());
      this.products.set(prods);

      const ticketPromises = prods.map(p => firstValueFrom(this.ticketService.getTickets(p.id)));
      const ticketLists = await Promise.all(ticketPromises);
      const combined = ticketLists.reduce((acc, current) => acc.concat(current), [] as Ticket[]);
      this.allTickets.set(combined);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      this.loading.set(false);
    }
  }

  selectProductAndGo(product: Product): void {
    this.ticketStore.selectProduct(product);
    this.router.navigate(['/board']);
  }
}
