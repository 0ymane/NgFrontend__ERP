import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '@features/tickets/services/ticket.service';
import { TicketStore } from '@features/tickets/ticket.store';
import { CommandPaletteSearchResponse, ActionOption, TicketSearchResult, ProductSearchResult, UserSearchResult } from '@shared/models/search';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" (click)="close()"></div>

      <!-- Palette Box -->
      <div class="relative w-full max-w-xl bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
        <!-- Search Input -->
        <div class="flex items-center px-4 border-b border-slate-800 bg-slate-950/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <input
            #searchInput
            type="text"
            [(ngModel)]="query"
            (ngModelChange)="onSearch()"
            (keydown)="handleKeyDown($event)"
            placeholder="Search tickets, products, users, or type a command..."
            class="w-full py-4 pl-3 bg-transparent border-0 outline-none text-slate-100 placeholder-slate-500 font-sans text-sm focus:ring-0"
          />
          <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/60 rounded">ESC</kbd>
        </div>

        <!-- Results Stream -->
        <div class="max-h-[350px] overflow-y-auto p-2 space-y-2.5">
          <!-- Default message / Searching state -->
          <div *ngIf="loading()" class="text-center py-6 text-slate-400 text-xs">
            Searching...
          </div>
          <div *ngIf="!loading() && query.trim() === '' && results.actions.length === 0" class="text-center py-6 text-slate-500 text-xs">
            Start typing to search tickets, products, and users...
          </div>

          <!-- Actions Group -->
          <div *ngIf="results.actions.length > 0">
            <div class="px-3 py-1 text-[10px] font-bold text-teal-400 uppercase tracking-wider">Commands & Actions</div>
            <div class="mt-1 space-y-0.5">
              <div
                *ngFor="let item of results.actions; let idx = index"
                [class.selected]="isSelected('actions', idx)"
                (mouseenter)="setSelection('actions', idx)"
                (click)="triggerAction(item)"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 text-slate-200"
              >
                <div class="flex items-center space-x-2.5">
                  <span class="w-2 h-2 rounded-full bg-teal-500/80 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
                  <span class="text-xs font-semibold">{{ item.label }}</span>
                </div>
                <span class="text-[10px] text-slate-500 uppercase font-bold">{{ item.category }}</span>
              </div>
            </div>
          </div>

          <!-- Tickets Group -->
          <div *ngIf="results.tickets.length > 0">
            <div class="px-3 py-1 text-[10px] font-bold text-teal-400 uppercase tracking-wider">Tickets</div>
            <div class="mt-1 space-y-0.5">
              <div
                *ngFor="let item of results.tickets; let idx = index"
                [class.selected]="isSelected('tickets', idx)"
                (mouseenter)="setSelection('tickets', idx)"
                (click)="navigateToTicket(item)"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 text-slate-200"
              >
                <div class="flex items-center space-x-2.5">
                  <span class="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-800 border border-slate-700 rounded text-slate-300">{{ item.id }}</span>
                  <span class="text-xs font-semibold truncate max-w-[280px]">{{ item.title }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] text-slate-500">{{ item.productName }}</span>
                  <span
                    [class]="getStatusBadgeClass(item.status)"
                    class="px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase"
                  >
                    {{ item.status.replace('_', ' ') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Group -->
          <div *ngIf="results.products.length > 0">
            <div class="px-3 py-1 text-[10px] font-bold text-teal-400 uppercase tracking-wider">Products</div>
            <div class="mt-1 space-y-0.5">
              <div
                *ngFor="let item of results.products; let idx = index"
                [class.selected]="isSelected('products', idx)"
                (mouseenter)="setSelection('products', idx)"
                (click)="switchProduct(item)"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 text-slate-200"
              >
                <div class="flex items-center space-x-2.5">
                  <span class="px-1.5 py-0.5 text-[9px] font-extrabold bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 uppercase">{{ item.key }}</span>
                  <span class="text-xs font-semibold">{{ item.name }}</span>
                </div>
                <span class="text-[10px] text-slate-500 font-medium">Switch Context</span>
              </div>
            </div>
          </div>

          <!-- Users Group -->
          <div *ngIf="results.users.length > 0">
            <div class="px-3 py-1 text-[10px] font-bold text-teal-400 uppercase tracking-wider">Users</div>
            <div class="mt-1 space-y-0.5">
              <div
                *ngFor="let item of results.users; let idx = index"
                [class.selected]="isSelected('users', idx)"
                (mouseenter)="setSelection('users', idx)"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-default transition-all text-slate-200"
              >
                <div class="flex items-center space-x-2.5">
                  <div class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                    {{ item.name ? item.name.charAt(0) : item.email.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-xs font-semibold">{{ item.name || item.email }}</div>
                    <div class="text-[9px] text-slate-500">{{ item.email }}</div>
                  </div>
                </div>
                <span class="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/40 rounded-md uppercase">{{ item.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .selected {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      transform: translateX(2px);
    }
  `]
})
export class CommandPaletteComponent implements OnInit {
  isOpen = signal<boolean>(false);
  query = '';
  loading = signal<boolean>(false);

  results: CommandPaletteSearchResponse = {
    tickets: [],
    products: [],
    users: [],
    actions: []
  };

  // Keyboard navigation tracking
  selectedType: 'actions' | 'tickets' | 'products' | 'users' = 'actions';
  selectedIndex = 0;

  private ticketService = inject(TicketService);
  private ticketStore = inject(TicketStore);
  private router = inject(Router);

  @ViewChild('searchInput') searchInputEl!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    // Initial action population for empty state
    this.populateInitialActions();
    (window as any).toggleCommandPalette = () => this.toggle();
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        const isEditable = tag === 'input' || tag === 'textarea' || activeEl.hasAttribute('contenteditable') || (activeEl as HTMLElement).contentEditable === 'true';
        if (isEditable) {
          return;
        }
      }
      event.preventDefault();
      this.toggle();
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.isOpen.set(true);
      this.query = '';
      this.populateInitialActions();
      setTimeout(() => {
        this.searchInputEl?.nativeElement?.focus();
      }, 50);
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  populateInitialActions(): void {
    this.results = {
      tickets: [],
      products: [],
      users: [],
      actions: [
        { id: 'create_ticket', label: 'Create Ticket...', category: 'TICKET_ACTION', command: 'create_ticket' },
        { id: 'view_dashboard', label: 'View Dashboard', category: 'NAVIGATION', command: 'navigate', parameter: '/dashboard' },
        { id: 'view_my_tickets', label: 'View My Tickets', category: 'NAVIGATION', command: 'navigate', parameter: '/board?filter=mine' }
      ]
    };
    this.selectedType = 'actions';
    this.selectedIndex = 0;
  }

  async onSearch(): Promise<void> {
    if (this.query.trim() === '') {
      this.populateInitialActions();
      return;
    }

    this.loading.set(true);
    try {
      const loc = this.router.url;
      const res = await firstValueFrom(this.ticketService.searchCommandPalette(this.query, loc));
      this.results = res;
      this.resetSelection();
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      this.loading.set(false);
    }
  }

  resetSelection(): void {
    if (this.results.actions.length > 0) {
      this.selectedType = 'actions';
    } else if (this.results.tickets.length > 0) {
      this.selectedType = 'tickets';
    } else if (this.results.products.length > 0) {
      this.selectedType = 'products';
    } else if (this.results.users.length > 0) {
      this.selectedType = 'users';
    }
    this.selectedIndex = 0;
  }

  isSelected(type: string, index: number): boolean {
    return this.selectedType === type && this.selectedIndex === index;
  }

  setSelection(type: 'actions' | 'tickets' | 'products' | 'users', index: number): void {
    this.selectedType = type;
    this.selectedIndex = index;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveSelection(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveSelection(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.executeSelected();
    }
  }

  moveSelection(direction: number): void {
    const order: Array<'actions' | 'tickets' | 'products' | 'users'> = [];
    if (this.results.actions.length > 0) order.push('actions');
    if (this.results.tickets.length > 0) order.push('tickets');
    if (this.results.products.length > 0) order.push('products');
    if (this.results.users.length > 0) order.push('users');

    if (order.length === 0) return;

    let currentOrderIdx = order.indexOf(this.selectedType);
    let newIndex = this.selectedIndex + direction;

    const currentGroupLength = this.getGroupLength(this.selectedType);

    if (newIndex >= currentGroupLength) {
      // Go to next group
      currentOrderIdx = (currentOrderIdx + 1) % order.length;
      this.selectedType = order[currentOrderIdx];
      this.selectedIndex = 0;
    } else if (newIndex < 0) {
      // Go to previous group
      currentOrderIdx = (currentOrderIdx - 1 + order.length) % order.length;
      this.selectedType = order[currentOrderIdx];
      this.selectedIndex = this.getGroupLength(this.selectedType) - 1;
    } else {
      this.selectedIndex = newIndex;
    }
  }

  getGroupLength(type: string): number {
    if (type === 'actions') return this.results.actions.length;
    if (type === 'tickets') return this.results.tickets.length;
    if (type === 'products') return this.results.products.length;
    if (type === 'users') return this.results.users.length;
    return 0;
  }

  executeSelected(): void {
    if (this.selectedType === 'actions' && this.results.actions[this.selectedIndex]) {
      this.triggerAction(this.results.actions[this.selectedIndex]);
    } else if (this.selectedType === 'tickets' && this.results.tickets[this.selectedIndex]) {
      this.navigateToTicket(this.results.tickets[this.selectedIndex]);
    } else if (this.selectedType === 'products' && this.results.products[this.selectedIndex]) {
      this.switchProduct(this.results.products[this.selectedIndex]);
    }
  }

  triggerAction(action: ActionOption): void {
    this.close();
    if (action.command === 'navigate' && action.parameter) {
      this.router.navigateByUrl(action.parameter);
    } else if (action.command === 'create_ticket') {
      // Broadcast / open create ticket modal
      (window as any).openCreateTicketModal?.();
    } else if (action.command === 'set_status' && action.parameter) {
      const active = this.ticketStore.activeTicket();
      if (active) {
        this.ticketStore.transitionStatus(active.id, action.parameter as any);
      }
    } else if (action.command === 'change_priority' && action.parameter) {
      const active = this.ticketStore.activeTicket();
      if (active) {
        this.ticketStore.updateTicket(active.id, {
          title: active.title,
          description: active.description || undefined,
          priority: action.parameter as any,
          type: active.type,
          assigneeId: active.assigneeId
        });
      }
    } else if (action.command === 'assign_to_me') {
      const active = this.ticketStore.activeTicket();
      if (active) {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          this.ticketStore.updateTicket(active.id, {
            title: active.title,
            description: active.description || undefined,
            priority: active.priority,
            type: active.type,
            assigneeId: currentUser.userId
          });
        }
      }
    }
  }

  navigateToTicket(ticket: TicketSearchResult): void {
    this.close();
    this.router.navigate(['/board'], { queryParams: { ticketId: ticket.numericId } });
    this.ticketStore.selectTicket(ticket.numericId);
  }

  switchProduct(product: ProductSearchResult): void {
    this.close();
    this.ticketStore.selectProduct({
      id: product.id,
      name: product.name,
      key: product.key,
      description: null,
      createdAt: new Date().toISOString()
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BACKLOG': return 'bg-slate-800/80 text-slate-400 border border-slate-700/60';
      case 'IN_PROGRESS': return 'bg-sky-500/10 text-sky-400 border border-sky-500/25';
      case 'IN_REVIEW': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';
      case 'DONE': return 'bg-teal-500/10 text-teal-400 border border-teal-500/25';
      default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
    }
  }
}
